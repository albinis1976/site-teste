from django.urls import path
from .logging_views import FrontendLogView

urlpatterns = [
    path('', FrontendLogView.as_view(), name='log-frontend'),
]
