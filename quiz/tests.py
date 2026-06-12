from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from courses.models import Course, Lesson
from quiz.models import Quiz, Question, Choice


class QuizTests(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username="quizstudent", password="testpass123", role=User.Role.STUDENT
        )
        instructor = User.objects.create_user(
            username="quizinstructor", password="testpass123", role=User.Role.INSTRUCTOR
        )
        course = Course.objects.create(
            title="Quiz Course", description="x", instructor=instructor, published=True
        )
        lesson = Lesson.objects.create(course=course, title="L1", content="content", order=1)
        self.quiz = Quiz.objects.create(lesson=lesson, pass_score=60)

        q1 = Question.objects.create(quiz=self.quiz, text="2+2?", question_type="MCQ")
        self.correct_choice = Choice.objects.create(question=q1, text="4", is_correct=True)
        self.wrong_choice = Choice.objects.create(question=q1, text="5", is_correct=False)
        self.q1 = q1

    def test_correct_submission_scores_100(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f"/api/quizzes/{self.quiz.id}/submit/",
            {"answers": [{"question_id": self.q1.id, "choice_id": self.correct_choice.id}]},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["score"], 100.0)
        self.assertTrue(response.data["passed"])

    def test_wrong_submission_scores_0(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f"/api/quizzes/{self.quiz.id}/submit/",
            {"answers": [{"question_id": self.q1.id, "choice_id": self.wrong_choice.id}]},
            format="json"
        )
        self.assertEqual(response.data["score"], 0.0)
        self.assertFalse(response.data["passed"])

    def test_quiz_choices_hide_correct_answer(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f"/api/quizzes/{self.quiz.id}/")
        for choice in response.data["questions"][0]["choices"]:
            self.assertNotIn("is_correct", choice)