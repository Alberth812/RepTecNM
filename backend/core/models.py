from django.db import models
from django.utils import timezone
from datetime import timedelta

class AnuncioNotificacion(models.Model):
    TIPO_CHOICES = [('info', 'Informativo'), ('aviso', 'Aviso Importante'), ('urgente', 'Urgente'), ('convocatoria', 'Convocatoria')]
    TAMANO_CHOICES = [('pequeno', 'Pequeño (solo texto)'), ('mediano', 'Mediano (texto + imagen)'), ('grande', 'Grande (imagen destacada)'), ('completo', 'Completo (documento/PDF)')]
    
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='info')
    tamano = models.CharField(max_length=20, choices=TAMANO_CHOICES, default='mediano')
    imagen = models.ImageField(upload_to='anuncios/imagenes/', blank=True, null=True)
    archivo_adjunto = models.FileField(upload_to='anuncios/documentos/', blank=True, null=True)
    fecha_activacion = models.DateTimeField(default=timezone.now)
    fecha_expiracion = models.DateTimeField()
    activo = models.BooleanField(default=True)
    mostrable = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_activacion']
        verbose_name = 'Notificación/Anuncio'
        verbose_name_plural = 'Notificaciones/Anuncios'
    
    def save(self, *args, **kwargs):
        if not self.fecha_expiracion:
            dias = 3 if self.tipo == 'urgente' else (7 if self.tipo == 'aviso' else 30)
            self.fecha_expiracion = self.fecha_activacion + timedelta(days=dias)
        super().save(*args, **kwargs)
    
    def esta_activo(self):
        ahora = timezone.now()
        return self.activo and self.mostrable and self.fecha_activacion <= ahora <= self.fecha_expiracion
    
    def __str__(self):
        return f"{self.titulo} ({self.get_tipo_display()})"
