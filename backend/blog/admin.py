from django.contrib import admin
from .models import PublicacionBlog

@admin.register(PublicacionBlog)
class PublicacionBlogAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista (sin es_destacada)
    list_display = ('folio', 'titulo', 'tipo', 'estado', 'fecha_publicacion')
    
    # Filtros laterales (sin es_destacada)
    list_filter = ('tipo', 'estado', 'fecha_publicacion')
    
    # Búsqueda por folio, título o contenido
    search_fields = ('folio', 'titulo', 'contenido')
    
    # Campos de solo lectura
    readonly_fields = ('folio', 'fecha_creacion')
    
    # Organización del formulario en el admin
    fieldsets = (
        ('Información Básica', {
            'fields': ('titulo', 'subtitulo', 'tipo', 'estado')
        }),
        ('Contenido', {
            'fields': ('contenido', 'imagen_principal')
        }),
        ('Enlaces Externos', {
            'fields': ('link_youtube', 'link_facebook', 'link_externo', 'texto_boton_link'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('folio', 'autor', 'fecha_publicacion', 'fecha_creacion'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Asignar automáticamente el autor si es una creación nueva
        if not change and not obj.autor:
            obj.autor = request.user
        super().save_model(request, obj, form, change)
