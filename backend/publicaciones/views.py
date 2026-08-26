from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Publicacion
from .serializers import PublicacionSerializer
class PublicacionViewSet(viewsets.ModelViewSet):
    queryset = Publicacion.objects.all().order_by('-fecha_publicacion')
    serializer_class = PublicacionSerializer
    permission_classes = [AllowAny]
