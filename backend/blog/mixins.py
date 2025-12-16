from rest_framework import views, permissions
from .authentication import JWTAuthentication
from rest_framework import authentication

class BaseAuthenticatedView(views.APIView):
    """
    Base view for authenticated endpoints.
    Includes JWT and Session authentication and requires authentication by default.
    """
    authentication_classes = [JWTAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class BaseAdminView(BaseAuthenticatedView):
    """
    Base view for admin-only endpoints.
    """
    permission_classes = [permissions.IsAdminUser]
