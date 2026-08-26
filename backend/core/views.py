from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import AnuncioNotificacion
from .serializers import AnuncioNotificacionSerializer

class AnuncioNotificacionViewSet(viewsets.ModelViewSet):
    queryset = AnuncioNotificacion.objects.all()
    serializer_class = AnuncioNotificacionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        ahora = timezone.now()
        anuncios = AnuncioNotificacion.objects.filter(activo=True, mostrable=True, fecha_activacion__lte=ahora, fecha_expiracion__gte=ahora).order_by('-fecha_activacion')
        return Response(self.get_serializer(anuncios, many=True, context={'request': request}).data)
