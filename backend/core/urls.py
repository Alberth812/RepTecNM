from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnuncioNotificacionViewSet
router = DefaultRouter()
router.register(r'anuncios', AnuncioNotificacionViewSet)
urlpatterns = [path('', include(router.urls))]
