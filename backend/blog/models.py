from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class PublicacionBlog(models.Model):
    TIPO_CHOICES = [
        ('evento', 'Evento'),
        ('reunion', 'Reunión'),
        ('curiosidad', 'Curiosidad'),
        ('noticia', 'Noticia'),
        ('otro', 'Otro'),
    ]
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('publicado', 'Publicado'),
    ]

    titulo = models.CharField(max_length=200)
    subtitulo = models.CharField(max_length=300, blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='noticia')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador')
    es_destacada = models.BooleanField(default=False, help_text='Mostrar en página principal')
    contenido = models.TextField()
    
    # Archivos
    imagen_principal = models.ImageField(upload_to='blog/imagenes/', null=True, blank=True)
    archivo_pdf = models.FileField(upload_to='blog/documentos/', null=True, blank=True)
    
    # Links y botones
    link_youtube = models.URLField(max_length=500, blank=True, null=True)
    link_facebook = models.URLField(max_length=500, blank=True, null=True)
    link_externo = models.URLField(max_length=500, blank=True, null=True)
    texto_boton_link = models.CharField(max_length=100, blank=True, null=True)
    color_tarjeta = models.CharField(max_length=20, default='blue', blank=True, null=True)
    
    # Metadatos
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_publicacion = models.DateTimeField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    orden_destacado = models.IntegerField(default=0)

    class Meta:
        ordering = ['-fecha_publicacion', '-fecha_creacion']

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        # Si se publica y no tiene fecha, asignar la actual
        if self.estado == 'publicado' and not self.fecha_publicacion:
            self.fecha_publicacion = timezone.now()
        super().save(*args, **kwargs)
