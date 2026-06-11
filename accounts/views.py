from django.shortcuts import render
from rest_framework.generics import CreateAPIView,RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny,IsAuthenticated

from .serializers import RegisterSerializer,ProfileSerializer

# Create your views here.

# Register view
class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# Profile view
class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user