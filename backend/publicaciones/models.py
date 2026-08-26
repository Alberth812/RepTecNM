from django.db import models
class Publicacion(models.Model):
    titulo = models.CharField(max_length=255)
    autor = models.CharField(max_length=200)
    resumen = models.TextField()
    fecha_publicacion = models.DateField(auto_now_add=True)
    imagen_portada = models.ImageField(upload_to='publicaciones/imagenes/', blank=True, null=True)
    archivo_pdf = models.FileField(upload_to='publicaciones/documentos/', blank=True, null=True)
    def __str__(self): return self.titulo
