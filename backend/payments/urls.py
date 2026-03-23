from django.urls import path
from . import views

urlpatterns = [
    path('create-checkout-session/<str:identifier>/',
         views.CreateCheckoutSessionView.as_view(), name='create_checkout_session'),
    path('webhook/', 
         views.StripeWebhookView.as_view(), name='stripe_webhook'),
]
