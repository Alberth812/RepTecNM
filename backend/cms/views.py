from rest_framework import generics, permissions
from rest_framework.permissions import IsAdminUser
from .models import ContenidoInicio
from .serializers import ContenidoInicioSerializer

class ContenidoInicioView(generics.RetrieveUpdateAPIView):
    serializer_class = ContenidoInicioSerializer
    permission_classes = [permissions.AllowAny]
    def get_object(self):
        return ContenidoInicio.load()

class ContenidoInicioPublicView(generics.RetrieveAPIView):
    serializer_class = ContenidoInicioSerializer
    permission_classes = []
    def get_object(self):
        return ContenidoInicio.load()
