from rest_framework import serializers
from .models import PublicacionBlog

class PublicacionBlogSerializer(serializers.ModelSerializer):
    links = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()
    autor_nombre = serializers.CharField(source='autor.get_full_name', read_only=True)
    
    class Meta:
        model = PublicacionBlog
        fields = [
            'id', 'titulo', 'subtitulo', 'tipo', 'estado', 'es_destacada',
            'contenido', 'imagen_principal', 'archivo_pdf', 
            'link_youtube', 'link_facebook', 'link_externo',
            'texto_boton_link', 'color_tarjeta',
            'autor', 'autor_nombre', 'fecha_publicacion', 'fecha_creacion', 
            'orden_destacado', 'links', 'imagen_url'
        ]
        read_only_fields = ['fecha_publicacion', 'fecha_creacion', 'autor']
    
    def get_links(self, obj):
        links = []
        if obj.link_youtube:
            links.append({'url': obj.link_youtube, 'tipo': 'YouTube'})
        if obj.link_facebook:
            links.append({'url': obj.link_facebook, 'tipo': 'Facebook'})
        if obj.link_externo:
            links.append({'url': obj.link_externo, 'tipo': 'Externo'})
        return links
    
    def get_imagen_url(self, obj):
        if obj.imagen_principal:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen_principal.url)
            return obj.imagen_principal.url
        return None
