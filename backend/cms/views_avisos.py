from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from .models import Aviso
from .serializers_avisos import AvisoSerializer

class AvisoListCreateView(generics.ListCreateAPIView):
    serializer_class = AvisoSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        return Aviso.objects.all()

class AvisoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AvisoSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Aviso.objects.all()

class AvisoPublicView(generics.ListAPIView):
    """Lista avisos activos y vigentes para la página pública"""
    serializer_class = AvisoSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        now = timezone.now()
        return Aviso.objects.filter(
            activo=True,
        ).filter(
            models.Q(fecha_activacion__isnull=True) | models.Q(fecha_activacion__lte=now)
        ).filter(
            models.Q(fecha_expiracion__isnull=True) | models.Q(fecha_expiracion__gt=now)
        )
