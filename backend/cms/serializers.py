import base64
import uuid
import json
from rest_framework import serializers
from .models import ContenidoInicio, Slide, Testimonio

class SlideSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()
    imagen_file = serializers.ImageField(required=False, allow_null=True, write_only=True)
    
    class Meta:
        model = Slide
        fields = ['id', 'orden', 'tipo', 'prioridad', 'etiqueta', 'titulo', 'texto', 
                  'boton_texto', 'boton_url', 'imagen', 'imagen_file']
    
    def get_imagen(self, obj):
        if not obj.imagen:
            return None
        
        url = str(obj.imagen)
        import re
        
        match = re.search(r'(cms/slides/.*)', url)
        if match:
            clean_path = match.group(1)
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/media/{clean_path}')
            return f"http://localhost/media/{clean_path}"
            
        if not url.startswith('http'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return f"http://localhost/media/{obj.imagen}"
            
        return url

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
        representation = super().to_representation(instance)
        representation['beneficios'] = [line.strip() for line in instance.afiliacion_beneficios.split('\n') if line.strip()] if instance.afiliacion_beneficios else []
        representation['requisitos'] = [line.strip() for line in instance.afiliacion_requisitos.split('\n') if line.strip()] if instance.afiliacion_requisitos else []
        representation['proceso'] = [line.strip() for line in instance.afiliacion_proceso.split('\n') if line.strip()] if instance.afiliacion_proceso else []
        representation['mision'] = instance.mision or ""
        representation['vision'] = instance.vision or ""
        return representation

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            mutable_data = data.copy()
        else:
            mutable_data = dict(data)
        
        slides_data = []
        if 'slides' in mutable_data:
            slides_json = mutable_data.pop('slides')
            if isinstance(slides_json, list) and len(slides_json) > 0 and isinstance(slides_json[0], str):
                slides_json = slides_json[0]
            if isinstance(slides_json, str):
                try:
                    parsed = json.loads(slides_json)
                    slides_data = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    slides_data = []
            elif isinstance(slides_json, list):
                slides_data = [item for item in slides_json if isinstance(item, dict)]
        
        slide_images = {}
        for key in list(mutable_data.keys()):
            if key.startswith('slide_') and key.endswith('_imagen'):
                try:
                    slide_index = int(key.split('_')[1])
                    slide_images[slide_index] = mutable_data.pop(key)
                except (ValueError, IndexError):
                    pass
        
        for index, imagen in slide_images.items():
            if index < len(slides_data):
                if isinstance(imagen, list) and len(imagen) > 0:
                    slides_data[index]['imagen'] = imagen[0]
                else:
                    slides_data[index]['imagen'] = imagen
        
        avisos_data = []
        if 'avisos' in mutable_data:
            avisos_json = mutable_data.pop('avisos')
            if isinstance(avisos_json, list) and len(avisos_json) > 0 and isinstance(avisos_json[0], str):
                avisos_json = avisos_json[0]
            if isinstance(avisos_json, str):
                try:
                    parsed = json.loads(avisos_json)
                    avisos_data = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    avisos_data = []
            elif isinstance(avisos_json, list):
                avisos_data = [item for item in avisos_json if isinstance(item, dict)]
                
        testimonios_data = []
        if 'testimonios' in mutable_data:
            testimonios_json = mutable_data.pop('testimonios')
            if isinstance(testimonios_json, list) and len(testimonios_json) > 0 and isinstance(testimonios_json[0], str):
                testimonios_json = testimonios_json[0]
            if isinstance(testimonios_json, str):
                try:
                    parsed = json.loads(testimonios_json)
                    testimonios_data = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    testimonios_data = []
            elif isinstance(testimonios_json, list):
                testimonios_data = [item for item in testimonios_json if isinstance(item, dict)]

        self._slides_data = slides_data
        self._avisos_data = avisos_data
        self._testimonios_data = testimonios_data
        
        return super().to_internal_value(mutable_data)

    def update(self, instance, validated_data):
        slides_data = getattr(self, '_slides_data', [])
        avisos_data = getattr(self, '_avisos_data', [])
        testimonios_data = getattr(self, '_testimonios_data', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.avisos = avisos_data
        instance.save()
        
        instance.slides.all().delete()
        for index, item in enumerate(slides_data):
            if isinstance(item, dict):
                slide_data = item.copy()
                slide_data.pop('ctaLabel', None)
                slide_data.pop('ctaHref', None)
                slide_data.pop('id', None)
                slide_data['contenido'] = instance
                slide_data['orden'] = index
                try:
                    from .models import Slide
                    Slide.objects.create(**slide_data)
                except Exception as e:
                    print(f"ERROR creando slide {index}: {e}")
        
        if hasattr(instance, 'testimonios') and isinstance(testimonios_data, list):
            instance.testimonios.all().delete()
            for index, item in enumerate(testimonios_data):
                if isinstance(item, dict):
                    test_data = item.copy()
                    test_data.pop('id', None)
                    test_data['contenido'] = instance
                    test_data['orden'] = index
                    try:
                        from .models import Testimonio
                        Testimonio.objects.create(**test_data)
                    except Exception as e:
                        print(f"ERROR creando testimonio {index}: {e}")
        
        return instance
