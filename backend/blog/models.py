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

    folio = models.CharField(max_length=20, unique=True, blank=True, null=True, editable=False)
    
    titulo = models.CharField(max_length=200)
    subtitulo = models.CharField(max_length=300, blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='noticia')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador')
    contenido = models.TextField(blank=True, null=True)
    
    # Imagen y archivo
    imagen_principal = models.ImageField(upload_to='blog/imagenes/', null=True, blank=True)
    
    # Un solo link con botón personalizable
    link_destacado = models.URLField(max_length=500, blank=True, null=True, help_text="Link externo destacado")
    texto_boton_link = models.CharField(max_length=100, default="Ver más", blank=True, null=True, help_text="Texto del botón")
    
    # Metadatos
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_publicacion = models.DateTimeField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_publicacion', '-fecha_creacion']

    def __str__(self):
        return f"{self.folio or 'Sin Folio'} - {self.titulo}"

    def save(self, *args, **kwargs):
        # Generar folio automático si es nueva publicación
        if not self.folio:
            year = timezone.now().year
            ultimo = PublicacionBlog.objects.filter(folio__startswith=f'BLOG-{year}-').order_by('-id').first()
            if ultimo and ultimo.folio:
                try:
                    secuencia = int(ultimo.folio.split('-')[-1]) + 1
                except (ValueError, IndexError):
                    secuencia = 1
            else:
                secuencia = 1
            self.folio = f'BLOG-{year}-{secuencia:04d}'
        
        # Asignar fecha de publicación si se cambia a "publicado"
        if self.estado == 'publicado' and not self.fecha_publicacion:
            self.fecha_publicacion = timezone.now()
            
        super().save(*args, **kwargs)
