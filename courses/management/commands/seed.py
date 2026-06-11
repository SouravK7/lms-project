from django.core.management.base import BaseCommand
from accounts.models import User
from courses.models import Course, Lesson, Enrollment
from quiz.models import Quiz, Question, Choice

class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        instructor, instructor_created = User.objects.get_or_create(
            username='instructor101',
            defaults={
                'email': 'inst@lms.com',
                'role': User.Role.INSTRUCTOR,
                'bio': 'Sample instructor',
            }
        )
        if instructor_created:
            instructor.set_password('pass1234')
            instructor.save()

        student, student_created = User.objects.get_or_create(
            username='student101',
            defaults={
                'email': 'student@lms.com',
                'role': User.Role.STUDENT,
                'bio': 'Sample student',
            }
        )

        if student_created:
            student.set_password('pass1234')
            student.save()

        # Course
        course, created = Course.objects.get_or_create(
            title='Django LMS Fundamentals',
            defaults={
                'description': 'Sample course for testing',
                'instructor': instructor,
                'published': True,
            }
        )

        # Lessons
        lesson1, created = Lesson.objects.get_or_create(
            course=course,
            order=1,
            defaults={
                'title': 'Introduction to Django',
                'content': 'Getting started with Django.',
            }
        )

        lesson2, created = Lesson.objects.get_or_create(
            course=course,
            order=2,
            defaults={
                'title': 'Models and Migrations',
                'content': 'Understanding Django ORM.',
            }
        )

        lesson3, created = Lesson.objects.get_or_create(
            course=course,
            order=3,
            defaults={
                'title': 'JWT Authentication',
                'content': 'Authentication using JWT.',
            }
        )

        # Enrollment
        Enrollment.objects.get_or_create(
            student=student,
            course=course
        )

        # Quiz
        quiz, created = Quiz.objects.get_or_create(
            lesson=lesson1,
            defaults={
                'pass_score': 60.00
            }
        )

        # Question 1
        question1, created = Question.objects.get_or_create(
            quiz=quiz,
            text='What architecture pattern does Django follow?',
            defaults={
                'question_type': Question.QuestionType.MULTIPLE_CHOICE
            }
        )

        Choice.objects.get_or_create(
            question=question1,
            text='MTV',
            defaults={'is_correct': True}
        )

        Choice.objects.get_or_create(
            question=question1,
            text='MVC',
            defaults={'is_correct': False}
        )

        Choice.objects.get_or_create(
            question=question1,
            text='React',
            defaults={'is_correct': False}
        )

        # Question 2
        question2, created = Question.objects.get_or_create(
            quiz=quiz,
            text='Django is a Python framework.',
            defaults={
                'question_type': Question.QuestionType.TRUE_FALSE
            }
        )

        Choice.objects.get_or_create(
            question=question2,
            text='True',
            defaults={'is_correct': True}
        )

        Choice.objects.get_or_create(
            question=question2,
            text='False',
            defaults={'is_correct': False}
        )

        # Success messages
        self.stdout.write(self.style.SUCCESS('Instructor ready'))
        self.stdout.write(self.style.SUCCESS('Student ready'))
        self.stdout.write(self.style.SUCCESS('Course ready'))
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))