from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class BaseAPITestCase(APITestCase):
    """
    Base test case for API views with built-in user creation and JWT authentication.
    """
    def setUp(self):
        super().setUp()
        self.user_email = "test@example.com"
        self.user_password = "testpassword123"
        self.user = User.objects.create_user(
            email=self.user_email,
            password=self.user_password
        )

    def get_token_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def authenticate(self, user=None):
        """
        Helper to authenticate the client using JWT.
        """
        target_user = user or self.user
        token = self.get_token_for_user(target_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return token

    def create_user(self, email, password="testpassword123"):
        return User.objects.create_user(email=email, password=password)
