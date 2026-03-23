from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile
import re


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=False)
    full_name = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=Profile.ROLE_CHOICES, write_only=True, required=False, default='student')

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'full_name', 'role')

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if password2 and password != password2:
            raise serializers.ValidationError(
                {"password": "As senhas não conferem."})

        if re.search(r'(012|123|234|345|456|567|678|789|890|098|987|876|765|654|543|432|321|210)', password):
            raise serializers.ValidationError(
                {"password": "Senha não pode conter sequências numéricas óbvias."})
        if ' ' in password:
            raise serializers.ValidationError(
                {"password": "Senha não pode conter espaços."})
        if password.isalpha():
            raise serializers.ValidationError(
                {"password": "Senha deve conter pelo menos um número."})
        if password.isdigit():
            raise serializers.ValidationError(
                {"password": "Senha deve conter pelo menos uma letra."})

        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )
        # Students roles are default, but we ensure it here
        user.profile.role = 'student'
        user.profile.save()
        return user


class TeacherCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.profile.role = 'teacher'
        user.profile.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role')

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role')
