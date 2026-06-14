from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import (ListCreateAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView,CreateAPIView)
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Course, Lesson, Enrollment, Progress
from .serializers import (CourseSerializer, CourseDetailSerializer, LessonSerializer, CertificateSerializer,InstructorCourseSerializer,InstructorLessonSerializer)
from .permissions import IsInstructor, IsInstructorOrReadOnly


class CourseListCreateView(ListCreateAPIView):
    queryset = Course.objects.filter(published=True)
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]

    search_fields = [
        'title',
        'description',
    ]

    ordering_fields = [
        'title',
        'created_at',
    ]

    filter_backends = [
        SearchFilter,
        OrderingFilter,
    ]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class CourseDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAuthenticated]


class EnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course
        )

        if created:
            return Response(
                {"message": "Enrolled successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"message": "Already enrolled"},
            status=status.HTTP_200_OK
        )


class LessonDetailView(RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        lesson = super().get_object()

        enrolled = Enrollment.objects.filter(
            student=self.request.user,
            course=lesson.course
        ).exists()

        if not enrolled:
            raise PermissionDenied("Enroll in the course first.")

        return lesson


class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)

        enrolled = Enrollment.objects.filter(
            student=request.user,
            course=lesson.course
        ).exists()

        if not enrolled:
            return Response(
                {"error": "Enroll in the course first."},
                status=status.HTTP_403_FORBIDDEN
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
            {"message": "Lesson marked as completed"},
            status=status.HTTP_200_OK
        )


class MyProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = []

        enrollments = Enrollment.objects.filter(
            student=request.user
        ).select_related('course')

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
                "completed": percent == 100,
            })

        return Response(data)
    
class CertificateView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request, pk):

        course = get_object_or_404(

            Course,

            pk=pk

        )


        enrolled = Enrollment.objects.filter(

            student=request.user,

            course=course

        ).exists()


        if not enrolled:

            return Response(

                {

                    "error":

                    "Enroll in the course first."

                },

                status=status.HTTP_403_FORBIDDEN

            )


        total_lessons = course.lessons.count()


        completed_lessons = Progress.objects.filter(

            student=request.user,

            lesson__course=course,

            completed=True

        ).count()


        if total_lessons == 0:

            return Response(

                {

                    "error":

                    "Course has no lessons."

                },

                status=status.HTTP_400_BAD_REQUEST

            )


        percent = (

            completed_lessons

            /

            total_lessons

        ) * 100


        if percent < 100:

            return Response(

                {

                    "error":

                    "Complete the course to unlock certificate."

                },

                status=status.HTTP_403_FORBIDDEN

            )


        last_completed = Progress.objects.filter(

            student=request.user,

            lesson__course=course,

            completed=True

        ).order_by(

            "-completed_at"

        ).first()


        completed_at = (

            last_completed.completed_at.date()

            if last_completed

            else timezone.now().date()

        )


        full_name = (

            request.user.get_full_name()

        )


        student_name = (

            full_name

            if full_name

            else request.user.username

        )


        certificate = {

            "student_name":

            student_name,


            "course_name":

            course.title,


            "completed_at":

            completed_at,


            "certificate_id":

            f"LH-{course.id}-{request.user.id}"

        }


        serializer = CertificateSerializer(

            certificate

        )


        return Response(

            serializer.data

        )
    
class InstructorCourseListView(

    ListCreateAPIView

):

    serializer_class = (

        InstructorCourseSerializer

    )

    permission_classes = [

        IsInstructor

    ]


    def get_queryset(self):

        return Course.objects.filter(

            instructor=self.request.user

        )


    def perform_create(

        self,

        serializer

    ):

        serializer.save(

            instructor=self.request.user

        )





class InstructorCourseDetailView(

    RetrieveUpdateDestroyAPIView

):

    serializer_class = (

        InstructorCourseSerializer

    )

    permission_classes = [

        IsInstructor

    ]


    def get_queryset(self):

        return Course.objects.filter(

            instructor=self.request.user

        )






class InstructorLessonCreateView(

    ListCreateAPIView

):

    serializer_class = (

        InstructorLessonSerializer

    )

    permission_classes = [

        IsInstructor

    ]


    def get_queryset(self):

        course = get_object_or_404(

            Course,

            pk=self.kwargs["pk"],

            instructor=self.request.user

        )


        return Lesson.objects.filter(

            course=course

        )


    def perform_create(

        self,

        serializer

    ):

        course = get_object_or_404(

            Course,

            pk=self.kwargs["pk"],

            instructor=self.request.user

        )


        serializer.save(

            course=course

        )






class InstructorLessonDetailView(

    RetrieveUpdateDestroyAPIView

):

    serializer_class = (

        InstructorLessonSerializer

    )

    permission_classes = [

        IsInstructor

    ]


    def get_queryset(self):

        return Lesson.objects.filter(

            course__instructor=

            self.request.user

        )
