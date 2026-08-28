from django.contrib import admin
from .models import ContenidoInicio, Slide, Testimonio

class SlideInline(admin.TabularInline):
    model = Slide
    extra = 1

class TestimonioInline(admin.TabularInline):
    model = Testimonio
    extra = 1

@admin.register(ContenidoInicio)
class ContenidoInicioAdmin(admin.ModelAdmin):
    inlines = [SlideInline, TestimonioInline]
    list_display = ['fecha_actualizacion']
    def has_add_permission(self, request):
        return not ContenidoInicio.objects.exists()
