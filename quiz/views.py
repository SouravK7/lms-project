from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
    CreateAPIView
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from drf_spectacular.utils import extend_schema

from courses.permissions import IsInstructor

from courses.models import Enrollment, Progress

from .models import Quiz, QuizAttempt, Question, Choice
from .serializers import (
    QuizSerializer,
    QuizSubmissionSerializer,
    InstructorQuizSerializer,
    InstructorQuestionSerializer,
    InstructorChoiceSerializer
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

class InstructorQuizListView(ListCreateAPIView):
    serializer_class = InstructorQuizSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Quiz.objects.filter(
            lesson__course__instructor=self.request.user
        ).select_related("lesson", "lesson__course")

    def perform_create(self, serializer):
        lesson = serializer.validated_data["lesson"]

        if lesson.course.instructor != self.request.user:
            raise PermissionDenied("You can only create quizzes for your lessons.")

        serializer.save()


class InstructorQuizDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = InstructorQuizSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Quiz.objects.filter(
            lesson__course__instructor=self.request.user
        )


class InstructorQuestionCreateView(CreateAPIView):
    serializer_class = InstructorQuestionSerializer
    permission_classes = [IsInstructor]

    def perform_create(self, serializer):
        quiz = get_object_or_404(
            Quiz,
            pk=self.kwargs["pk"],
            lesson__course__instructor=self.request.user
        )

        serializer.save(quiz=quiz)


class InstructorQuestionDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = InstructorQuestionSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Question.objects.filter(
            quiz__lesson__course__instructor=self.request.user
        )


class InstructorChoiceCreateView(CreateAPIView):
    serializer_class = InstructorChoiceSerializer
    permission_classes = [IsInstructor]

    def perform_create(self, serializer):
        question = get_object_or_404(
            Question,
            pk=self.kwargs["pk"],
            quiz__lesson__course__instructor=self.request.user
        )

        choice = serializer.save(question=question)
        self.clear_other_correct_choices(choice)

    def clear_other_correct_choices(self, choice):
        if choice.is_correct:
            Choice.objects.filter(
                question=choice.question,
                is_correct=True
            ).exclude(pk=choice.pk).update(is_correct=False)


class InstructorChoiceDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = InstructorChoiceSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Choice.objects.filter(
            question__quiz__lesson__course__instructor=self.request.user
        )

    def perform_update(self, serializer):
        choice = serializer.save()

        if choice.is_correct:
            Choice.objects.filter(
                question=choice.question,
                is_correct=True
            ).exclude(pk=choice.pk).update(is_correct=False)
