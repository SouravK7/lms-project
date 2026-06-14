from django.core.management.base import BaseCommand
from accounts.models import User
from courses.models import Course, Lesson, Enrollment, Progress
from quiz.models import Quiz, Question, Choice, QuizAttempt


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **kwargs):
        # STEP 1: DELETE EXISTING DEMO DATA
        self.stdout.write('Deleting existing demo data...')
        
        # Delete in order to avoid foreign key constraints
        QuizAttempt.objects.filter(
            student__username__in=['johnsmith', 'sarahwilson', 'michaelchen', 'alexjohnson']
        ).delete()
        
        Choice.objects.filter(
            question__quiz__lesson__course__instructor__username__in=['johnsmith', 'sarahwilson', 'michaelchen']
        ).delete()
        
        Question.objects.filter(
            quiz__lesson__course__instructor__username__in=['johnsmith', 'sarahwilson', 'michaelchen']
        ).delete()
        
        Quiz.objects.filter(
            lesson__course__instructor__username__in=['johnsmith', 'sarahwilson', 'michaelchen']
        ).delete()
        
        Progress.objects.filter(
            student__username='alexjohnson'
        ).delete()
        
        Enrollment.objects.filter(
            student__username='alexjohnson'
        ).delete()
        
        Lesson.objects.filter(
            course__instructor__username__in=['johnsmith', 'sarahwilson', 'michaelchen']
        ).delete()
        
        Course.objects.filter(
            instructor__username__in=['johnsmith', 'sarahwilson', 'michaelchen']
        ).delete()
        
        User.objects.filter(
            username__in=['johnsmith', 'sarahwilson', 'michaelchen', 'alexjohnson']
        ).delete()
        
        self.stdout.write('Existing demo data deleted.')
        
        # STEP 2: CREATE USERS
        self.stdout.write('Creating users...')
        
        # Instructor 1
        johnsmith = User.objects.create_user(
            username='johnsmith',
            password='john@123',
            email='johnsmith@lms.com',
            first_name='John',
            last_name='Smith',
            role=User.Role.INSTRUCTOR,
            bio='Dr. John Smith is a senior software engineer with over 10 years of experience in Python and Django development. He has trained thousands of students in backend engineering and web development.'
        )
        
        # Instructor 2
        sarahwilson = User.objects.create_user(
            username='sarahwilson',
            password='sarah@123',
            email='sarahwilson@lms.com',
            first_name='Sarah',
            last_name='Wilson',
            role=User.Role.INSTRUCTOR,
            bio='Sarah Wilson is a Machine Learning Engineer specializing in predictive analytics, computer vision and practical AI systems. She enjoys teaching beginner friendly machine learning concepts.'
        )
        
        # Instructor 3
        michaelchen = User.objects.create_user(
            username='michaelchen',
            password='michael@123',
            email='michaelchen@lms.com',
            first_name='Michael',
            last_name='Chen',
            role=User.Role.INSTRUCTOR,
            bio='Michael Chen is a Computer Science instructor with expertise in data structures, algorithms and competitive programming.'
        )
        
        # Student
        alexjohnson = User.objects.create_user(
            username='alexjohnson',
            password='alex@123',
            email='alexjohnson@lms.com',
            first_name='Alex',
            last_name='Johnson',
            role=User.Role.STUDENT
        )
        
        users_count = 4
        self.stdout.write(f'Users created: {users_count}')
        
        # STEP 3: CREATE COURSES
        self.stdout.write('Creating courses...')
        
        course1 = Course.objects.create(
            title='Python Programming Bootcamp',
            instructor=johnsmith,
            published=True,
            description='Master Python programming from beginner to advanced concepts including OOP, modules and practical coding exercises through interactive lessons and quizzes.'
        )
        
        course2 = Course.objects.create(
            title='Machine Learning Fundamentals',
            instructor=sarahwilson,
            published=True,
            description='Learn the foundations of Machine Learning including regression, classification, clustering and evaluation techniques with practical examples.'
        )
        
        course3 = Course.objects.create(
            title='Data Structures and Algorithms',
            instructor=michaelchen,
            published=True,
            description='Understand essential data structures and algorithms used in modern software development through practical examples and coding exercises.'
        )
        
        courses_count = 3
        self.stdout.write(f'Courses created: {courses_count}')
        
        # STEP 4: CREATE LESSONS
        self.stdout.write('Creating lessons...')
        
        # Course 1 - Python Programming Bootcamp
        lessons_c1 = [
            {
                'title': 'Introduction to Python',
                'description': 'Learn the basics of Python, installation, syntax and writing your first program.',
                'video_url': 'https://www.youtube.com/embed/rfscVS0vtbw'
            },
            {
                'title': 'Variables and Data Types',
                'description': 'Understand variables, integers, floats, strings and basic operations.',
                'video_url': 'https://www.youtube.com/embed/kqtD5dpn9C8'
            },
            {
                'title': 'Control Statements',
                'description': 'Learn conditional statements and loops in Python.',
                'video_url': 'https://www.youtube.com/embed/f4KOjWS_KZs'
            },
            {
                'title': 'Functions',
                'description': 'Create reusable functions with parameters and return values.',
                'video_url': 'https://www.youtube.com/embed/NSbOtYzIQI0'
            },
            {
                'title': 'Object Oriented Programming',
                'description': 'Understand classes, objects, inheritance and encapsulation.',
                'video_url': 'https://www.youtube.com/embed/JeznW_7DlB0'
            }
        ]
        
        # Course 2 - Machine Learning Fundamentals
        lessons_c2 = [
            {
                'title': 'Introduction to Machine Learning',
                'description': 'Introduction to Machine Learning',
                'video_url': 'https://www.youtube.com/embed/GwIo3gDZCVQ'
            },
            {
                'title': 'Regression',
                'description': 'Regression',
                'video_url': 'https://www.youtube.com/embed/PaFPbb66DxQ'
            },
            {
                'title': 'Classification',
                'description': 'Classification',
                'video_url': 'https://www.youtube.com/embed/i_LwzRVP7bg'
            },
            {
                'title': 'Clustering',
                'description': 'Clustering',
                'video_url': 'https://www.youtube.com/embed/4b5d3muPQmA'
            },
            {
                'title': 'Evaluation Metrics',
                'description': 'Evaluation Metrics',
                'video_url': 'https://www.youtube.com/embed/85dtiMz9tSo'
            }
        ]
        
        # Course 3 - Data Structures and Algorithms
        lessons_c3 = [
            {
                'title': 'Arrays',
                'description': 'Arrays',
                'video_url': 'https://www.youtube.com/embed/QJNwK2uJyGs'
            },
            {
                'title': 'Linked Lists',
                'description': 'Linked Lists',
                'video_url': 'https://www.youtube.com/embed/N6dOwBde7-M'
            },
            {
                'title': 'Stacks and Queues',
                'description': 'Stacks and Queues',
                'video_url': 'https://www.youtube.com/embed/wjI1WNcIntg'
            },
            {
                'title': 'Trees',
                'description': 'Trees',
                'video_url': 'https://www.youtube.com/embed/oSWTXtMglKE'
            },
            {
                'title': 'Sorting Algorithms',
                'description': 'Sorting Algorithms',
                'video_url': 'https://www.youtube.com/embed/kPRA0W1kECg'
            }
        ]
        
        all_lessons = []
        
        for i, lesson_data in enumerate(lessons_c1, start=1):
            lesson = Lesson.objects.create(
                course=course1,
                title=lesson_data['title'],
                content=lesson_data['description'],
                order=i,
                video_url=lesson_data['video_url']
            )
            all_lessons.append(lesson)
        
        for i, lesson_data in enumerate(lessons_c2, start=1):
            lesson = Lesson.objects.create(
                course=course2,
                title=lesson_data['title'],
                content=lesson_data['description'],
                order=i,
                video_url=lesson_data['video_url']
            )
            all_lessons.append(lesson)
        
        for i, lesson_data in enumerate(lessons_c3, start=1):
            lesson = Lesson.objects.create(
                course=course3,
                title=lesson_data['title'],
                content=lesson_data['description'],
                order=i,
                video_url=lesson_data['video_url']
            )
            all_lessons.append(lesson)
        
        lessons_count = 15
        self.stdout.write(f'Lessons created: {lessons_count}')
        
        # STEP 5: CREATE QUIZZES
        self.stdout.write('Creating quizzes...')
        
        quizzes = []
        for lesson in all_lessons:
            quiz = Quiz.objects.create(
                lesson=lesson,
                pass_score=70
            )
            quizzes.append(quiz)
        
        quizzes_count = 15
        self.stdout.write(f'Quizzes created: {quizzes_count}')
        
        # STEP 6: CREATE QUESTIONS AND CHOICES
        self.stdout.write('Creating questions and choices...')
        
        questions_count = 0
        choices_count = 0
        
        for quiz in quizzes:
            lesson_title = quiz.lesson.title
            
            # Question 1 - MCQ
            q1 = Question.objects.create(
                quiz=quiz,
                text=f'What is a key concept in {lesson_title}?',
                question_type=Question.QuestionType.MULTIPLE_CHOICE
            )
            questions_count += 1
            
            Choice.objects.create(question=q1, text='Correct answer', is_correct=True)
            Choice.objects.create(question=q1, text='Wrong option 1', is_correct=False)
            Choice.objects.create(question=q1, text='Wrong option 2', is_correct=False)
            choices_count += 3
            
            # Question 2 - True/False
            q2 = Question.objects.create(
                quiz=quiz,
                text=f'{lesson_title} is an important topic in computer science.',
                question_type=Question.QuestionType.TRUE_FALSE
            )
            questions_count += 1
            
            Choice.objects.create(question=q2, text='True', is_correct=True)
            Choice.objects.create(question=q2, text='False', is_correct=False)
            choices_count += 2
        
        self.stdout.write(f'Questions created: {questions_count}')
        self.stdout.write(f'Choices created: {choices_count}')
        
        # STEP 7: CREATE ENROLLMENTS
        self.stdout.write('Creating enrollments...')
        
        Enrollment.objects.create(student=alexjohnson, course=course1)
        Enrollment.objects.create(student=alexjohnson, course=course2)
        Enrollment.objects.create(student=alexjohnson, course=course3)
        
        enrollments_count = 3
        self.stdout.write(f'Enrollments created: {enrollments_count}')
        
        # STEP 8: CREATE PROGRESS
        self.stdout.write('Creating progress records...')
        
        # Python Programming Bootcamp - Lessons 1, 2, 3 completed
        Progress.objects.create(student=alexjohnson, lesson=all_lessons[0], completed=True)
        Progress.objects.create(student=alexjohnson, lesson=all_lessons[1], completed=True)
        Progress.objects.create(student=alexjohnson, lesson=all_lessons[2], completed=True)
        Progress.objects.create(student=alexjohnson, lesson=all_lessons[3], completed=False)
        Progress.objects.create(student=alexjohnson, lesson=all_lessons[4], completed=False)
        
        # Machine Learning Fundamentals - all incomplete
        for i in range(5, 10):
            Progress.objects.create(student=alexjohnson, lesson=all_lessons[i], completed=False)
        
        # Data Structures and Algorithms - all incomplete
        for i in range(10, 15):
            Progress.objects.create(student=alexjohnson, lesson=all_lessons[i], completed=False)
        
        progress_count = 15
        self.stdout.write(f'Progress records created: {progress_count}')
        
        # STEP 9: OUTPUT
        self.stdout.write(self.style.SUCCESS('Seed completed successfully'))
        self.stdout.write(self.style.SUCCESS(f'Users created: {users_count}'))
        self.stdout.write(self.style.SUCCESS(f'Courses created: {courses_count}'))
        self.stdout.write(self.style.SUCCESS(f'Lessons created: {lessons_count}'))
        self.stdout.write(self.style.SUCCESS(f'Quizzes created: {quizzes_count}'))
        self.stdout.write(self.style.SUCCESS(f'Questions created: {questions_count}'))
        self.stdout.write(self.style.SUCCESS(f'Choices created: {choices_count}'))
        self.stdout.write(self.style.SUCCESS(f'Enrollments created: {enrollments_count}'))
        self.stdout.write(self.style.SUCCESS(f'Progress records created: {progress_count}'))
