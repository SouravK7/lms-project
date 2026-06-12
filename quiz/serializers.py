from rest_framework import serializers

from .models import Choice,Question,Quiz



class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Choice
        fields = ['id','text']

class QuestionSerializer(serializers.ModelSerializer):

    choices = ChoiceSerializer(many=True , read_only=True)

    class Meta:
        model = Question
        fields = ['id','text','question_type','choices']

class QuizSerializer(serializers.ModelSerializer):
    
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id','pass_score','questions']

class AnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField()


class QuizSubmissionSerializer(serializers.Serializer):
    answers = AnswerSubmissionSerializer(many=True)
