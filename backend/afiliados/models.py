from django.db import models
class Afiliado(models.Model):
    ESTADO_CHOICES = [('pendiente', 'Pendiente'), ('aprobado', 'Aprobado'), ('rechazado', 'Rechazado')]
    nombre_completo = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    instituto = models.CharField(max_length=200)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fotografia = models.ImageField(upload_to='afiliados/fotos/', blank=True, null=True)
    comprobante_pago = models.FileField(upload_to='afiliados/documentos/', blank=True, null=True)
    def __str__(self): return f"{self.nombre_completo} ({self.instituto})"
