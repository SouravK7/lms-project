from django.urls import path

from .views import (
    CourseListCreateView,
    CourseDetailView,
    EnrollView,
    LessonDetailView,
    CompleteLessonView,
    MyProgressView,
    CertificateView,
    InstructorCourseListView,
    InstructorCourseDetailView,
    InstructorLessonCreateView,
    InstructorLessonDetailView
)

urlpatterns = [
    path(
        'courses/',
        CourseListCreateView.as_view(),
        name='course-list-create'
    ),

    path(
        'courses/<int:pk>/',
        CourseDetailView.as_view(),
        name='course-detail'
    ),

    path(
        'courses/<int:pk>/enroll/',
        EnrollView.as_view(),
        name='course-enroll'
    ),

    path(
        "courses/<int:pk>/certificate/",
        CertificateView.as_view(),
        name="certificate"
    ),

    path(
        'lessons/<int:pk>/',
        LessonDetailView.as_view(),
        name='lesson-detail'
    ),

    path(
        'lessons/<int:pk>/complete/',
        CompleteLessonView.as_view(),
        name='lesson-complete'
    ),
    path(
        "instructor/courses/",
        InstructorCourseListView.as_view(),
        name="instructor-courses"

    ),
    path(
        "instructor/courses/<int:pk>/",
        InstructorCourseDetailView.as_view(),
        name="instructor-course-detail"

    ),
    path(
        "instructor/courses/<int:pk>/lessons/",
        InstructorLessonCreateView.as_view(),
        name="instructor-lessons"
    ),
    path(
        "instructor/lessons/<int:pk>/",
        InstructorLessonDetailView.as_view(),
        name="instructor-lesson-detail"

    ),
    path(
        'myprogress/', 
        MyProgressView.as_view(), 
        name='my-progress'
    ),
]