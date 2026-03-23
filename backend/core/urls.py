from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def welcome(request):
    return JsonResponse({
        "status": "online", 
        "message": "Welcome to the English Course Platform API"
    })

urlpatterns = [
    path('', welcome, name='welcome'),
    path('admin/', admin.site.urls),

    path('api/accounts/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/payments/', include('payments.urls')),
]
