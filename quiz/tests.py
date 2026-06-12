from django.test import TestCase

# Create your tests here.
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Course, Enrollment


class CourseTests(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username="student1",
            password="testpass123",
            role=User.Role.STUDENT
        )

        self.instructor = User.objects.create_user(
            username="instructor1",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )

        self.course = Course.objects.create(
            title="Django LMS",
            description="Test Course",
            instructor=self.instructor,
            published=True
        )

    def test_course_list_authenticated_user(self):
        """
        GET /api/courses/
        Expect 200
        """

        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            "/api/courses/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_student_cannot_create_course(self):
        """
        POST /api/courses/
        Student should get 403
        """

        self.client.force_authenticate(user=self.student)

        payload = {
            "title": "New Course",
            "description": "Should fail",
            "published": True
        }

        response = self.client.post(
            "/api/courses/",
            payload,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_student_can_enroll_course(self):
        """
        POST /api/courses/{id}/enroll/
        Enrollment record should exist
        """

        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            f"/api/courses/{self.course.id}/enroll/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            Enrollment.objects.filter(
                student=self.student,
                course=self.course
            ).exists()
        )