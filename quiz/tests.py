from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Course, Enrollment, Lesson, Progress
from quiz.models import Choice, Question, Quiz, QuizAttempt


class QuizTests(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username="quizstudent",
            password="testpass123",
            role=User.Role.STUDENT
        )
        self.unenrolled_student = User.objects.create_user(
            username="unenrolled",
            password="testpass123",
            role=User.Role.STUDENT
        )
        self.instructor = User.objects.create_user(
            username="quizinstructor",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )
        self.course = Course.objects.create(
            title="Quiz Course",
            description="Quiz test",
            instructor=self.instructor,
            published=True
        )
        Enrollment.objects.create(student=self.student, course=self.course)
        self.lesson = Lesson.objects.create(
            course=self.course,
            title="Quiz Lesson",
            content="Quiz content",
            order=1
        )
        self.quiz = Quiz.objects.create(lesson=self.lesson, pass_score=60)
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="2+2?",
            question_type="MCQ"
        )
        self.correct_choice = Choice.objects.create(
            question=self.question,
            text="4",
            is_correct=True
        )
        self.wrong_choice = Choice.objects.create(
            question=self.question,
            text="5",
            is_correct=False
        )

    def test_quiz_requires_enrollment(self):
        self.client.force_authenticate(user=self.unenrolled_student)

        response = self.client.get(f"/api/quizzes/{self.quiz.id}/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_quiz_choices_do_not_expose_correct_answer_before_submit(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(f"/api/quizzes/{self.quiz.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        choice = response.data["questions"][0]["choices"][0]
        self.assertEqual(set(choice.keys()), {"id", "text"})
        for choice in response.data["questions"][0]["choices"]:
            self.assertNotIn("is_correct", choice)

    def test_correct_submission_scores_100_and_returns_review(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            f"/api/quizzes/{self.quiz.id}/submit/",
            {
                "answers": [
                    {
                        "question_id": self.question.id,
                        "choice_id": self.correct_choice.id,
                    }
                ]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["score"], 100.0)
        self.assertTrue(response.data["passed"])
        self.assertEqual(response.data["correct"], 1)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["review"][0]["user_answer"], "4")
        self.assertEqual(response.data["review"][0]["correct_answer"], "4")
        self.assertTrue(response.data["review"][0]["is_correct"])
        self.assertTrue(
            QuizAttempt.objects.filter(
                student=self.student,
                quiz=self.quiz,
                passed=True
            ).exists()
        )
        self.assertTrue(
            Progress.objects.filter(
                student=self.student,
                lesson=self.lesson,
                completed=True
            ).exists()
        )

    def test_wrong_submission_scores_0_and_still_returns_correct_answer_in_review(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            f"/api/quizzes/{self.quiz.id}/submit/",
            {
                "answers": [
                    {
                        "question_id": self.question.id,
                        "choice_id": self.wrong_choice.id,
                    }
                ]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["score"], 0.0)
        self.assertFalse(response.data["passed"])
        self.assertEqual(response.data["review"][0]["user_answer"], "5")
        self.assertEqual(response.data["review"][0]["correct_answer"], "4")
        self.assertFalse(response.data["review"][0]["is_correct"])

    def test_submit_requires_enrollment(self):
        self.client.force_authenticate(user=self.unenrolled_student)

        response = self.client.post(
            f"/api/quizzes/{self.quiz.id}/submit/",
            {
                "answers": [
                    {
                        "question_id": self.question.id,
                        "choice_id": self.correct_choice.id,
                    }
                ]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_instructor_quiz_payload_includes_correct_answer_for_editor(self):
        self.client.force_authenticate(user=self.instructor)

        response = self.client.get(f"/api/instructor/quizzes/{self.quiz.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        choice = response.data["questions"][0]["choices"][0]
        self.assertIn("is_correct", choice)

    def test_other_instructor_cannot_create_question_on_someone_elses_quiz(self):
        other_instructor = User.objects.create_user(
            username="otherquizinstructor",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )
        self.client.force_authenticate(user=other_instructor)

        response = self.client.post(
            f"/api/instructor/quizzes/{self.quiz.id}/questions/",
            {
                "text": "Intruder question?",
                "question_type": "MCQ",
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(
            Question.objects.filter(text="Intruder question?").exists()
        )

    def test_other_instructor_cannot_create_choice_on_someone_elses_question(self):
        other_instructor = User.objects.create_user(
            username="otherchoiceinstructor",
            password="testpass123",
            role=User.Role.INSTRUCTOR
        )
        self.client.force_authenticate(user=other_instructor)

        response = self.client.post(
            f"/api/instructor/questions/{self.question.id}/choices/",
            {
                "text": "Intruder choice",
                "is_correct": False,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(
            Choice.objects.filter(text="Intruder choice").exists()
        )
