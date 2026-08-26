from rest_framework import serializers
from .models import AnuncioNotificacion
from django.utils import timezone

class AnuncioNotificacionSerializer(serializers.ModelSerializer):
    esta_activo = serializers.BooleanField(read_only=True)
    tiempo_restante = serializers.SerializerMethodField()
    url_imagen = serializers.SerializerMethodField()
    url_archivo = serializers.SerializerMethodField()
    
    class Meta:
        model = AnuncioNotificacion
        fields = ['id', 'titulo', 'contenido', 'tipo', 'tamano', 'url_imagen', 'url_archivo', 'fecha_activacion', 'fecha_expiracion', 'esta_activo', 'tiempo_restante', 'creado_en']
    
    def get_url_imagen(self, obj):
        if obj.imagen and self.context.get('request'):
            return self.context['request'].build_absolute_uri(obj.imagen.url)
        return obj.imagen.url if obj.imagen else None
    
    def get_url_archivo(self, obj):
        if obj.archivo_adjunto and self.context.get('request'):
            return self.context['request'].build_absolute_uri(obj.archivo_adjunto.url)
        return obj.archivo_adjunto.url if obj.archivo_adjunto else None
    
    def get_tiempo_restante(self, obj):
        if not obj.esta_activo(): return None
        restante = obj.fecha_expiracion - timezone.now()
        return {'dias': restante.days, 'horas': restante.seconds // 3600, 'texto': f"{restante.days} días" if restante.days > 0 else f"{restante.seconds // 3600} horas"}
