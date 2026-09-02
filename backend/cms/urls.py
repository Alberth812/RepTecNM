from django.urls import path
from . import views

urlpatterns = [
    path('contenido-inicio/', views.ContenidoInicioView.as_view(), name='contenido-inicio'),
    path('contenido-inicio/publico/', views.ContenidoInicioPublicView.as_view(), name='contenido-inicio-publico'),
]
from .views_avisos import AvisoListCreateView, AvisoRetrieveUpdateDestroyView, AvisoPublicView

urlpatterns += [
    path('avisos/', AvisoListCreateView.as_view(), name='aviso-list-create'),
    path('avisos/<int:pk>/', AvisoRetrieveUpdateDestroyView.as_view(), name='aviso-detail'),
    path('avisos/publicos/', AvisoPublicView.as_view(), name='aviso-public'),
]
