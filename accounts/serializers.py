from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name','last_name','username','email','password','password2','bio']
        extra_kwargs = {'first_name': {'required': True },'password': {'write_only': True}}
        
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
    bio = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=300
    )
    class Meta:
        model = User
        fields = ['first_name','last_name','username','email','role','bio']
        read_only_fields = ['first_name','last_name','username','role']

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)

    new_password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context['request'].user

        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({
                'current_password': 'Current password is incorrect.'
            })

        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        return attrs