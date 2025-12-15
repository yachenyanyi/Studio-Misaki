from django.contrib import admin
from .models import Article, SiteVisit

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'updated_at')
    search_fields = ('title', 'content')

@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'path', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('ip_address', 'path', 'user_agent')
    readonly_fields = ('ip_address', 'path', 'user_agent', 'timestamp')
    
    def has_add_permission(self, request):
        return False
