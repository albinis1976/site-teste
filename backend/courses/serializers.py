from rest_framework import serializers
from .models import Course, Enrollment, Lesson, Module
from django.contrib.auth.models import User

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class LessonSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'course', 'module', 'title', 'content', 'video_url', 'order', 'is_free', 'is_preview', 'is_locked']

    def get_is_locked(self, obj):
        # 1. Cursos gratuitos ou lições de preview nunca estão bloqueadas
        if getattr(obj.course, 'is_free', False) or getattr(obj, 'is_preview', False):
            return False

        request = self.context.get('request')
        
        # 2. Usuários anônimos estão bloqueados em qualquer conteúdo que não seja preview/gratuito
        if not request or not request.user.is_authenticated:
            return True
            
        user = request.user

        # 3. Superusuários, Staff ou Admin/Teacher (do próprio curso) têm acesso total
        if user.is_superuser or user.is_staff:
            return False
            
        if hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                return False
            if user.profile.role == 'teacher' and getattr(obj.course, 'teacher', None) == user:
                return False

        # 4. Conteúdo pago exige matrícula ativa
        return not Enrollment.objects.filter(user=user, course=obj.course, is_active=True).exists()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Pruning de dados sensíveis no backend se estiver bloqueado
        if representation.get('is_locked', True):
            representation['video_url'] = ""
            representation['content'] = "Este conteúdo é exclusivo para alunos matriculados ou requer privilégios de acesso."
        return representation


class ModuleSerializer(serializers.ModelSerializer):
    # Map the recursive lessons natively
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'lessons']


class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(profile__role='teacher'),
        source='teacher',
        write_only=True,
        required=False
    )

    # Maintained exact backward compatibility flat list array structure
    lessons = LessonSerializer(many=True, read_only=True)
    # Appended new isolated Module hierarchy smoothly without causing constraints
    modules = ModuleSerializer(many=True, read_only=True)
    is_locked = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'thumbnail', 'level', 'price', 
            'is_free', 'is_published', 'teacher', 'teacher_id', 'modules', 'lessons', 
            'created_at', 'updated_at', 'is_locked'
        ]

    def get_is_locked(self, obj):
        # 1. Curso gratuito nunca está bloqueado
        if getattr(obj, 'is_free', False):
            return False

        request = self.context.get('request')
        
        # 2. Usuário anônimo está bloqueado para cursos pagos
        if not request or not request.user.is_authenticated:
            return True

        user = request.user
        
        # 3. Superusuário, Staff, Admin ou o próprio Professor do curso têm acesso
        if user.is_superuser or user.is_staff:
            return False
            
        if hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                return False
            if user.profile.role == 'teacher' and getattr(obj, 'teacher', None) == user:
                return False

        # 4. Curso pago exige matrícula ativa
        return not Enrollment.objects.filter(user=user, course=obj, is_active=True).exists()


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'created_at', 'is_active', 'progress']

    def get_progress(self, obj):
        # Placeholder progress logic - could be linked to LessonCompletion in future
        import random
        return random.randint(5, 45) if obj.is_active else 0
