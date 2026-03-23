from django.http import Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Course, Enrollment, Lesson
from .serializers import CourseSerializer, EnrollmentSerializer, LessonSerializer
from .permissions import IsTeacherOrAdmin, IsOwnerOrTeacherOrAdmin


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get_queryset(self):
        return Course.objects.filter(is_published=True)


class CourseCreateView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrAdmin]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'teacher']):
                return Course.objects.all()
        return Course.objects.filter(is_published=True)

    def get_object(self):
        queryset = self.get_queryset()
        pk = self.kwargs.get('pk')
        slug = self.kwargs.get('slug')
        
        if pk is not None:
            return generics.get_object_or_404(queryset, pk=pk)
        if slug is not None:
            return generics.get_object_or_404(queryset, slug=slug)
            
        raise Http404("Curso não especificado.")

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsOwnerOrTeacherOrAdmin()]


class EnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        try:
            # Suporta ID numérico ou Slug
            if str(course_id).isdigit():
                course = Course.objects.get(id=course_id)
            else:
                course = Course.objects.get(slug=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Curso não encontrado."}, status=404)

        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'is_active': False}
        )
        if not created:
            return Response({"detail": "Usuário já matriculado neste curso."}, status=400)

        return Response({"detail": "Matrícula realizada com sucesso."}, status=201)


class TeacherCourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)


class LessonDetailView(generics.RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        lesson = super().get_object()
        user = self.request.user

        # Lógica de Acesso (Sincronizada com Serializer)
        has_access = False

        # 1. Preview ou Curso Gratuito
        if getattr(lesson, 'is_free', False) or getattr(lesson, 'is_preview', False):
            has_access = True
        elif getattr(lesson.course, 'is_free', False):
            has_access = True

        # 2. Superuser, Staff ou Admin/Professor
        elif user.is_superuser or user.is_staff:
            has_access = True
        elif hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                has_access = True
            elif user.profile.role == 'teacher' and lesson.course.teacher == user:
                has_access = True

        # 3. Matrícula Ativa
        if not has_access:
            if Enrollment.objects.filter(user=user, course=lesson.course, is_active=True).exists():
                has_access = True

        if has_access:
            return lesson

        raise permissions.exceptions.PermissionDenied(
            "Você precisa de uma matrícula ativa para acessar este conteúdo pago."
        )


class CourseAccessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            if str(course_id).isdigit():
                course = Course.objects.get(id=course_id)
            else:
                course = Course.objects.get(slug=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Curso não encontrado.", "has_access": False}, status=404)

        user = request.user

        # 1. Superuser, Staff ou Admin/Professor do curso
        if user.is_superuser or user.is_staff:
            return Response({"has_access": True})
            
        if hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                return Response({"has_access": True})
            if user.profile.role == 'teacher' and course.teacher == user:
                return Response({"has_access": True})

        # 2. Curso Gratuito
        if getattr(course, 'is_free', False):
            return Response({"has_access": True})

        # 3. Matrícula Ativa
        if Enrollment.objects.filter(user=user, course=course, is_active=True).exists():
            return Response({"has_access": True})

        return Response({"has_access": False})
