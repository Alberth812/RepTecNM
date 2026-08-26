from django.contrib import admin
from .models import Afiliado
@admin.register(Afiliado)
class AfiliadoAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'instituto', 'email', 'estado', 'fecha_registro')
    list_filter = ('estado', 'instituto')
    search_fields = ('nombre_completo', 'email')
