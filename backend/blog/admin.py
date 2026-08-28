from django.contrib import admin
from .models import PublicacionBlog

@admin.register(PublicacionBlog)
class PublicacionBlogAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'estado', 'es_destacada', 'fecha_publicacion', 'autor')
    list_filter = ('tipo', 'estado', 'es_destacada', 'fecha_publicacion')
    search_fields = ('titulo', 'subtitulo', 'contenido')
    readonly_fields = ('fecha_creacion', 'fecha_publicacion')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('titulo', 'subtitulo', 'tipo', 'estado', 'es_destacada', 'color_tarjeta')
        }),
        ('Contenido', {
            'fields': ('contenido', 'imagen_principal', 'archivo_pdf')
        }),
        ('Enlaces y Botones', {
            'fields': ('link_youtube', 'link_facebook', 'link_externo', 'texto_boton_link'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('autor', 'orden_destacado', 'fecha_creacion', 'fecha_publicacion'),
            'classes': ('collapse',)
        }),
    )
    
    list_per_page = 20
    date_hierarchy = 'fecha_publicacion'
