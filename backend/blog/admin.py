from django.contrib import admin
from .models import PublicacionBlog

@admin.register(PublicacionBlog)
class PublicacionBlogAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'estado', 'autor', 'fecha_publicacion')
    list_filter = ('tipo', 'estado', 'fecha_publicacion')
    search_fields = ('titulo', 'subtitulo', 'contenido')
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Información General', {
            'fields': ('titulo', 'subtitulo', 'tipo', 'estado', 'autor')
        }),
        ('Contenido', {
            'fields': ('contenido', 'imagen_principal', 'archivo_pdf')
        }),
        ('Enlaces', {
            'fields': ('link_youtube', 'link_facebook', 'link_drive', 'link_personalizado', 'texto_boton_link'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('fecha_publicacion', 'fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
