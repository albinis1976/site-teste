from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, TeacherCreateSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def dispatch(self, *args, **kwargs):
        print(f"DEBUG: RegisterView dispatch - {self.request.method}")
        return super().dispatch(*args, **kwargs)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class TeacherCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = TeacherCreateSerializer
    permission_classes = [permissions.IsAdminUser]


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email é obrigatório."}, status=400)
        
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
            
            subject = "Recuperação de Senha - English Academy"
            message = f"Olá {user.username},\n\nVocê solicitou a recuperação de senha da sua conta.\n" \
                      f"Acesse o link abaixo para redefinir sua senha:\n{reset_url}\n\n" \
                      f"Se você não solicitou essa recuperação, ignore este email.\n"
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"SMTP Error: {e}")
                return Response({"detail": "Falha no servidor de email. Verifique as configurações SMTP."}, status=500)
            
            print(f"--- PASSWORD RESET REQUEST ---")
            print(f"User: {email}")
            print(f"Token: {token}")
            print(f"UID: {uid}")
            print(f"------------------------------")
            
            return Response({"detail": "Se o email estiver cadastrado, as instruções de recuperação foram enviadas."}, status=200)
        except User.DoesNotExist:
            return Response({"detail": "Se o email estiver cadastrado, as instruções de recuperação foram enviadas."}, status=200)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not all([uidb64, token, new_password]):
            return Response({"detail": "Todos os campos são obrigatórios."}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"detail": "Senha alterada com sucesso."}, status=200)
            else:
                return Response({"detail": "Token inválido ou expirado."}, status=400)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Link de recuperação inválido."}, status=400)
