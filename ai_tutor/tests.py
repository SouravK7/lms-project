#from django.test import TestCase

# Create your tests here.
from unittest.mock import patch, MagicMock

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Course, Lesson

from django.urls import reverse


class AITutorTests(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username='student',
            password='testpass123',
            role=User.Role.STUDENT
        )

        self.instructor = User.objects.create_user(
            username='instructor',
            password='testpass123',
            role=User.Role.INSTRUCTOR
        )

        self.course = Course.objects.create(
            title='Django Course',
            description='Test Course',
            instructor=self.instructor,
            published=True
        )

        self.lesson = Lesson.objects.create(
            course=self.course,
            title='Introduction to Django',
            content='Django is a high-level Python web framework.',
            order=1
        )

        self.client.force_authenticate(user=self.student)

    @patch('ai_tutor.views.client.models.generate_content')
    def test_ai_tutor_returns_reply(self, mock_generate):
        mock_response = MagicMock()
        mock_response.text = "Django is a Python web framework."

        mock_generate.return_value = mock_response

        response = self.client.post(
            '/api/aichat/',
            {
                'lesson_id': self.lesson.id,
                'message': 'What is Django?'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn('reply', response.data)

    def test_invalid_lesson_returns_404(self):
        response = self.client.post(
            '/api/aichat/',
            {
                'lesson_id': 9999,
                'message': 'What is Django?'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_missing_message_returns_400(self):
        response = self.client.post(
            '/api/aichat/',
            {
                'lesson_id': self.lesson.id
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )