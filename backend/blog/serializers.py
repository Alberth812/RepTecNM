from rest_framework import serializers
from .models import PublicacionBlog

class PublicacionBlogSerializer(serializers.ModelSerializer):
    links = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()
    archivo_pdf_url = serializers.SerializerMethodField()
    autor_nombre = serializers.CharField(source='autor.get_full_name', read_only=True)

    class Meta:
        model = PublicacionBlog
        fields = [
            'id', 'titulo', 'subtitulo', 'tipo', 'estado', 
            'contenido', 'imagen_principal', 'archivo_pdf',
            'link_youtube', 'link_facebook', 'link_drive', 'link_personalizado',
            'texto_boton_link', 'autor', 'autor_nombre', 
            'fecha_publicacion', 'fecha_creacion', 'fecha_actualizacion',
            'imagen_url', 'archivo_pdf_url', 'links'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion', 'imagen_url', 'archivo_pdf_url', 'links', 'autor_nombre']

    def get_imagen_url(self, obj):
        if obj.imagen_principal:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen_principal.url)
            return obj.imagen_principal.url
        return None

    def get_archivo_pdf_url(self, obj):
        if obj.archivo_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.archivo_pdf.url)
            return obj.archivo_pdf.url
        return None

    def get_links(self, obj):
        return obj.get_links()
