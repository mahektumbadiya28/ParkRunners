"""
URL configuration for parkrunners_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core import views

urlpatterns = [
    # 🌐 MVT Web Browser Interface Form Endpoints
    path('', views.web_dashboard, name='web_dashboard'),
    path('web-login', views.web_login, name='web_login'),
    
    # 🔐 Rest APIs & Backend Services (Still alive for your Mobile Phone App!)
    path('register', views.register_user),
    path('login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('map/spots', views.get_parking_spots),
    path('ai/scan-damage', views.scan_car_damage),
    path('chat/send', views.send_message),
    path('chat/history/<int:user_a>/<int:user_b>', views.get_chat_history),
]