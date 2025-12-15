from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, LoginView, LogoutView, CheckAuthView, DashboardStatsView, ChatThreadViewSet, ChatThreadHistoryView, RegisterView, ChatConfigView, ChatGatewayView, ChatProxyThreadsView, ChatProxyRunsWaitView, ChatProxyRunsStreamView, ChatProxyHistoryView, AdminUsersListView, AdminUserDetailView

router = DefaultRouter()
router.register(r'articles', ArticleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/check/', CheckAuthView.as_view(), name='check_auth'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('chat/config/', ChatConfigView.as_view(), name='chat_config'),
    path('chat/', ChatGatewayView.as_view(), name='chat_gateway'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('admin/users/', AdminUsersListView.as_view(), name='admin_users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('chat/threads/', ChatThreadViewSet.as_view({'get':'list', 'post':'create'}), name='chat_threads'),
    path('chat/threads/<str:thread_id>/', ChatThreadViewSet.as_view({'patch':'partial_update', 'delete':'destroy'}), name='chat_thread_detail'),
    path('chat/threads/<str:thread_id>/history/', ChatThreadHistoryView.as_view(), name='chat_thread_history'),
    # Proxy endpoints for Chainlit/LangGraph
    path('chatproxy/threads', ChatProxyThreadsView.as_view(), name='chatproxy_threads'),
    path('chatproxy/threads/<str:thread_id>/runs/wait', ChatProxyRunsWaitView.as_view(), name='chatproxy_runs_wait'),
    path('chatproxy/threads/<str:thread_id>/runs/stream', ChatProxyRunsStreamView.as_view(), name='chatproxy_runs_stream'),
    path('chatproxy/threads/<str:thread_id>/history', ChatProxyHistoryView.as_view(), name='chatproxy_history'),
]
