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
    subtitulo = models.CharField(max_length=300, blank=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='noticia')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador')
    
    contenido = models.TextField()
    imagen_principal = models.ImageField(upload_to='blog/imagenes/', blank=True, null=True)
    archivo_pdf = models.FileField(upload_to='blog/documentos/', blank=True, null=True)
    
    link_youtube = models.URLField(blank=True)
    link_facebook = models.URLField(blank=True)
    link_drive = models.URLField(blank=True)
    link_personalizado = models.URLField(blank=True)
    texto_boton_link = models.CharField(max_length=50, default="Ver más")
    
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha_publicacion = models.DateTimeField(default=timezone.now)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_publicacion']
        verbose_name = 'Publicación de Blog'
        verbose_name_plural = 'Publicaciones de Blog'

    def __str__(self):
        return self.titulo

    def get_links(self):
        links = []
        if self.link_youtube: links.append({'url': self.link_youtube, 'tipo': 'YouTube'})
        if self.link_facebook: links.append({'url': self.link_facebook, 'tipo': 'Facebook'})
        if self.link_drive: links.append({'url': self.link_drive, 'tipo': 'Drive'})
        if self.link_personalizado: links.append({'url': self.link_personalizado, 'tipo': 'Enlace'})
        return links
