# from django.shortcuts import render

from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from courses.models import Enrollment

from drf_spectacular.utils import extend_schema

from django.utils import timezone

from .serializers import (
    QuizSerializer,
    QuizSubmissionSerializer
)

from .models import (Quiz, QuizAttempt)
from courses.models import (Progress,Enrollment)

# Create your views here.

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
            raise PermissionDenied(
                "Enroll in the course first."
            )

        return quiz

class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
        request=QuizSubmissionSerializer,
        responses={200: dict}
    )
    def post(self, request, pk):
        quiz = get_object_or_404(
            Quiz.objects.prefetch_related(
                'questions__choices'
            ), 
            pk=pk
        )
        enrolled = Enrollment.objects.filter(
            student=request.user,
            course=quiz.lesson.course
        ).exists()
        
        if not enrolled:
            return Response(
                {
                    "error": "Enroll in the course first."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        answers = serializer.validated_data['answers']

        if not answers:
            return Response(
                {"error": "No answers submitted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # build {question_id: correct_choice_id}
        correct_map = {}
        for question in quiz.questions.all():
            correct_choice = question.choices.filter(is_correct=True).first()
            correct_map[question.id] = correct_choice.id if correct_choice else None

        total = len(correct_map)
        if total == 0:
            return Response(
                {"error": "This quiz has no questions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        correct_count = 0
        for ans in answers:
            qid = ans.get('question_id')
            cid = ans.get('choice_id')
            if qid in correct_map and correct_map[qid] == cid:
                correct_count += 1

        score = (correct_count / total) * 100
        passed = score >= quiz.pass_score

        QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            score=score,
            passed=passed,
        )

        if passed:
            progress, created = Progress.objects.get_or_create(
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
        }, status=status.HTTP_200_OK)