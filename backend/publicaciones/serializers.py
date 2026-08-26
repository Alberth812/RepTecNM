from rest_framework import serializers
from .models import Publicacion
class PublicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicacion
        fields = ['id', 'titulo', 'autor', 'resumen', 'fecha_publicacion', 'imagen_portada', 'archivo_pdf']
        read_only_fields = ['id', 'fecha_publicacion']
