from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PublicacionBlog
from .serializers import PublicacionBlogSerializer

class PublicacionBlogViewSet(viewsets.ModelViewSet):
    # Orden estricto: las más recientes primero
    queryset = PublicacionBlog.objects.filter(estado='publicado').order_by('-fecha_publicacion')
    serializer_class = PublicacionBlogSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'subtitulo', 'contenido', 'tipo']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
