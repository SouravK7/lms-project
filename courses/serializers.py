from rest_framework import serializers
from .models import Course, Lesson, Enrollment

class LessonSerializer(serializers.ModelSerializer):
    quiz_id = serializers.SerializerMethodField()
    def get_quiz_id(self, obj):
        return obj.quiz.id if hasattr(obj, 'quiz') else None
    class Meta:
        model = Lesson
        fields = ['id','title','content','order','video_url','quiz_id']

class CourseSerializer(serializers.ModelSerializer):
    
    instructor_name = serializers.CharField(
        source='instructor.username',
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
        source='instructor.username',
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