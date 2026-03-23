import stripe
import logging

logger = logging.getLogger(__name__)
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from courses.models import Course, Enrollment
from .services.stripe_service import StripeService

class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, identifier):
        try:
            if str(identifier).isdigit():
                course = Course.objects.get(id=identifier)
            else:
                course = Course.objects.get(slug=identifier)
        except Course.DoesNotExist:
            return Response({"detail": "Curso não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if course.is_free:
            return Response({"detail": "Cursos gratuitos não precisam de pagamento."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate duplicate enrollment logic (DB source of truth)
        if Enrollment.objects.filter(user=request.user, course=course, is_active=True).exists():
            return Response({"detail": "Você já possui acesso a este curso."}, status=status.HTTP_400_BAD_REQUEST)

        # Define URLs for success and cancel matching frontend React router
        frontend_url = "http://localhost:5173"
        success_url = f"{frontend_url}/dashboard?checkout=success"
        cancel_url = f"{frontend_url}/courses"

        try:
            checkout_url = StripeService.create_checkout_session(
                course=course,
                user=request.user,
                success_url=success_url,
                cancel_url=cancel_url
            )
            return Response({'checkout_url': checkout_url}, status=status.HTTP_200_OK)
        
        except stripe.error.StripeError as e:
            logger.error(f"Falha de Gateway Stripe (User: {request.user.id}, Course: {course.id}): {str(e)}")
            return Response({'detail': str(e.user_message) if getattr(e, 'user_message', None) else str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            logger.exception(f"Erro interno no Checkout API: {str(e)}")
            return Response({'detail': "Ocorreu um erro interno ao processar o pagamento Stripe."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(APIView):
    # O Stripe dispara o Webhook de fora sem logar, logo tem que ser AllowAny
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Stripe precisa do RAW payload para validar hash sha256
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        if not sig_header:
            return Response({'detail': 'Assinatura inválida.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event = StripeService.construct_event(payload, sig_header)
        except ValueError as e:
            logger.warning(f"Webhook rejeitado (Payload inválido): {str(e)}")
            return Response({'detail': 'Payload inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            logger.critical(f"Segurança: Tentativa de forja de Webhook Stripe Detectada! Origem IP bloqueado logicamente. Erro: {str(e)}")
            return Response({'detail': 'Assinatura suspeita. Tentativa bloqueada.'}, status=status.HTTP_400_BAD_REQUEST)

        # Tratar apenas as sessões concluídas
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            metadata = session.get('metadata', {})
            
            user_id = metadata.get('user_id')
            course_id = metadata.get('course_id')

            if user_id and course_id:
                try:
                    user = User.objects.get(id=user_id)
                    course = Course.objects.get(id=course_id)
                    
                    # Idempotência: Cria caso não tenha, atualiza (is_active=True) caso já possua mas esteja bloqueado
                    Enrollment.objects.update_or_create(
                        user=user, 
                        course=course,
                        defaults={'is_active': True}
                    )
                    logger.info(f"Webhook Sucesso: Acesso Garantido para User {user_id} no Curso {course_id} - Sessão: {session.get('id')}")
                except (User.DoesNotExist, Course.DoesNotExist):
                    logger.error(f"Inconsistência de BD no Webhook: User ou Course inexistente. User_id: {user_id}, Course_id: {course_id}")
                    # Retornamos 200 até quando não acha o usuário pra não enfileirar o Webhook retry eternamente no Stripe
                    pass
            else:
                logger.warning(f"Webhook Sucesso ignorado: Metadados insuficientes. URL ou Integração Frontend podem estar corrompidas. Sessão: {session.get('id')}")

        return Response(status=status.HTTP_200_OK)
