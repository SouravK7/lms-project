from django.urls import path

from .views import (
    CourseListCreateView,
    CourseDetailView,
    EnrollView,
    LessonDetailView,
    CompleteLessonView,
    MyProgressView
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
        'myprogress/', 
        MyProgressView.as_view(), 
        name='my-progress'
    ),
]