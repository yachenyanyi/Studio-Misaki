from django.db import models
from django.contrib.auth.models import User

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    cover_image = models.ImageField(upload_to='covers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class SiteVisit(models.Model):
    ip_address = models.GenericIPAddressField(verbose_name="IP Address")
    path = models.CharField(max_length=200, verbose_name="Access Path")
    user_agent = models.TextField(verbose_name="User Agent", blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Visit Time")

    class Meta:
        verbose_name = "Site Visit"
        verbose_name_plural = "Site Visits"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.ip_address} - {self.timestamp}"

class ChatThread(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_threads')
    thread_id = models.CharField(max_length=64, unique=True)
    assistant_id = models.CharField(max_length=128)
    title = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.assistant_id} - {self.thread_id}"

class TokenUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='token_usages')
    thread_id = models.CharField(max_length=64, blank=True, null=True)
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)
    model_name = models.CharField(max_length=128, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.total_tokens} tokens - {self.timestamp}"
