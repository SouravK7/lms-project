from django.urls import path
from .views import (
    QuizDetailView, 
    QuizSubmitView, 
    InstructorQuizListView,
    InstructorQuizDetailView,
    InstructorQuestionCreateView,
    InstructorQuestionDetailView,
    InstructorChoiceCreateView,
    InstructorChoiceDetailView
)

urlpatterns = [
    path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:pk>/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
    path("instructor/quizzes/",InstructorQuizListView.as_view(),name="instructor-quizzes"),
    path("instructor/quizzes/<int:pk>/",InstructorQuizDetailView.as_view(),name="instructor-quiz-detail"),

    path("instructor/quizzes/<int:pk>/questions/",InstructorQuestionCreateView.as_view(),name="instructor-question-create"),

    path(
        "instructor/questions/<int:pk>/",
        InstructorQuestionDetailView.as_view(),
        name="instructor-question-detail"
    ),

    path(
        "instructor/questions/<int:pk>/choices/",
        InstructorChoiceCreateView.as_view(),
        name="instructor-choice-create"
    ),
    path(
        "instructor/choices/<int:pk>/",
        InstructorChoiceDetailView.as_view(),
        name="instructor-choice-detail"
    ),
]