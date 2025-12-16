from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Article, SiteVisit, ChatThread, TokenUsage

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'cover_image', 'created_at', 'updated_at']

class SiteVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisit
        fields = ['id', 'ip_address', 'path', 'user_agent', 'timestamp']

class ChatThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatThread
        fields = ['id', 'thread_id', 'assistant_id', 'title', 'created_at', 'updated_at']

class TokenUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenUsage
        fields = ['id', 'thread_id', 'input_tokens', 'output_tokens', 'total_tokens', 'timestamp']

class UserSummarySerializer(serializers.ModelSerializer):
    threads_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'date_joined', 'last_login', 'threads_count']

class UserDetailSerializer(serializers.ModelSerializer):
    chat_threads = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'date_joined', 'last_login', 'chat_threads']
    def get_chat_threads(self, obj):
        qs = ChatThread.objects.filter(user=obj).order_by('-updated_at')[:20]
        return ChatThreadSerializer(qs, many=True).data
