from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AfiliadoViewSet, SolicitudRegistroViewSet

router = DefaultRouter()
router.register(r'afiliados', AfiliadoViewSet, basename='afiliado')
router.register(r'solicitudes', SolicitudRegistroViewSet, basename='solicitud')

urlpatterns = [
    path('', include(router.urls)),
]
