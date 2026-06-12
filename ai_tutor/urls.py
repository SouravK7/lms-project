from django.urls import path
from .views import ChatView

urlpatterns = [
    path('aichat/',ChatView.as_view(),name='ai-chat')
]