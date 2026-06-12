from django.shortcuts import render

from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveAPIView
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Course,
    Lesson,
    Enrollment,
    Progress
)
from .serializers import (
    CourseSerializer,
    CourseDetailSerializer,
    LessonSerializer
)
from .permissions import IsInstructorOrReadOnly

# Create your views here.

class CourseListCreateView(ListCreateAPIView):
    queryset = Course.objects.filter(published=True)
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(
            instructor=self.request.user
        )


class CourseDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAuthenticated]


class EnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        course = get_object_or_404(
            Course,
            pk=pk
        )

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course
        )

        if created:
            return Response(
                {
                    "message": "Enrolled successfully"
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "message": "Already enrolled"
            },
            status=status.HTTP_200_OK
        )


class LessonDetailView(RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]


class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        lesson = get_object_or_404(
            Lesson,
            pk=pk
        )

        progress, created = Progress.objects.get_or_create(
            student=request.user,
            lesson=lesson,
            defaults={
                'completed': True,
                'completed_at': timezone.now()
            }
        )

        if not created and not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save()

        return Response(
            {
                "message": "Lesson marked as completed"
            },
            status=status.HTTP_200_OK
        )

class MyProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = []
        enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
        for enrollment in enrollments:
            course = enrollment.course
            total = course.lessons.count()
            completed = Progress.objects.filter(
                student=request.user,
                lesson__course=course,
                completed=True
            ).count()
            percent = (completed / total * 100) if total else 0
            data.append({
                "course_id": course.id,
                "course": course.title,
                "total_lessons": total,
                "completed_lessons": completed,
                "percent_complete": round(percent, 1),
            })
        return Response(data)