from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.conf import settings

from courses.models import Lesson

from .serializers import ChatRequestSerializer

from drf_spectacular.utils import extend_schema

from google import genai

# Create your views here.
client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)

class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
        request=ChatRequestSerializer
    )
    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lesson_id = serializer.validated_data['lesson_id']
        message = serializer.validated_data['message']
        lesson = get_object_or_404(Lesson,pk=lesson_id)

        system_prompt = (
            f"You are an AI tutor helping a student with the lesson "
            f"'{lesson.title}'.\n\n"
            f"Lesson content:\n{lesson.content[:1500]}\n\n"
            "Answer clearly and concisely. If the question is unrelated "
            "to this lesson, gently steer the student back to the topic."
        )
        full_prompt = (
            f"{system_prompt}\n\n"
            f"Student Question:\n{message}"
        )
        try:
            ai_response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt
            )

            reply = ai_response.text
            return Response(
                {
                    "reply": reply
                },
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {
                    "error": "AI tutor is temporarily unavailable."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
