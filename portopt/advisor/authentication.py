# authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads the access token from HttpOnly cookies.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            # Try to read the token from the "access" cookie
            raw_token = request.COOKIES.get("access")
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception:
            return None
        return self.get_user(validated_token), validated_token
