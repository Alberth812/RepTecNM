import json
from rest_framework import serializers
from .models import ContenidoInicio, Slide, Testimonio

class SlideSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)
    
    class Meta:
        model = Slide
        fields = ['id', 'orden', 'tipo', 'prioridad', 'etiqueta', 'titulo', 'texto', 
                  'boton_texto', 'boton_url', 'imagen']

class TestimonioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonio
        fields = ['id', 'orden', 'texto', 'autor_nombre', 'autor_cargo']

class ContenidoInicioSerializer(serializers.ModelSerializer):
    nosotros_imagen_1 = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)
    nosotros_imagen_2 = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)
    
    slides = SlideSerializer(many=True, read_only=True)
    testimonios = TestimonioSerializer(many=True, read_only=True)
    
    class Meta:
        model = ContenidoInicio
        fields = '__all__'
        read_only_fields = ['fecha_actualizacion']
    

    def to_representation(self, instance):
        """Formatea los datos para que el frontend los reciba en la estructura esperada."""
        representation = super().to_representation(instance)
        
        # Convertir textos multilínea a listas (arrays)
        representation['beneficios'] = [line.strip() for line in instance.afiliacion_beneficios.split('\n') if line.strip()] if instance.afiliacion_beneficios else []
        representation['requisitos'] = [line.strip() for line in instance.afiliacion_requisitos.split('\n') if line.strip()] if instance.afiliacion_requisitos else []
        representation['proceso'] = [line.strip() for line in instance.afiliacion_proceso.split('\n') if line.strip()] if instance.afiliacion_proceso else []
        
        # Asegurar que mision y vision estén presentes (ya deberían estarlo por fields='__all__')
        representation['mision'] = instance.mision or ""
        representation['vision'] = instance.vision or ""
        
        return representation

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else data
        
        slides_data = []
        if 'slides' in mutable_data:
            slides_json = mutable_data.pop('slides')
            
            if isinstance(slides_json, str):
                try:
                    slides_data = json.loads(slides_json)
                except json.JSONDecodeError:
                    slides_data = []
            elif isinstance(slides_json, list):
                if len(slides_json) > 0 and isinstance(slides_json[0], str):
                    try:
                        slides_data = json.loads(slides_json[0])
                    except json.JSONDecodeError:
                        slides_data = []
                else:
                    slides_data = slides_json
            else:
                slides_data = []
        
        slide_images = {}
        for key in list(mutable_data.keys()):
            if key.startswith('slide_') and key.endswith('_imagen'):
                slide_index = int(key.split('_')[1])
                raw_value = mutable_data.pop(key)
                print(f"🔍 DEBUG RAW: {key} type = {type(raw_value)}, value = {raw_value}")
                
                # Si es una lista, extraer el primer elemento (protección contra errores del frontend)
                if isinstance(raw_value, list) and len(raw_value) > 0:
                    slide_images[slide_index] = raw_value[0]
                    print(f"⚠️ DEBUG: Era una lista, se tomó el primer elemento: {type(slide_images[slide_index])}")
                else:
                    slide_images[slide_index] = raw_value
        
        for index, imagen in slide_images.items():
            if index < len(slides_data) and isinstance(slides_data[index], dict):
                # Verificar que sea un archivo válido o una cadena antes de asignar
                if hasattr(imagen, 'name') or isinstance(imagen, str) or imagen is None:
                    slides_data[index]['imagen'] = imagen
                    print(f"✅ DEBUG: Asignada imagen válida a slide {index}")
                else:
                    print(f"❌ DEBUG ERROR: Imagen no válida para slide {index}, tipo: {type(imagen)}")
                    slides_data[index]['imagen'] = None # Fallback seguro
        
        testimonios_data = []
        if 'testimonios' in mutable_data:
            testimonios_json = mutable_data.pop('testimonios')
            if isinstance(testimonios_json, str):
                try:
                    testimonios_data = json.loads(testimonios_json)
                except json.JSONDecodeError:
                    testimonios_data = []
            elif isinstance(testimonios_json, list):
                if len(testimonios_json) > 0 and isinstance(testimonios_json[0], str):
                    try:
                        testimonios_data = json.loads(testimonios_json[0])
                    except json.JSONDecodeError:
                        testimonios_data = []
                else:
                    testimonios_data = testimonios_json
        
        self._slides_data = slides_data
        self._testimonios_data = testimonios_data
        
        return super().to_internal_value(mutable_data)
    
    def update(self, instance, validated_data):
        slides_data = self._slides_data
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar slides: eliminar todos y recrear
        instance.slides.all().delete()
        for index, slide_data in enumerate(slides_data):
            if isinstance(slide_data, dict):
                slide_data.pop('ctaLabel', None)
                slide_data.pop('ctaHref', None)
                
                slide_data['contenido'] = instance
                slide_data['orden'] = index
                try:
                    Slide.objects.create(**slide_data)
                    print(f"✅ DEBUG: Slide {index} creado exitosamente")
                except Exception as e:
                    print(f"❌ DEBUG ERROR creando slide {index}: {e}")
        
        # Actualizar testimonios: eliminar todos y recrear
        instance.testimonios.all().delete()
        for index, test_data in enumerate(self._testimonios_data):
            if isinstance(test_data, dict):
                test_data['contenido'] = instance
                test_data['orden'] = index
                Testimonio.objects.create(**test_data)
        
        return instance
