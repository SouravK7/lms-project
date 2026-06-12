from django.test import TestCase

# Create your tests here.
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class AccountTests(APITestCase):

    def test_register_user(self):
        """
        POST /api/auth/register/
        User should be created successfully
        """

        payload = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "password2": "testpass123",
            "role": User.Role.STUDENT
        }

        response = self.client.post(
            "/api/auth/register/",
            payload,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            User.objects.filter(
                username="testuser"
            ).exists()
        )

    def test_login_user(self):
        """
        POST /api/auth/login/
        Should return JWT tokens
        """

        User.objects.create_user(
            username="testuser",
            password="testpass123",
            role=User.Role.STUDENT
        )

        payload = {
            "username": "testuser",
            "password": "testpass123"
        }

        response = self.client.post(
            "/api/auth/login/",
            payload,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            "access",
            response.data
        )

        self.assertIn(
            "refresh",
            response.data
        )

    def test_profile_authenticated(self):
        """
        Authenticated user should access profile
        """

        user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            role=User.Role.STUDENT
        )

        self.client.force_authenticate(
            user=user
        )

        response = self.client.get(
            "/api/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_profile_unauthenticated(self):
        """
        Unauthenticated user should get 401
        """

        response = self.client.get(
            "/api/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )