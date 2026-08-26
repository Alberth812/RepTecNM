from rest_framework import serializers
from .models import Afiliado
class AfiliadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Afiliado
        fields = ['id', 'nombre_completo', 'email', 'instituto', 'fecha_registro', 'estado', 'fotografia', 'comprobante_pago']
        read_only_fields = ['id', 'fecha_registro', 'estado']
