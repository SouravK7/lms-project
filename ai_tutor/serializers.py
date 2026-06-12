from rest_framework import serializers

class ChatRequestSerializer(serializers.Serializer):
    lesson_id = serializers.IntegerField()
    message = serializers.CharField(max_length=2000)
