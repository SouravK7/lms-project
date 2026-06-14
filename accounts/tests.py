from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class AccountTests(APITestCase):

    def test_register_user_creates_student_account(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "password2": "testpass123",
            "bio": "Learning Django.",
        }

        response = self.client.post(
            "/api/auth/register/",
            payload,
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="testuser")
        self.assertEqual(user.role, User.Role.STUDENT)
        self.assertEqual(user.email, "test@example.com")

    def test_register_rejects_password_mismatch(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "first_name": "Test",
                "last_name": "User",
                "username": "testuser",
                "email": "test@example.com",
                "password": "testpass123",
                "password2": "differentpass123",
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="testuser").exists())

    def test_register_does_not_allow_role_escalation(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "first_name": "Test",
                "last_name": "User",
                "username": "newinstructor",
                "email": "new@example.com",
                "password": "testpass123",
                "password2": "testpass123",
                "role": User.Role.INSTRUCTOR,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="newinstructor")
        self.assertEqual(user.role, User.Role.STUDENT)

    def test_login_user_returns_jwt_tokens(self):
        User.objects.create_user(
            username="testuser",
            password="testpass123",
            role=User.Role.STUDENT
        )

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "testuser",
                "password": "testpass123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_credentials(self):
        User.objects.create_user(
            username="testuser",
            password="testpass123",
            role=User.Role.STUDENT
        )

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "testuser",
                "password": "wrongpassword"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated_returns_current_user(self):
        user = User.objects.create_user(
            username="testuser",
            first_name="Test",
            password="testpass123",
            role=User.Role.STUDENT
        )

        self.client.force_authenticate(user=user)
        response = self.client.get("/api/auth/profile/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["role"], User.Role.STUDENT)

    def test_profile_unauthenticated_returns_401(self):
        response = self.client.get("/api/auth/profile/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
