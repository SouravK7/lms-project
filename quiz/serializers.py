from rest_framework import serializers

from .models import Choice,Question,Quiz



class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Choice
        fields = ['id','text','is_correct']

class QuestionSerializer(serializers.ModelSerializer):

    choices = ChoiceSerializer(many=True , read_only=True)

    class Meta:
        model = Question
        fields = ['id','text','question_type','choices']

class QuizSerializer(serializers.ModelSerializer):

    questions = QuestionSerializer(
        many=True,
        read_only=True
    )

    lesson_title = serializers.CharField(
        source='lesson.title',
        read_only=True
    )

    course_id = serializers.IntegerField(
        source='lesson.course.id',
        read_only=True
    )

    course_title = serializers.CharField(
        source='lesson.course.title',
        read_only=True
    )

    class Meta:

        model = Quiz

        fields = [

            'id',

            'lesson_title',

            'course_id',

            'course_title',

            'pass_score',

            'questions'

        ]
class AnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField()


class QuizSubmissionSerializer(serializers.Serializer):
    answers = AnswerSubmissionSerializer(many=True)
