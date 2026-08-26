from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import AnuncioNotificacion

@admin.register(AnuncioNotificacion)
class AnuncioNotificacionAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'tipo', 'tamano', 'fecha_activacion', 'fecha_expiracion', 'estado', 'mostrable']
    list_filter = ['tipo', 'tamano', 'activo', 'mostrable']
    search_fields = ['titulo', 'contenido']
    readonly_fields = ['creado_en', 'actualizado_en', 'vista_previa']
    fieldsets = (
        ('Información básica', {'fields': ('titulo', 'contenido', 'tipo', 'tamano')}),
        ('Archivos', {'fields': ('imagen', 'archivo_adjunto', 'vista_previa'), 'classes': ('collapse',)}),
        ('Vigencia', {'fields': ('fecha_activacion', 'fecha_expiracion')}),
        ('Control', {'fields': ('activo', 'mostrable')}),
    )
    def estado(self, obj):
        if not obj.activo: return format_html('<span style="color: red;">● Inactivo</span>')
        if not obj.mostrable: return format_html('<span style="color: orange;">● Oculto</span>')
        if obj.fecha_expiracion < timezone.now(): return format_html('<span style="color: gray;">● Expirado</span>')
        return format_html('<span style="color: green;">● Activo</span>')
    def vista_previa(self, obj):
        return format_html('<img src="{}" style="max-width: 300px; border-radius: 8px;" />', obj.imagen.url) if obj.imagen else "Sin imagen"
