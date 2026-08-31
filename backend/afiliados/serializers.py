import json
from rest_framework import serializers
from .models import Afiliado, SolicitudRegistro


class AfiliadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Afiliado
        fields = ['id', 'nombre_completo', 'email', 'instituto', 'fecha_registro', 'estado', 'fotografia', 'comprobante_pago']
        read_only_fields = ['id', 'fecha_registro', 'estado']


class SolicitudRegistroSerializer(serializers.ModelSerializer):
    """
    Serializer para recibir solicitudes de registro.
    Maneja el formato FormData que envía el frontend:
    - Campo 'payload': JSON string con todos los datos textuales
    - Campos 'fotografia' y 'comprobante_membresia': archivos
    """
    
    class Meta:
        model = SolicitudRegistro
        fields = '__all__'
        read_only_fields = ['id', 'fecha_solicitud', 'estado', 'fecha_revision', 'revisado_por', 'observaciones']
    
    def to_internal_value(self, data):
        """
        Desempaqueta el campo 'payload' (JSON string) y combina sus datos con
        los archivos recibidos. Los nombres de campos ya coinciden entre
        frontend y backend.
        """
        # Extraer el payload JSON
        payload_raw = data.get('payload')
        if isinstance(payload_raw, str):
            try:
                payload = json.loads(payload_raw)
            except json.JSONDecodeError:
                raise serializers.ValidationError({'payload': 'JSON inválido.'})
        else:
            payload = payload_raw or {}
        
        # Construir el diccionario interno combinando payload + archivos
        internal_data = dict(payload)
        
        # Archivos (vienen como campos separados en el FormData)
        if 'fotografia' in data:
            internal_data['fotografia'] = data['fotografia']
        if 'comprobante_membresia' in data:
            internal_data['comprobante_membresia'] = data['comprobante_membresia']
        
        # Llamar al método padre con los datos ya combinados
        return super().to_internal_value(internal_data)
