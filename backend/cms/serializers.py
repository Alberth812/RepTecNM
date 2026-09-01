import base64
import uuid
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
        if hasattr(data, 'copy'):
            mutable_data = data.copy()
        else:
            mutable_data = dict(data)
        
        slides_data = []
        if 'slides' in mutable_data:
            slides_json = mutable_data.pop('slides')
            if isinstance(slides_json, str):
                try:
                    parsed = json.loads(slides_json)
                    slides_data = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    slides_data = []
            elif isinstance(slides_json, list):
                for item in slides_json:
                    if isinstance(item, str):
                        try:
                            slides_data.append(json.loads(item))
                        except json.JSONDecodeError:
                            pass
                    elif isinstance(item, dict):
                        slides_data.append(item)
        
        avisos_data = []
        if 'avisos' in mutable_data:
            avisos_json = mutable_data.pop('avisos')
            if isinstance(avisos_json, str):
                try:
                    parsed = json.loads(avisos_json)
                    avisos_data = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    avisos_data = []
            elif isinstance(avisos_json, list):
                avisos_data = avisos_json
                
        testimonios_data = []
        if 'testimonios' in mutable_data:
            testimonios_json = mutable_data.pop('testimonios')
            if isinstance(testimonios_json, str):
                try:
                    parsed = json.loads(testimonios_json)
                    testimonios_data = parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    testimonios_data = []
            elif isinstance(testimonios_json, list):
                testimonios_data = testimonios_json

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
        if hasattr(instance, 'testimonios'):
            instance.testimonios = testimonios_data
        instance.save()
        
        instance.slides.all().delete()
        for index, item in enumerate(slides_data):
            if isinstance(item, dict):
                slide_data = item.copy()
                slide_data.pop('ctaLabel', None)
                slide_data.pop('ctaHref', None)
                
                slide_data['contenido'] = instance
                slide_data['orden'] = index
                try:
                    Slide.objects.create(**slide_data)
                    print(f"✅ DEBUG: Slide {index} creado exitosamente")
                except Exception as e:
                    print(f"❌ DEBUG ERROR creando slide {index}: {e}")
            else:
                print(f"⚠️ DEBUG: Slide {index} no es un diccionario, se omite. Tipo: {type(item)}")
        
        return instance

    def update(self, instance, validated_data):
        slides_data = getattr(self, '_slides_data', [])
        avisos_data = getattr(self, '_avisos_data', [])
        testimonios_data = getattr(self, '_testimonios_data', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.avisos = avisos_data
        if hasattr(instance, 'testimonios'):
            instance.testimonios = testimonios_data
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
        
        return instance
