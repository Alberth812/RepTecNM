from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Afiliado, SolicitudRegistro
from .serializers import AfiliadoSerializer, SolicitudRegistroSerializer


class AfiliadoViewSet(viewsets.ModelViewSet):
    queryset = Afiliado.objects.all()
    serializer_class = AfiliadoSerializer
    permission_classes = [AllowAny]


class SolicitudRegistroViewSet(viewsets.ModelViewSet):
    """
    Endpoint para recibir solicitudes de registro de nuevos afiliados.
    POST /api/afiliados/solicitudes/ - Crear nueva solicitud
    GET /api/afiliados/solicitudes/ - Listar solicitudes (solo admin)
    """
    queryset = SolicitudRegistro.objects.all()
    serializer_class = SolicitudRegistroSerializer
    
    def get_permissions(self):
        """Cualquiera puede crear una solicitud, solo admin puede listar/revisar"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def aprobar(self, request, pk=None):
        """Aprobar una solicitud y crear el afiliado"""
        solicitud = self.get_object()
        
        if solicitud.estado != 'pendiente':
            return Response(
                {'error': 'La solicitud ya fue procesada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear el afiliado
        Afiliado.objects.create(
            nombre_completo=f"{solicitud.nombre} {solicitud.apellido_paterno} {solicitud.apellido_materno}".strip(),
            email=solicitud.email,
            instituto=solicitud.institucion_grado,
            estado='aprobado',
            fotografia=solicitud.fotografia,
            comprobante_pago=solicitud.comprobante_pago,
        )
        
        # Actualizar la solicitud
        solicitud.estado = 'aprobado'
        solicitud.fecha_revision = __import__('django.utils.timezone', fromlist=['now']).now()
        solicitud.revisado_por = request.user
        solicitud.observaciones = request.data.get('observaciones', '')
        solicitud.save()
        
        return Response({'message': 'Solicitud aprobada y afiliado creado'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def rechazar(self, request, pk=None):
        """Rechazar una solicitud"""
        solicitud = self.get_object()
        
        if solicitud.estado != 'pendiente':
            return Response(
                {'error': 'La solicitud ya fue procesada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        solicitud.estado = 'rechazado'
        solicitud.fecha_revision = __import__('django.utils.timezone', fromlist=['now']).now()
        solicitud.revisado_por = request.user
        solicitud.observaciones = request.data.get('observaciones', '')
        solicitud.save()
        
        return Response({'message': 'Solicitud rechazada'})
