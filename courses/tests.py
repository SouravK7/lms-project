from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone

from accounts.models import User
from courses.models import Course, Enrollment, Lesson, Progress
from quiz.models import Choice, Question, Quiz


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
        self.other_instructor = User.objects.create_user(
            username="instructor2",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )
        self.course = Course.objects.create(
            title="Django LMS",
            description="Test Course",
            instructor=self.instructor,
            published=True
        )
        self.lesson = Lesson.objects.create(
            course=self.course,
            title="Intro",
            content="Welcome",
            order=1
        )

    def test_course_list_requires_authentication(self):
        response = self.client.get("/api/courses/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_course_list_authenticated_user(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get("/api/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            "/api/courses/",
            {
                "title": "New Course",
                "description": "Should fail",
                "published": True
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_instructor_can_create_own_course(self):
        self.client.force_authenticate(user=self.instructor)

        response = self.client.post(
            "/api/instructor/courses/",
            {
                "title": "New Instructor Course",
                "description": "Owned by instructor",
                "published": False
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        course = Course.objects.get(title="New Instructor Course")
        self.assertEqual(course.instructor, self.instructor)

    def test_student_cannot_access_instructor_course_endpoint(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get("/api/instructor/courses/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_can_enroll_course(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(f"/api/courses/{self.course.id}/enroll/")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Enrollment.objects.filter(
                student=self.student,
                course=self.course
            ).exists()
        )

    def test_unenrolled_student_cannot_open_lesson(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(f"/api/lessons/{self.lesson.id}/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_enrolled_student_can_open_lesson(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.student)

        response = self.client.get(f"/api/lessons/{self.lesson.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.lesson.id)

    def test_unenrolled_student_cannot_complete_lesson(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(f"/api/lessons/{self.lesson.id}/complete/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            Progress.objects.filter(
                student=self.student,
                lesson=self.lesson,
                completed=True,
            ).exists()
        )

    def test_complete_lesson_marks_progress_with_timestamp(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.student)

        response = self.client.post(f"/api/lessons/{self.lesson.id}/complete/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = Progress.objects.get(student=self.student, lesson=self.lesson)
        self.assertTrue(progress.completed)
        self.assertIsNotNone(progress.completed_at)

    def test_instructor_cannot_patch_another_instructors_course(self):
        self.client.force_authenticate(user=self.other_instructor)

        response = self.client.patch(
            f"/api/instructor/courses/{self.course.id}/",
            {"title": "Hijacked"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, "Django LMS")

    def test_instructor_cannot_patch_another_instructors_lesson(self):
        self.client.force_authenticate(user=self.other_instructor)

        response = self.client.patch(
            f"/api/instructor/lessons/{self.lesson.id}/",
            {"title": "Hijacked"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.lesson.refresh_from_db()
        self.assertEqual(self.lesson.title, "Intro")

    def test_instructor_can_patch_own_lesson(self):
        self.client.force_authenticate(user=self.instructor)

        response = self.client.patch(
            f"/api/instructor/lessons/{self.lesson.id}/",
            {"title": "Updated Intro"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lesson.refresh_from_db()
        self.assertEqual(self.lesson.title, "Updated Intro")


class CertificateTests(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username="certstudent",
            password="testpass123",
            role=User.Role.STUDENT
        )
        self.instructor = User.objects.create_user(
            username="certinstructor",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )
        self.course = Course.objects.create(
            title="Certificate Course",
            description="Certificate test",
            instructor=self.instructor,
            published=True
        )
        self.lesson_one = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            content="Content 1",
            order=1
        )
        self.lesson_two = Lesson.objects.create(
            course=self.course,
            title="Lesson 2",
            content="Content 2",
            order=2
        )

    def test_certificate_requires_authentication(self):
        response = self.client.get(f"/api/courses/{self.course.id}/certificate/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_certificate_requires_enrollment(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(f"/api/courses/{self.course.id}/certificate/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_certificate_requires_full_completion(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        Progress.objects.create(
            student=self.student,
            lesson=self.lesson_one,
            completed=True,
            completed_at=timezone.now()
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get(f"/api/courses/{self.course.id}/certificate/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_certificate_returns_payload_after_full_completion(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        Progress.objects.create(
            student=self.student,
            lesson=self.lesson_one,
            completed=True,
            completed_at=timezone.now()
        )
        Progress.objects.create(
            student=self.student,
            lesson=self.lesson_two,
            completed=True,
            completed_at=timezone.now()
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get(f"/api/courses/{self.course.id}/certificate/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(response.data.keys()),
            {
                "student_name",
                "course_name",
                "completed_at",
                "certificate_id",
            }
        )
        self.assertEqual(response.data["course_name"], self.course.title)


class InstructorOwnershipTests(APITestCase):

    def setUp(self):
        self.instructor = User.objects.create_user(
            username="owner",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )
        self.other_instructor = User.objects.create_user(
            username="intruder",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )
        self.course = Course.objects.create(
            title="Owned Course",
            description="Owner only",
            instructor=self.instructor,
            published=False
        )
        self.lesson = Lesson.objects.create(
            course=self.course,
            title="Owned Lesson",
            content="Private",
            order=1
        )
        self.quiz = Quiz.objects.create(
            lesson=self.lesson,
            pass_score=70
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="Owner question?",
            question_type="MCQ"
        )
        self.choice = Choice.objects.create(
            question=self.question,
            text="Owner choice",
            is_correct=True
        )

    def test_other_instructor_cannot_patch_course_lesson_quiz_question_or_choice(self):
        self.client.force_authenticate(user=self.other_instructor)

        checks = [
            (
                f"/api/instructor/courses/{self.course.id}/",
                {"title": "Changed"},
            ),
            (
                f"/api/instructor/lessons/{self.lesson.id}/",
                {"title": "Changed"},
            ),
            (
                f"/api/instructor/quizzes/{self.quiz.id}/",
                {"pass_score": 10},
            ),
            (
                f"/api/instructor/questions/{self.question.id}/",
                {"text": "Changed"},
            ),
            (
                f"/api/instructor/choices/{self.choice.id}/",
                {"text": "Changed"},
            ),
        ]

        for url, payload in checks:
            with self.subTest(url=url):
                response = self.client.patch(url, payload, format="json")
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_other_instructor_cannot_get_or_delete_quiz_question_or_choice(self):
        self.client.force_authenticate(user=self.other_instructor)

        get_urls = [
            f"/api/instructor/quizzes/{self.quiz.id}/",
            f"/api/instructor/questions/{self.question.id}/",
            f"/api/instructor/choices/{self.choice.id}/",
        ]
        delete_urls = get_urls

        for url in get_urls:
            with self.subTest(method="GET", url=url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        for url in delete_urls:
            with self.subTest(method="DELETE", url=url):
                response = self.client.delete(url)
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.assertTrue(Quiz.objects.filter(pk=self.quiz.pk).exists())
        self.assertTrue(Question.objects.filter(pk=self.question.pk).exists())
        self.assertTrue(Choice.objects.filter(pk=self.choice.pk).exists())

    def test_other_instructor_cannot_create_quiz_for_someone_elses_lesson(self):
        self.client.force_authenticate(user=self.other_instructor)

        response = self.client.post(
            "/api/instructor/quizzes/",
            {
                "lesson": self.lesson.id,
                "pass_score": 60,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_instructor_cannot_get_owned_course_or_lesson(self):
        self.client.force_authenticate(user=self.other_instructor)

        checks = [
            f"/api/instructor/courses/{self.course.id}/",
            f"/api/instructor/lessons/{self.lesson.id}/",
        ]

        for url in checks:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_other_instructor_cannot_delete_course_or_lesson(self):
        self.client.force_authenticate(user=self.other_instructor)

        checks = [
            f"/api/instructor/courses/{self.course.id}/",
            f"/api/instructor/lessons/{self.lesson.id}/",
        ]

        for url in checks:
            with self.subTest(url=url):
                response = self.client.delete(url)
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.assertTrue(Course.objects.filter(pk=self.course.pk).exists())
        self.assertTrue(Lesson.objects.filter(pk=self.lesson.pk).exists())

    def test_other_instructor_cannot_create_lesson_on_someone_elses_course(self):
        self.client.force_authenticate(user=self.other_instructor)

        response = self.client.post(
            f"/api/instructor/courses/{self.course.id}/lessons/",
            {
                "title": "Intruder Lesson",
                "content": "Should not exist",
                "order": 2,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(
            Lesson.objects.filter(
                course=self.course,
                title="Intruder Lesson",
            ).exists()
        )
