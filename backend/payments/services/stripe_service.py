import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    @staticmethod
    def create_checkout_session(course, user, success_url, cancel_url):
        """
        Creates a Stripe Checkout Session for a specific course and user.
        Raises stripe.error.StripeError if the API call fails.
        """
        session = stripe.checkout.Session.create(
            payment_method_types=['card', 'boleto', 'pix'],
            line_items=[{
                'price_data': {
                    'currency': 'brl',
                    'product_data': {
                        'name': course.title,
                        'description': f'Acesso vitalício ao {course.title}',
                    },
                    'unit_amount': int(course.price * 100),  # Stripe uses cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user.email,
            client_reference_id=str(user.id),
            metadata={
                'course_id': str(course.id),
                'user_id': str(user.id),
            }
        )
        return session.url

    @staticmethod
    def construct_event(payload, sig_header):
        """
        Validates webhook payload against the secret key and returns the event.
        Raises ValueError or stripe.error.SignatureVerificationError on failure.
        """
        return stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
