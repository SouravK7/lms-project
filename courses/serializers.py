from rest_framework import serializers
from .models import Course, Lesson, Enrollment

class LessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson
        fields = ['id','title','content','order','video_url']

class CourseSerializer(serializers.ModelSerializer):
    
    instructor_name = serializers.CharField(
        source='instructor.username',
        read_only=True
    )
    lesson_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = ['id','title','description','instructor_name','published','lesson_count','is_enrolled']

    def get_lesson_count(self,obj):
        return obj.lessons.count()
    
    def get_is_enrolled(self,obj):
        request = self.context.get('request')

        if not request or request.user.is_anonymous:
            return False

        return Enrollment.objects.filter(student=request.user,course=obj).exists()


class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(
        many=True,
        read_only=True
    )
    instructor_name = serializers.CharField(
        source='instructor.username',
        read_only=True
    )
    class Meta:
        model = Course
        fields = ['id','title','description','instructor_name','published','lessons']