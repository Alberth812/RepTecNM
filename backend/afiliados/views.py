from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Afiliado
from .serializers import AfiliadoSerializer
class AfiliadoViewSet(viewsets.ModelViewSet):
    queryset = Afiliado.objects.all()
    serializer_class = AfiliadoSerializer
    permission_classes = [AllowAny]
