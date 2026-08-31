from django.db import models


class Afiliado(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]
    nombre_completo = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    instituto = models.CharField(max_length=200)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fotografia = models.ImageField(upload_to='afiliados/fotos/', blank=True, null=True)
    comprobante_pago = models.FileField(upload_to='afiliados/documentos/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.nombre_completo} ({self.instituto})"


class SolicitudRegistro(models.Model):
    """
    Solicitud de registro de nuevo afiliado (RF-MEMB, RF-PERFIL).
    Recibe todos los campos del formulario multi-paso del frontend.
    """
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]
    
    # ===== PASO 1: Datos generales =====
    apellido_paterno = models.CharField(max_length=100, default='')
    apellido_materno = models.CharField(max_length=100, blank=True, default='')
    nombres = models.CharField(max_length=150, default='')
    genero = models.CharField(max_length=20, blank=True, default='')
    fotografia = models.ImageField(upload_to='solicitudes/fotos/', blank=True, null=True)
    comprobante_membresia = models.FileField(upload_to='solicitudes/documentos/', blank=True, null=True)
    
    # ===== PASO 2: Contacto =====
    telefono_celular = models.CharField(max_length=10, default='')
    telefono_casa = models.CharField(max_length=10, blank=True, default='')
    correo_electronico = models.EmailField(default='')
    linkedin = models.URLField(max_length=200, blank=True, default='')
    orcid = models.CharField(max_length=50, blank=True, default='')
    sitio_web = models.URLField(max_length=200, blank=True, default='')
    
    # ===== PASO 3: Ubicación =====
    estado_residencia = models.CharField(max_length=50, default='')
    ciudad_residencia = models.CharField(max_length=100, default='')
    disponibilidad_geografica = models.CharField(max_length=200, blank=True, default='')
    
    # ===== PASO 4: Perfil profesional =====
    area_conocimiento = models.CharField(max_length=100, default='')
    area_conocimiento_otro = models.CharField(max_length=100, blank=True, default='')
    perfil_profesional = models.TextField(blank=True, default='')
    palabras_clave = models.TextField(blank=True, default='', help_text="Separadas por comas")
    habilidades_tecnologicas = models.TextField(blank=True, default='')
    proyectos_relevantes = models.JSONField(default=list, blank=True, help_text="Lista de proyectos")
    
    # ===== PASO 5: Servicios profesionales =====
    tipo_servicios = models.CharField(max_length=100, blank=True, default='')
    tipo_servicios_otro = models.CharField(max_length=100, blank=True, default='')
    descripcion_servicios = models.TextField(blank=True, default='')
    sectores = models.JSONField(default=list, blank=True)
    sectores_otro = models.CharField(max_length=100, blank=True, default='')
    modalidad_servicios = models.CharField(max_length=100, blank=True, default='')
    interesado_en = models.JSONField(default=list, blank=True)
    interesado_en_otro = models.CharField(max_length=100, blank=True, default='')
    
    # ===== PASO 6: Datos de emergencia =====
    nombre_contacto_emergencia = models.CharField(max_length=150, default='')
    parentesco_contacto_emergencia = models.CharField(max_length=50, default='')
    parentesco_contacto_emergencia_otro = models.CharField(max_length=100, blank=True, default='')
    telefono_contacto_emergencia = models.CharField(max_length=10, default='')
    tipo_sanguineo = models.CharField(max_length=5, blank=True, default='')
    alergias_condiciones_medicas = models.TextField(blank=True, default='')
    privacidad_datos_emergencia = models.BooleanField(default=False)
    
    # ===== PASO 7: Visibilidad =====
    autoriza_publicacion = models.BooleanField(default=False)
    datos_publicos = models.JSONField(default=list, blank=True, help_text="Datos que autoriza publicar")
    
    # ===== Control =====
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_revision = models.DateTimeField(null=True, blank=True)
    revisado_por = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='solicitudes_revisadas'
    )
    observaciones = models.TextField(blank=True, default='')
    
    class Meta:
        ordering = ['-fecha_solicitud']
        verbose_name = 'Solicitud de Registro'
        verbose_name_plural = 'Solicitudes de Registro'
    
    def __str__(self):
        return f"Solicitud de {self.nombres} {self.apellido_paterno} - {self.estado}"
