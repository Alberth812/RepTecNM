from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from .models import PublicacionBlog
from .serializers import PublicacionBlogSerializer

class PublicacionBlogViewSet(viewsets.ModelViewSet):
    serializer_class = PublicacionBlogSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'subtitulo', 'contenido', 'tipo']
    ordering_fields = ['fecha_publicacion']
    ordering = ['-fecha_publicacion']
    
    def get_queryset(self):
        # Los admins ven todo (borradores y publicados), el público solo lo publicado
        if self.request.user.is_staff:
            return PublicacionBlog.objects.all().order_by('-fecha_publicacion')
        return PublicacionBlog.objects.filter(estado='publicado').order_by('-fecha_publicacion')
    
    def get_permissions(self):
        # Permitir siempre las peticiones OPTIONS (preflight de CORS)
        if self.request.method == 'OPTIONS':
            return [permissions.AllowAny()]
        # Listar y ver detalle es público
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Crear, actualizar y eliminar es solo para admins
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(autor=self.request.user)
        else:
            serializer.save()
            
    def perform_update(self, serializer):
        if self.request.user.is_authenticated and not serializer.instance.autor:
            serializer.save(autor=self.request.user)
        else:
            serializer.save()
