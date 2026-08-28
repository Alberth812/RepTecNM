from rest_framework import serializers
from .models import ContenidoInicio, Slide, Testimonio
import re

class SlideSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Slide
        fields = ['id', 'orden', 'tipo', 'prioridad', 'etiqueta', 'titulo', 'texto', 'boton_texto', 'boton_url', 'imagen', 'imagen_url']
    
    def get_imagen_url(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

class TestimonioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonio
        fields = ['id', 'orden', 'texto', 'autor_nombre', 'autor_cargo']

class ContenidoInicioSerializer(serializers.ModelSerializer):
    slides = SlideSerializer(many=True, required=False)
    testimonios = TestimonioSerializer(many=True, required=False)
    nosotros_imagen_1_url = serializers.SerializerMethodField()
    nosotros_imagen_2_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ContenidoInicio
        fields = ['id', 'nosotros_texto', 'nosotros_imagen_1', 'nosotros_imagen_2', 'nosotros_imagen_1_url', 'nosotros_imagen_2_url', 'mision', 'vision', 'que_hacemos_texto', 'contacto_email', 'contacto_telefono', 'contacto_direccion', 'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'afiliacion_beneficios', 'afiliacion_requisitos', 'afiliacion_proceso', 'fecha_actualizacion', 'slides', 'testimonios']
    
    def get_nosotros_imagen_1_url(self, obj):
        if obj.nosotros_imagen_1:
            request = self.context.get('request')
            if request: return request.build_absolute_uri(obj.nosotros_imagen_1.url)
            return obj.nosotros_imagen_1.url
        return None
    
    def get_nosotros_imagen_2_url(self, obj):
        if obj.nosotros_imagen_2:
            request = self.context.get('request')
            if request: return request.build_absolute_uri(obj.nosotros_imagen_2.url)
            return obj.nosotros_imagen_2.url
        return None
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        slides_data = validated_data.pop('slides', None)
        testimonios_data = validated_data.pop('testimonios', None)
        
        # === MODO DEBUG: Rastreo de datos ===
        print("\n=== 🔍 DEBUG SERIALIZER UPDATE ===")
        print("1. slides_data desde validated_data:", slides_data)
        print("2. Claves en request.data:", list(request.data.keys())[:10] if hasattr(request.data, 'keys') else "No tiene claves")
        
        if not slides_data and request:
            slides_dict = {}
            for key, value in request.data.items():
                match = re.match(r'^slides\[(\d+)\]\[(.+)\]$', key)
                if match:
                    idx = int(match.group(1))
                    field = match.group(2)
                    if idx not in slides_dict: slides_dict[idx] = {}
                    slides_dict[idx][field] = value
            
            for key, value in request.FILES.items():
                match = re.match(r'^slides\[(\d+)\]\[(.+)\]$', key)
                if match:
                    idx = int(match.group(1))
                    field = match.group(2)
                    if idx not in slides_dict: slides_dict[idx] = {}
                    slides_dict[idx][field] = value
            
            print("3. slides_dict reconstruido del request:", slides_dict)
            
            if slides_dict:
                slides_data = [slides_dict[i] for i in sorted(slides_dict.keys())]

        print("4. slides_data final a procesar:", slides_data)
        # =======================================

        # 1. Actualizar campos principales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 2. ACTUALIZACIÓN SEGURA DE SLIDES
        if slides_data is not None:
            new_slide_ids = [str(d.get('id')) for d in slides_data if d.get('id')]
            print("5. IDs extraídos (new_slide_ids):", new_slide_ids)
            
            if len(slides_data) == 0:
                print("➡️ ACCIÓN: Borrar todos los slides (lista explícitamente vacía)")
                instance.slides.all().delete()
            elif len(new_slide_ids) == 0:
                print("⚠️ ADVERTENCIA CMS: Frontend envió slides sin IDs. Se omitió la actualización para proteger los datos.")
            else:
                print(f"➡️ ACCIÓN: Sincronizar {len(slides_data)} slides con IDs: {new_slide_ids}")
                for slide in instance.slides.all():
                    if str(slide.id) not in new_slide_ids:
                        print(f"   🗑️ Eliminando slide ID {slide.id} (ya no está en la lista)")
                        slide.delete()
                
                for slide_data in slides_data:
                    slide_id = slide_data.pop('id', None)
                    if slide_id:
                        try:
                            slide = instance.slides.get(id=slide_id)
                            for k, v in slide_data.items():
                                setattr(slide, k, v)
                            slide.save()
                            print(f"   ✅ Actualizado slide ID {slide_id}")
                        except Slide.DoesNotExist:
                            print(f"   ❌ Slide ID {slide_id} no encontrado en BD")
                    else:
                        print(f"   ➕ Creando nuevo slide")
                        Slide.objects.create(contenido=instance, **slide_data)

        # 3. Lógica segura para testimonios
        if testimonios_data is not None:
            ids_enviados = [str(t.get('id')) for t in testimonios_data if t.get('id')]
            if len(testimonios_data) == 0:
                instance.testimonios.all().delete()
            elif len(ids_enviados) == 0:
                pass
            else:
                instance.testimonios.exclude(id__in=ids_enviados).delete()
                for testimonio_data in testimonios_data:
                    testimonio_id = testimonio_data.pop('id', None)
                    if testimonio_id:
                        Testimonio.objects.filter(id=testimonio_id, contenido=instance).update(**testimonio_data)
                    else:
                        Testimonio.objects.create(contenido=instance, **testimonio_data)
                    
        return instance
