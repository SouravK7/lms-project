from django.urls import path
from .views import QuizDetailView, QuizSubmitView

urlpatterns = [
    path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:pk>/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
]