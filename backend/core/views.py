from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
from rest_framework.permissions import AllowAny, IsAuthenticated        
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.db import connections
from django.db.utils import OperationalError    

User = get_user_model()

def set_auth_cookies(response: Response, access_token: str = None, refresh_token: str = None) -> None:
    """
    Centralized utility to set JWT cookies (access and refresh).
    """
    cookie_settings = settings.SIMPLE_JWT
    
    if refresh_token:
        response.set_cookie(
            cookie_settings['AUTH_COOKIE'],
            refresh_token,
            max_age=int(cookie_settings['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            secure=cookie_settings['AUTH_COOKIE_SECURE'],
            httponly=cookie_settings['AUTH_COOKIE_HTTP_ONLY'],
            samesite=cookie_settings['AUTH_COOKIE_SAMESITE'],
            path=cookie_settings['AUTH_COOKIE_PATH'],
        )
        
    if access_token:
        response.set_cookie(
            'access_token',
            access_token,
            max_age=int(cookie_settings['ACCESS_TOKEN_LIFETIME'].total_seconds()),
            secure=cookie_settings['AUTH_COOKIE_SECURE'],
            httponly=True,  # Always HttpOnly for access token
            samesite=cookie_settings['AUTH_COOKIE_SAMESITE'],
            path=cookie_settings['AUTH_COOKIE_PATH'],
        )

class RegisterApi(APIView):
    permission_classes = [AllowAny]

    class InputSerializer(serializers.Serializer):
        email = serializers.EmailField()
        password = serializers.CharField(write_only=True)

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
            
        if User.objects.filter(email=serializer.validated_data['email']).exists():
            return Response(
                {"error": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        response = Response(
            {"message": "User created successfully"},
            status=status.HTTP_201_CREATED
        )
        
        set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)
        
        return response

class LoginApi(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            refresh = response.data.pop('refresh', None)
            access = response.data.pop('access', None)
            
            set_auth_cookies(response, access_token=access, refresh_token=refresh)
            
            response.data['message'] = "Successfully logged in."
            
        return response

class LogoutApi(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        response = Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        
        response.delete_cookie(
            settings.SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token'),
            samesite='Lax'
        )
        
        # 2. CRITICAL: Delete the access token
        response.delete_cookie(
            'access_token', 
            samesite='Lax'
        )
        
        return response

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.pop('access', None)
            refresh_token = response.data.pop('refresh', None)
            
            set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)
            
            response.data['message'] = "Successfully authenticated."
            
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        if 'refresh_token' in request.COOKIES:
            request.data['refresh'] = request.COOKIES['refresh_token']
            
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.pop('access', None)
            set_auth_cookies(response, access_token=access_token)
            
        return response

class HealthCheckApi(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_conn = connections['default']
        try:
            db_conn.cursor()
        except OperationalError:
            return Response(
                {
                    "status": "unhealthy",
                    "database": "unreachable"
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        return Response(
            {
                "status": "healthy",
                "database": "reachable"
            },
            status=status.HTTP_200_OK
        ) 