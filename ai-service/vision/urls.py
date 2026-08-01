from django.urls import path
from . import views

urlpatterns = [
    path('detect-damage/', views.detect_damage, name='detect_damage'),
]
