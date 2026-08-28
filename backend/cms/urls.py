from django.urls import path
from . import views

urlpatterns = [
    path('contenido-inicio/', views.ContenidoInicioView.as_view(), name='contenido-inicio'),
    path('contenido-inicio/publico/', views.ContenidoInicioPublicView.as_view(), name='contenido-inicio-publico'),
]
