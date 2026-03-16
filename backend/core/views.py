from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

User = get_user_model()

def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    cookie_max_age = 3600 * 24 * 7 # 7 days
    response.set_cookie(
        settings.SIMPLE_JWT['AUTH_COOKIE'],
        refresh_token,
        max_age=cookie_max_age,
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
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
        
        # Set Access Token Cookie
        response.set_cookie(
            'access_token',
            access_token,
            max_age=settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds(),
            httponly=True,
            samesite='Lax', 
            secure=not settings.DEBUG,
            path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
        )
        
        # Set Refresh Token Cookie
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds(),
            httponly=True,
            samesite='Lax',
            secure=not settings.DEBUG,
            path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
        )
        
        return response

class LoginApi(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            refresh = response.data.pop('refresh', None)
            if refresh:
                set_refresh_cookie(response, refresh)
            
            access = response.data.pop('access', None)
            if access:
                response.set_cookie(
                    'access_token',
                    access,
                    max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                    httponly=True,
                    samesite=settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                    secure=settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                    path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
                )
                
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
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds(),
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG,
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
            )
            
            response.set_cookie(
                'refresh_token',
                refresh_token,
                max_age=settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds(),
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG,
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
            )
            
            del response.data['access']
            del response.data['refresh']
            response.data['message'] = "Successfully authenticated."
            
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        if 'refresh_token' in request.COOKIES:
            request.data['refresh'] = request.COOKIES['refresh_token']
            
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get('access')
            
            response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds(),
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG,
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
            )
            
            if 'access' in response.data:
                del response.data['access']
                
        return response