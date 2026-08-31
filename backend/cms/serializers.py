from rest_framework import serializers
from .models import ContenidoInicio, Slide, Testimonio
import re

class SlideSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Slide
        fields = ['id', 'orden', 'tipo', 'prioridad', 'etiqueta', 'titulo', 'texto', 'boton_texto', 'boton_url', 'imagen', 'imagen_url']
        read_only_fields = ['imagen_url'] # Solo lectura para la URL
    
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
        fields = ['id', 'nosotros_texto', 'nosotros_imagen_1', 'nosotros_imagen_2', 
                  'nosotros_imagen_1_url', 'nosotros_imagen_2_url', 'mision', 'vision', 
                  'que_hacemos_texto', 'contacto_email', 'contacto_telefono', 'contacto_direccion', 
                  'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 
                  'afiliacion_beneficios', 'afiliacion_requisitos', 'afiliacion_proceso', 
                  'fecha_actualizacion', 'slides', 'testimonios']
    
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
        
        # 1. FORZAR PARSEO MANUAL DE SLIDES
        slides_data = []
        if request and hasattr(request, 'POST'):
            slides_dict = {}
            # Parsear campos de texto
            for key in request.POST.keys():
                match = re.match(r'^slides\[(\d+)\]\[(.+)\]$', key)
                if match:
                    idx, field = int(match.group(1)), match.group(2)
                    if idx not in slides_dict: 
                        slides_dict[idx] = {}
                    slides_dict[idx][field] = request.POST.getlist(key)[-1]
            
            # Parsear archivos (imágenes)
            if hasattr(request, 'FILES'):
                for key in request.FILES.keys():
                    match = re.match(r'^slides\[(\d+)\]\[(.+)\]$', key)
                    if match:
                        idx, field = int(match.group(1)), match.group(2)
                        if idx not in slides_dict: 
                            slides_dict[idx] = {}
                        slides_dict[idx][field] = request.FILES[key]
            
            if slides_dict:
                slides_data = [slides_dict[i] for i in sorted(slides_dict.keys())]

        print("\n" + "="*60)
        print("🔍 DEBUG SERIALIZER: slides_data parseados manualmente =", slides_data)
        print("="*60 + "\n")

        # 2. Actualizar campos principales
        testimonios_data = validated_data.pop('testimonios', None)
        validated_data.pop('slides', None) 
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 3. ACTUALIZACIÓN DE SLIDES (Lógica UPSERT segura)
        if slides_data is not None:
            ids_a_mantener = []
            for slide_data in slides_data:
                slide_id = slide_data.get('id')
                if slide_id and str(slide_id).isdigit():
                    ids_a_mantener.append(int(slide_id))
                    try:
                        slide = instance.slides.get(id=int(slide_id))
                        for k, v in slide_data.items():
                            if k != 'id': 
                                # Si es un archivo, Django lo maneja automáticamente al hacer setattr
                                setattr(slide, k, v)
                        slide.save()
                        print(f"✅ Actualizado slide ID {slide_id}")
                    except Slide.DoesNotExist:
                        print(f"⚠️ Slide ID {slide_id} no existe, se creará como nuevo.")
                        slide_data.pop('id', None)
                        Slide.objects.create(contenido=instance, **slide_data)
            
            # Crear los que no tienen ID válido
            for slide_data in slides_data:
                if not slide_data.get('id') or not str(slide_data.get('id')).isdigit():
                    clean_data = {k: v for k, v in slide_data.items() if k != 'id'}
                    Slide.objects.create(contenido=instance, **clean_data)
                    print(f"✅ Creado nuevo slide sin ID")
            
            # Eliminar SOLO los que definitivamente no están en la lista enviada
            if ids_a_mantener:
                instance.slides.exclude(id__in=ids_a_mantener).delete()

        # 4. Lógica para testimonios
        if testimonios_data is not None:
            ids_test = [int(t.get('id')) for t in testimonios_data if t.get('id') and str(t.get('id')).isdigit()]
            if ids_test:
                instance.testimonios.exclude(id__in=ids_test).delete()
            else:
                instance.testimonios.all().delete()
            
            for t_data in testimonios_data:
                t_id = t_data.pop('id', None)
                if t_id and str(t_id).isdigit():
                    Testimonio.objects.filter(id=int(t_id), contenido=instance).update(**t_data)
                else:
                    Testimonio.objects.create(contenido=instance, **t_data)
                    
        return instance
