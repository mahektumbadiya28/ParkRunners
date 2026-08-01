from django.urls import path
from . import views

urlpatterns = [
    path('predict-demand/', views.predict_demand, name='predict_demand'),
    path('dynamic-price/', views.dynamic_pricing, name='dynamic_pricing'),
    path('recommend-parking/', views.recommend_parking, name='recommend_parking'),
]
