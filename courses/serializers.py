from rest_framework import serializers
from .models import (Course, Lesson, Enrollment, Progress)
from django.utils import timezone
from django.db.models import Count

class LessonSerializer(serializers.ModelSerializer):
    quiz_id = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    def get_quiz_id(self, obj):
        return obj.quiz.id if hasattr(obj, 'quiz') else None

    def get_is_completed(self, obj):
        request = self.context.get('request')

        if not request or request.user.is_anonymous:
            return False

        return Progress.objects.filter(
            student=request.user,
            lesson=obj,
            completed=True
        ).exists()

    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'content',
            'order',
            'video_url',
            'quiz_id',
            'is_completed'
        ]

class CourseSerializer(serializers.ModelSerializer):
    
    instructor_name = serializers.CharField(
        source='instructor.get_full_name',
        read_only=True
    )
    lesson_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    def get_lesson_count(self,obj):
        return obj.lessons.count()
    
    def get_is_enrolled(self,obj):
        request = self.context.get('request')

        if not request or request.user.is_anonymous:
            return False

        return Enrollment.objects.filter(student=request.user,course=obj).exists()
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'instructor_name',
            'published',
            'created_at',
            'lesson_count',
            'is_enrolled'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(
        many=True,
        read_only=True
    )
    instructor_name = serializers.CharField(
        source='instructor.get_full_name',
        read_only=True
    )
    is_enrolled = serializers.SerializerMethodField()
    def get_is_enrolled(self, obj):
        request = self.context.get('request')

        if not request or request.user.is_anonymous:
            return False

        return Enrollment.objects.filter(
            student=request.user,
            course=obj
        ).exists()
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'instructor_name',
            'published',
            'created_at',
            'lessons',
            'is_enrolled'
        ]

class CertificateSerializer(serializers.Serializer):

    student_name = serializers.CharField()

    course_name = serializers.CharField()

    completed_at = serializers.DateField()

    certificate_id = serializers.CharField()

class InstructorCourseSerializer(serializers.ModelSerializer):

    lesson_count = serializers.IntegerField(

        source="lessons.count",

        read_only=True

    )


    student_count = serializers.SerializerMethodField()


    instructor_name = serializers.CharField(

        source="instructor.get_full_name",

        read_only=True

    )


    def get_student_count(self, obj):

        return Enrollment.objects.filter(

            course=obj

        ).count()


    class Meta:

        model = Course

        fields = [

            "id",

            "title",

            "description",

            "published",

            "created_at",

            "lesson_count",

            "student_count",

            "instructor_name"

        ]




class InstructorLessonSerializer(

    serializers.ModelSerializer

):
    quiz_id = serializers.SerializerMethodField()

    def get_quiz_id(self, obj):

        return obj.quiz.id if hasattr(obj, "quiz") else None

    class Meta:

        model = Lesson

        fields = [

            "id",

            "title",

            "content",

            "order",

            "video_url",

            "course",

            "quiz_id"

        ]

        read_only_fields = [

            "course"

        ]
