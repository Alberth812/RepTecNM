from rest_framework import serializers
from .models import Aviso

class AvisoSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Aviso
        fields = ['id', 'titulo', 'contenido', 'tipo', 'imagen', 'imagen_url', 
                  'activo', 'fecha_activacion', 'fecha_expiracion', 
                  'segmentacion_area', 'segmentacion_estado',
                  'fecha_creacion', 'fecha_actualizacion']
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_imagen_url(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return f"/media/{obj.imagen}"
        return None
