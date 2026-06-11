from django.db import models
from django.conf import settings
from courses.models import Lesson

# Create your models here.

class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson,on_delete=models.CASCADE)
    pass_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"Quiz - {self.lesson.title}"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz,on_delete=models.CASCADE,related_name='questions')
    text = models.TextField()

    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'MCQ', 'Multiple Choice (MCQ)'
        TRUE_FALSE = 'TF','True / False (TF)'

    question_type = models.CharField(
                                        max_length=3,
                                        choices=QuestionType.choices,
                                        default=QuestionType.MULTIPLE_CHOICE
    )
    
    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question,on_delete=models.CASCADE,related_name='choices')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class QuizAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz,on_delete=models.CASCADE,related_name='attempts')
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    passed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student} - {self.quiz}"


