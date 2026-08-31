from rest_framework import serializers
from .models import PublicacionBlog

class PublicacionBlogSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.CharField(source='autor.get_full_name', read_only=True)
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PublicacionBlog
        fields = [
            'id', 'folio', 'titulo', 'subtitulo', 'tipo', 'estado',
            'contenido', 'imagen_principal', 'imagen_url',
            'link_destacado', 'texto_boton_link',
            'autor', 'autor_nombre', 'fecha_publicacion', 'fecha_creacion'
        ]
        read_only_fields = ['folio', 'fecha_publicacion', 'fecha_creacion', 'autor']
    
    def get_imagen_url(self, obj):
        if obj.imagen_principal:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen_principal.url)
            return obj.imagen_principal.url
        return None
