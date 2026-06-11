from django.contrib import admin
from .models import Quiz, Question, Choice, QuizAttempt

# Register your models here.

admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(QuizAttempt)