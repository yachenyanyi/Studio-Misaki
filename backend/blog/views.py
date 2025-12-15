from rest_framework import viewsets, permissions, status, views, authentication
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.db.models import Count
from django.db.models.functions import TruncDate
from .models import Article, SiteVisit, ChatThread
from .serializers import ArticleSerializer, SiteVisitSerializer, ChatThreadSerializer, UserSummarySerializer, UserDetailSerializer
from .authentication import generate_token, JWTAuthentication
import datetime
import os
import requests
from django.contrib.auth.models import User
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

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

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
        return Response({
            'is_authenticated': request.user.is_authenticated,
            'is_staff': request.user.is_staff
        })

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]
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

class ChatGatewayView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        if request.user.is_authenticated:
            target = getattr(settings, 'CHAINLIT_BASE_URL', 'http://localhost:8001')
            return HttpResponseRedirect(target)
        next_url = request.GET.get('next') or '/chat'
        return HttpResponseRedirect(f'/login?next={next_url}')

def _service_headers():
    token = getattr(settings, 'SERVICE_TOKEN_SECRET', '')
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    return headers

def _assert_thread_owner(user, thread_id):
    try:
        ChatThread.objects.get(user=user, thread_id=thread_id)
        return True
    except ChatThread.DoesNotExist:
        return False

class ChatProxyThreadsView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        assistant_id = request.data.get('assistant_id') or 'intelligent_deep_assistant'
        title = request.data.get('title')
        api_url = getattr(settings, 'LANGGRAPH_API_URL', 'http://127.0.0.1:2024')
        try:
            resp = requests.post(f'{api_url}/threads', json={'metadata': {'assistant_id': assistant_id}}, headers=_service_headers(), timeout=15)
            data = resp.json()
            thread_id = data.get('thread_id') or data.get('id')
            if not thread_id:
                return Response({'detail': '无法创建线程', 'error': data}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({'detail': '后端线程服务不可用', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        obj = ChatThread.objects.create(user=request.user, thread_id=thread_id, assistant_id=assistant_id, title=title)
        return Response(ChatThreadSerializer(obj).data, status=status.HTTP_201_CREATED)

class ChatProxyRunsWaitView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = getattr(settings, 'LANGGRAPH_API_URL', 'http://127.0.0.1:2024')
        payload = request.data
        try:
            resp = requests.post(f'{api_url}/threads/{thread_id}/runs/wait', json=payload, headers=_service_headers(), timeout=60)
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '运行失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

class ChatProxyRunsStreamView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = getattr(settings, 'LANGGRAPH_API_URL', 'http://127.0.0.1:2024')
        payload = request.data
        try:
            r = requests.post(f'{api_url}/threads/{thread_id}/runs/stream', json=payload, headers={'Authorization': _service_headers()['Authorization'], 'Accept': 'text/event-stream', 'Content-Type': 'application/json'}, stream=True, timeout=60)
        except Exception as e:
            return Response({'detail': '流式运行失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        def event_stream():
            for line in r.iter_lines(decode_unicode=True):
                if line:
                    yield f'{line}\n'
        resp = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        return resp

class ChatProxyHistoryView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, thread_id):
        if not _assert_thread_owner(request.user, thread_id):
            return Response({'detail': '无权访问该线程'}, status=status.HTTP_403_FORBIDDEN)
        api_url = getattr(settings, 'LANGGRAPH_API_URL', 'http://127.0.0.1:2024')
        try:
            resp = requests.get(f'{api_url}/threads/{thread_id}/history', headers=_service_headers(), timeout=15)
            return Response(resp.json(), status=resp.status_code)
        except Exception as e:
            return Response({'detail': '获取历史失败', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

class DashboardStatsView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

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

class AdminUsersListView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]
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

class AdminUserDetailView(views.APIView):
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]
    def get(self, request, user_id):
        try:
            u = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserDetailSerializer(u).data)
class ChatThreadViewSet(viewsets.ModelViewSet):
    serializer_class = ChatThreadSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'thread_id'
    
    def get_queryset(self):
        return ChatThread.objects.filter(user=self.request.user).order_by('-updated_at')
    
    def create(self, request, *args, **kwargs):
        assistant_id = request.data.get('assistant_id') or 'intelligent_deep_assistant'
        title = request.data.get('title')
        # 调用 LangGraph 创建线程
        api_url = os.getenv('LANGGRAPH_API_URL', 'http://127.0.0.1:2024')
        try:
            resp = requests.post(f'{api_url}/threads', json={'metadata': {'assistant_id': assistant_id}}, timeout=10)
            data = resp.json()
            thread_id = data.get('thread_id') or data.get('id')
            if not thread_id:
                return Response({'detail': '无法创建线程', 'error': data}, status=status.HTTP_502_BAD_GATEWAY)
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
