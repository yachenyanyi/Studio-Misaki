from rest_framework import viewsets, permissions, status, views, authentication
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from .models import Article, SiteVisit, ChatThread, TokenUsage
from .serializers import ArticleSerializer, SiteVisitSerializer, ChatThreadSerializer, UserSummarySerializer, UserDetailSerializer, TokenUsageSerializer
import json
from .authentication import generate_token, JWTAuthentication
import datetime
import os
import requests
import logging
from django.contrib.auth.models import User
from .utils import SSEUsageExtractor
from .services import create_langgraph_thread, get_service_headers, ServiceUnavailable, get_langgraph_base_url, DEFAULT_TIMEOUT, LONG_TIMEOUT, THREAD_TIMEOUT, MAX_LIMIT
from .mixins import BaseAuthenticatedView, BaseAdminView

logger = logging.getLogger(__name__)
from django.conf import settings
from django.http import StreamingHttpResponse, HttpResponseRedirect
from django.core.paginator import Paginator

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all().order_by('-created_at')
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [] # Disable session auth for login to avoid CSRF

    def post(self, request):
        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        user = None
        if username_or_email:
            # 支持邮箱登录
            if '@' in username_or_email:
                from django.contrib.auth.models import User
                try:
                    u = User.objects.get(email__iexact=username_or_email.strip())
                    user = authenticate(request, username=u.username, password=password)
                except User.DoesNotExist:
                    return Response({'detail': '用户名或邮箱不存在'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                user = authenticate(request, username=username_or_email.strip(), password=password)
        else:
            return Response({'detail': '缺少用户名或邮箱'}, status=status.HTTP_400_BAD_REQUEST)
        if user is not None:
            login(request, user)
            token = generate_token(user)
            return Response({'detail': '登录成功', 'is_staff': user.is_staff, 'token': token})
        return Response({'detail': '密码错误'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(views.APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'Logged out successfully'})

class CheckAuthView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    def get(self, request):
        data = {
            'is_authenticated': request.user.is_authenticated,
            'is_staff': request.user.is_staff
        }
        if request.user.is_authenticated:
            data['username'] = request.user.username
            data['email'] = request.user.email
        return Response(data)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    def post(self, request):
        username = (request.data.get('username') or '').strip()
        email = (request.data.get('email') or '').strip().lower()
        password = request.data.get('password') or ''
        if not username or not password:
            return Response({'detail': '用户名和密码必填'}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 6:
            return Response({'detail': '密码长度至少6位'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username__iexact=username).exists():
            return Response({'detail': '用户名已存在'}, status=status.HTTP_400_BAD_REQUEST)
        if email and User.objects.filter(email__iexact=email).exists():
            return Response({'detail': '邮箱已被注册'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email or None, password=password)
        return Response({'detail': '注册成功'}, status=status.HTTP_201_CREATED)

class ChatConfigView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({
            'chainlit_base_url': getattr(settings, 'CHAINLIT_BASE_URL', 'http://localhost:8001'),
            'langgraph_api_url': getattr(settings, 'LANGGRAPH_API_URL', 'http://127.0.0.1:2024'),
            'token_ttl_seconds': 600,
            'aud': 'chainlit',
            'iss': 'django'
        })

class ChatAssistantsView(BaseAuthenticatedView):
    def get(self, request):
        api_url = get_langgraph_base_url()
        try:
            payload = {
                'metadata': {},
                'limit': MAX_LIMIT,
                'offset': 0
            }
            resp = requests.post(f'{api_url}/assistants/search', json=payload, headers=get_service_headers(), timeout=DEFAULT_TIMEOUT)
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '获取助手列表失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

class ChatGatewayView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        if request.user.is_authenticated:
            target = getattr(settings, 'CHAINLIT_BASE_URL', 'http://localhost:8001')
            return HttpResponseRedirect(target)
        next_url = request.GET.get('next') or '/chat'
        return HttpResponseRedirect(f'/login?next={next_url}')

def _assert_thread_owner(user, thread_id):
    try:
        ChatThread.objects.get(user=user, thread_id=thread_id)
        return True
    except ChatThread.DoesNotExist:
        return False

class ChatProxyThreadsView(BaseAuthenticatedView):
    def post(self, request):
        assistant_id = request.data.get('assistant_id') or 'intelligent_deep_assistant'
        title = request.data.get('title')
        
        try:
            thread_id = create_langgraph_thread(assistant_id)
        except ServiceUnavailable as e:
            return Response({'detail': e.detail}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({'detail': '后端线程服务不可用', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
            
        obj = ChatThread.objects.create(user=request.user, thread_id=thread_id, assistant_id=assistant_id, title=title)
        return Response(ChatThreadSerializer(obj).data, status=status.HTTP_201_CREATED)

class ChatProxyRunsWaitView(BaseAuthenticatedView):
    def post(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = get_langgraph_base_url()
        payload = request.data
        try:
            resp = requests.post(f'{api_url}/threads/{thread_id}/runs/wait', json=payload, headers=get_service_headers(), timeout=LONG_TIMEOUT)
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '运行失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class ChatProxyRunsStreamView(BaseAuthenticatedView):
    def post(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = get_langgraph_base_url()
        payload = request.data
        try:
            r = requests.post(f'{api_url}/threads/{thread_id}/runs/stream', json=payload, headers={'Authorization': get_service_headers()['Authorization'], 'Accept': 'text/event-stream', 'Content-Type': 'application/json'}, stream=True, timeout=LONG_TIMEOUT)
        except Exception as e:
            return Response({'detail': '流式运行失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        
        def event_stream():
            extractor = SSEUsageExtractor()
            
            # Use a smaller chunk size or iter_lines to avoid buffering in the proxy
            for chunk in r.iter_content(chunk_size=None): # chunk_size=None means it will yield whatever is received
                if chunk:
                    yield chunk
                    try:
                        extractor.process_chunk(chunk)
                    except Exception:
                        pass
            
            # Post-processing: Extract usage_metadata from the full stream content
            try:
                if extractor.last_usage:
                    TokenUsage.objects.create(
                        user=request.user,
                        thread_id=thread_id,
                        input_tokens=extractor.last_usage.get('input_tokens', 0),
                        output_tokens=extractor.last_usage.get('output_tokens', 0),
                        total_tokens=extractor.last_usage.get('total_tokens', 0),
                        model_name=payload.get('assistant_id', 'unknown')
                    )
            except Exception as e:
                logger.error(f"[ChatProxy] Error saving token usage: {e}")

        resp = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        return resp

class ChatProxyThreadView(BaseAuthenticatedView):
    def get(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = get_langgraph_base_url()
        try:
            resp = requests.get(f'{api_url}/threads/{thread_id}', headers=get_service_headers(), timeout=DEFAULT_TIMEOUT)
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '获取线程信息失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
            
    def patch(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = get_langgraph_base_url()
        try:
            resp = requests.patch(f'{api_url}/threads/{thread_id}', json=request.data, headers=get_service_headers(), timeout=DEFAULT_TIMEOUT)
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '更新线程失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

class ChatProxyThreadStateView(BaseAuthenticatedView):
    def get(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = get_langgraph_base_url()
        try:
            logger.info(f"[ChatProxy] Getting state for thread {thread_id} from {api_url}")
            resp = requests.get(f'{api_url}/threads/{thread_id}/state', headers=get_service_headers(), timeout=DEFAULT_TIMEOUT)
            logger.info(f"[ChatProxy] Response status: {resp.status_code}")
            
            content_type = resp.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                return Response(resp.json(), status=resp.status_code)
            else:
                return Response(resp.text, status=resp.status_code)
        except Exception as e:
            logger.error(f"[ChatProxy] Error: {e}")
            return Response({'detail': '获取线程状态失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
    
    def post(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = get_langgraph_base_url()
        try:
            resp = requests.post(f'{api_url}/threads/{thread_id}/state', json=request.data, headers=get_service_headers(), timeout=DEFAULT_TIMEOUT)
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '更新线程状态失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

class ChatProxyHistoryView(BaseAuthenticatedView):
    def get(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = get_langgraph_base_url()
        try:
            resp = requests.get(
                f'{api_url}/threads/{thread_id}/history', 
                params=request.GET,
                headers=get_service_headers(), 
                timeout=THREAD_TIMEOUT
            )
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '获取历史失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class DashboardStatsView(BaseAdminView):

    def get(self, request):
        # Total visits
        total_visits = SiteVisit.objects.count()
        
        # Recent 20 visits
        recent_visits = SiteVisit.objects.order_by('-timestamp')[:20]
        recent_visits_data = SiteVisitSerializer(recent_visits, many=True).data
        
        # Daily visits (last 7 days)
        last_7_days = datetime.datetime.now() - datetime.timedelta(days=7)
        daily_visits = SiteVisit.objects.filter(timestamp__gte=last_7_days)\
            .annotate(date=TruncDate('timestamp'))\
            .values('date')\
            .annotate(count=Count('id'))\
            .order_by('date')
            
        return Response({
            'total_visits': total_visits,
            'recent_visits': recent_visits_data,
            'daily_visits': list(daily_visits)
        })

class AdminTokenStatsView(BaseAdminView):

    def get(self, request):
        # Global stats
        total_tokens = TokenUsage.objects.aggregate(
            total=Sum('total_tokens'),
            input=Sum('input_tokens'),
            output=Sum('output_tokens')
        )
        
        # Daily stats (last 7 days)
        last_7_days = datetime.datetime.now() - datetime.timedelta(days=7)
        daily_usage = TokenUsage.objects.filter(timestamp__gte=last_7_days)\
            .annotate(date=TruncDate('timestamp'))\
            .values('date')\
            .annotate(
                total_tokens=Sum('total_tokens'),
                count=Count('id')
            )\
            .order_by('date')
            
        return Response({
            'global_stats': total_tokens,
            'daily_usage': list(daily_usage)
        })

class UserTokenUsageView(BaseAuthenticatedView):

    def get(self, request):
        user_id = request.GET.get('user_id')
        
        # If user_id is provided and request user is admin, show that user's stats
        if user_id and request.user.is_staff:
             target_user = User.objects.filter(id=user_id).first()
             if not target_user:
                 return Response({'detail': 'User not found'}, status=404)
             qs = TokenUsage.objects.filter(user=target_user)
        else:
             # Otherwise show current user's stats
             qs = TokenUsage.objects.filter(user=request.user)
             
        # Aggregate totals
        totals = qs.aggregate(
            total=Sum('total_tokens'),
            input=Sum('input_tokens'),
            output=Sum('output_tokens')
        )
        
        # Recent usage history
        history = qs.order_by('-timestamp')[:20]
        history_data = TokenUsageSerializer(history, many=True).data
        
        return Response({
            'totals': totals,
            'history': history_data
        })

class AdminUsersListView(BaseAdminView):
    def get(self, request):
        q = (request.GET.get('q') or '').strip()
        is_staff = request.GET.get('is_staff')
        page = int(request.GET.get('page') or 1)
        page_size = int(request.GET.get('page_size') or 10)
        qs = User.objects.all().order_by('-date_joined')
        if q:
            qs = qs.filter(models.Q(username__icontains=q) | models.Q(email__icontains=q))
        if is_staff in ('true', 'false'):
            qs = qs.filter(is_staff=(is_staff == 'true'))
        # annotate threads count
        qs = qs.annotate(threads_count=Count('chat_threads'))
        paginator = Paginator(qs, page_size)
        page_obj = paginator.get_page(page)
        data = UserSummarySerializer(page_obj.object_list, many=True).data
        return Response({
            'results': data,
            'page': page_obj.number,
            'page_size': page_size,
            'total': paginator.count,
            'pages': paginator.num_pages,
        })

class AdminUserDetailView(BaseAdminView):
    def get(self, request, user_id):
        try:
            u = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserDetailSerializer(u).data)
class ChatThreadViewSet(viewsets.ModelViewSet):
    serializer_class = ChatThreadSerializer
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'thread_id'
    
    def get_queryset(self):
        return ChatThread.objects.filter(user=self.request.user).order_by('-updated_at')
    
    def create(self, request, *args, **kwargs):
        assistant_id = request.data.get('assistant_id') or 'intelligent_deep_assistant'
        title = request.data.get('title')
        
        try:
            thread_id = create_langgraph_thread(assistant_id)
        except ServiceUnavailable as e:
            return Response({'detail': e.detail}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({'detail': '后端线程服务不可用', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
            
        obj = ChatThread.objects.create(user=request.user, thread_id=thread_id, assistant_id=assistant_id, title=title)
        return Response(ChatThreadSerializer(obj).data, status=status.HTTP_201_CREATED)
    
    def partial_update(self, request, *args, **kwargs):
        obj = self.get_object()
        title = request.data.get('title')
        if title is not None:
            obj.title = title
            obj.save()
        return Response(ChatThreadSerializer(obj).data)
    
    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ChatThreadHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, thread_id):
        # thread_id 为 ChatThread 的 UUID 字符串
        try:
            ct = ChatThread.objects.get(thread_id=thread_id, user=request.user)
        except ChatThread.DoesNotExist:
            return Response({'detail': '未找到线程'}, status=status.HTTP_404_NOT_FOUND)
        api_url = os.getenv('LANGGRAPH_API_URL', 'http://127.0.0.1:2024')
        try:
            resp = requests.get(f'{api_url}/threads/{ct.thread_id}/history', timeout=10)
            if resp.status_code != 200:
                return Response({'detail': '获取历史失败', 'status': resp.status_code, 'error': resp.text}, status=status.HTTP_502_BAD_GATEWAY)
            return Response(resp.json())
        except Exception as e:
            return Response({'detail': '后端线程服务不可用', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
