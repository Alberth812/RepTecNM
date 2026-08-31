from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ContenidoInicio
from .serializers import ContenidoInicioSerializer

class ContenidoInicioView(generics.RetrieveUpdateAPIView):
    serializer_class = ContenidoInicioSerializer
    # Solo administradores pueden modificar (GET sigue siendo público si se configura así, 
    # pero RetrieveUpdateAPIView aplica el permiso a todas las acciones. 
    # Si necesitas GET público y PUT privado, avísame para separar las vistas).
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self):
        return ContenidoInicio.load()

class ContenidoInicioPublicView(generics.RetrieveAPIView):
    serializer_class = ContenidoInicioSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        return ContenidoInicio.load()
