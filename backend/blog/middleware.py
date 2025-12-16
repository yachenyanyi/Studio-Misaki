from django.core.cache import cache
from .models import SiteVisit

class VisitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        self.record_visit(request)
        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def record_visit(self, request):
        # Ignore OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            return

        # Filter out static, media, and admin paths to avoid clutter
        if any(request.path.startswith(prefix) for prefix in ['/admin/', '/static/', '/media/', '/favicon.ico']):
            return

        ip = self.get_client_ip(request)
        
        # Anti-abuse: Throttle visits from the same IP
        # Using cache to store the IP for a specific duration (e.g., 30 minutes)
        # This prevents refreshing the page from increasing the count
        cache_key = f'visit_throttle_{ip}'
        
        if not cache.get(cache_key):
            # Create a new visit record
            try:
                SiteVisit.objects.create(
                    ip_address=ip,
                    path=request.path,
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                # Set the throttle for 30 minutes (1800 seconds)
                cache.set(cache_key, True, 1800)
            except Exception as e:
                # Silently fail to not disrupt the user experience
                logger.error(f"Error recording visit: {e}")
