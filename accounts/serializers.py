from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username','email','password','password2','bio']
        extra_kwargs = {'password': {'write_only': True}}
        
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({
                    'password2':
                    'Passwords do not match'
            })
        return attrs
    
    def create(self, validated_data):

        validated_data.pop('password2')
        validated_data['role'] = User.Role.STUDENT
        return User.objects.create_user(**validated_data)
    

class ProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['username','email','role','bio']
        read_only_fields = ['username','role']
