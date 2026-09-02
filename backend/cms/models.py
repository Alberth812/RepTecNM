from django.db import models

class ContenidoInicio(models.Model):
    nosotros_texto = models.TextField(max_length=1500, blank=True, help_text="Texto descriptivo de la sección Nosotros (150-1500 caracteres)")
    nosotros_imagen_1 = models.ImageField(upload_to='cms/nosotros/', blank=True, null=True)
    nosotros_imagen_2 = models.ImageField(upload_to='cms/nosotros/', blank=True, null=True)
    mision = models.TextField(max_length=1500, blank=True)
    vision = models.TextField(max_length=1500, blank=True)
    que_hacemos_texto = models.TextField(max_length=1500, blank=True, help_text="Texto descriptivo de Qué hacemos (150-1500 caracteres)")
    contacto_email = models.EmailField(blank=True)
    contacto_telefono = models.CharField(max_length=50, blank=True)
    contacto_direccion = models.TextField(blank=True)
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    afiliacion_beneficios = models.TextField(blank=True, help_text="Beneficios de la afiliación (un beneficio por línea)")
    afiliacion_requisitos = models.TextField(blank=True, help_text="Requisitos de afiliación (un requisito por línea)")
    afiliacion_proceso = models.TextField(blank=True, help_text="Pasos del proceso de afiliación (un paso por línea)")
    avisos = models.JSONField(default=list, blank=True, help_text="Lista de avisos/anuncios flotantes")
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Contenido de Página de Inicio"
        verbose_name_plural = "Contenido de Página de Inicio"
    
    def __str__(self):
        return "Contenido de Página de Inicio"
    
    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class Slide(models.Model):
    TIPO_CHOICES = [('normal', 'Normal'), ('aviso', 'Aviso importante')]
    PRIORIDAD_CHOICES = [('normal', 'Normal - 5s'), ('alta', 'Alta - primero y 8s')]
    
    contenido = models.ForeignKey(ContenidoInicio, on_delete=models.CASCADE, related_name='slides')
    orden = models.IntegerField(default=0)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='normal')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='normal')
    etiqueta = models.CharField(max_length=100, blank=True)
    titulo = models.CharField(max_length=200, blank=True)
    texto = models.TextField(max_length=500, blank=True)
    boton_texto = models.CharField(max_length=100, blank=True)
    boton_url = models.CharField(max_length=500, blank=True)
    imagen = models.ImageField(upload_to='cms/slides/', blank=True, null=True)
    
    class Meta:
        ordering = ['orden']
        verbose_name = "Slide"
        verbose_name_plural = "Slides"
    
    def __str__(self):
        return f"Slide {self.orden}: {self.titulo}"

class Testimonio(models.Model):
    contenido = models.ForeignKey(ContenidoInicio, on_delete=models.CASCADE, related_name='testimonios')
    orden = models.IntegerField(default=0)
    texto = models.TextField(max_length=250)
    autor_nombre = models.CharField(max_length=200, blank=True)
    autor_cargo = models.CharField(max_length=200, blank=True)
    
    class Meta:
        ordering = ['orden']
        verbose_name = "Testimonio"
        verbose_name_plural = "Testimonios"
    
    def __str__(self):
        return f"Testimonio {self.orden}: {self.autor_nombre}"

class Aviso(models.Model):
    TIPO_CHOICES = [
        ('info', 'Informativo'),
        ('warning', 'Advertencia'),
        ('error', 'Error'),
        ('success', 'Éxito'),
        ('urgente', 'Urgente'),
        ('importante', 'Importante'),
        ('convocatoria', 'Convocatoria'),
    ]
    
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='info')
    imagen = models.ImageField(upload_to='cms/avisos/', blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_activacion = models.DateTimeField(null=True, blank=True, help_text="Dejar vacío para activar inmediatamente")
    fecha_expiracion = models.DateTimeField(null=True, blank=True, help_text="Dejar vacío para que no expire")
    segmentacion_area = models.CharField(max_length=100, blank=True, help_text="Área de conocimiento (vacío = todos)")
    segmentacion_estado = models.CharField(max_length=50, blank=True, help_text="Estado de residencia (vacío = todos)")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = "Aviso"
        verbose_name_plural = "Avisos"
    
    def __str__(self):
        return f"{self.titulo} ({self.get_tipo_display()})"
    
    def es_activo_ahora(self):
        from django.utils import timezone
        now = timezone.now()
        if not self.activo:
            return False
        if self.fecha_activacion and now < self.fecha_activacion:
            return False
        if self.fecha_expiracion and now > self.fecha_expiracion:
            return False
        return True
