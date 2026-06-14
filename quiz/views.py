from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import (
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
    CreateAPIView
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from drf_spectacular.utils import extend_schema

from courses.permissions import IsInstructorOrReadOnly

from courses.models import Enrollment, Course, Progress

from .models import Quiz, QuizAttempt, Question, Choice
from .serializers import (
    QuizSerializer,
    QuizSubmissionSerializer,
    QuestionSerializer,
    ChoiceSerializer
)


# -------------------------
# Student Views
# -------------------------

class QuizDetailView(RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        quiz = super().get_object()

        enrolled = Enrollment.objects.filter(
            student=self.request.user,
            course=quiz.lesson.course
        ).exists()

        if not enrolled:
            raise PermissionDenied("Enroll in the course first.")

        return quiz


class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=QuizSubmissionSerializer,
        responses={200: dict}
    )
    def post(self, request, pk):
        quiz = get_object_or_404(
            Quiz.objects.prefetch_related("questions__choices"),
            pk=pk
        )

        enrolled = Enrollment.objects.filter(
            student=request.user,
            course=quiz.lesson.course
        ).exists()

        if not enrolled:
            return Response(
                {"error": "Enroll in the course first."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        answers = serializer.validated_data["answers"]

        if not answers:
            return Response(
                {"error": "No answers submitted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        question_map = {
            q.id: q for q in quiz.questions.all()
        }

        total = len(question_map)

        if total == 0:
            return Response(
                {"error": "This quiz has no questions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        correct_count = 0
        review = []

        for ans in answers:
            qid = ans["question_id"]
            cid = ans["choice_id"]

            question = question_map.get(qid)
            if not question:
                continue

            user_choice = question.choices.filter(id=cid).first()
            correct_choice = question.choices.filter(is_correct=True).first()

            is_correct = (
                user_choice
                and correct_choice
                and user_choice.id == correct_choice.id
            )

            if is_correct:
                correct_count += 1

            review.append({
                "question": question.text,
                "user_answer": user_choice.text if user_choice else "Not Answered",
                "correct_answer": correct_choice.text if correct_choice else "-",
                "is_correct": is_correct
            })

        score = (correct_count / total) * 100
        passed = score >= quiz.pass_score

        QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            score=score,
            passed=passed
        )

        if passed:
            progress, _ = Progress.objects.get_or_create(
                student=request.user,
                lesson=quiz.lesson
            )

            progress.completed = True

            if not progress.completed_at:
                progress.completed_at = timezone.now()

            progress.save()

        return Response({
            "score": score,
            "passed": passed,
            "correct": correct_count,
            "total": total,
            "review": review
        })


# -------------------------
# Instructor Views
# -------------------------

class InstructorQuizListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "instructor":
            return Response(
                {"error": "Instructor access only."},
                status=status.HTTP_403_FORBIDDEN
            )

        quizzes = Quiz.objects.filter(
            lesson__course__instructor=request.user
        ).select_related("lesson", "lesson__course")

        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)


class InstructorQuizDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(
            lesson__course__instructor=self.request.user
        )


class InstructorQuestionCreateView(CreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        quiz = get_object_or_404(
            Quiz,
            pk=self.kwargs["pk"],
            lesson__course__instructor=self.request.user
        )

        serializer.save(quiz=quiz)


class InstructorQuestionDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(
            quiz__lesson__course__instructor=self.request.user
        )


class InstructorChoiceCreateView(CreateAPIView):
    serializer_class = ChoiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        question = get_object_or_404(
            Question,
            pk=self.kwargs["pk"],
            quiz__lesson__course__instructor=self.request.user
        )

        serializer.save(question=question)


class InstructorChoiceDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ChoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Choice.objects.filter(
            question__quiz__lesson__course__instructor=self.request.user
        )