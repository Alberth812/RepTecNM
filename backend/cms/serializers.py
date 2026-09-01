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
    # Campos de imagen de "Nosotros"
    nosotros_imagen_1 = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)
    nosotros_imagen_2 = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)
    
    # Campos de solo lectura para mostrar los slides y testimonios actuales
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
        """
        Convierte los datos entrantes, manejando:
        - JSON strings de slides y testimonios
        - Archivos de imagen de slides (slide_0_imagen, slide_1_imagen, etc.)
        """
        mutable_data = data.copy() if hasattr(data, 'copy') else data
        
        # Extraer y parsear JSON de slides
        slides_data = []
        if 'slides' in mutable_data:
            slides_json = mutable_data.pop('slides')
            if isinstance(slides_json, str):
                try:
                    slides_data = json.loads(slides_json)
                except json.JSONDecodeError:
                    slides_data = []
        
        # Extraer archivos de imagen de slides del FormData
        # El frontend envía: slide_0_imagen, slide_1_imagen, etc.
        slide_images = {}
        for key in list(mutable_data.keys()):
            if key.startswith('slide_') and key.endswith('_imagen'):
                slide_index = int(key.split('_')[1])
                slide_images[slide_index] = mutable_data.pop(key)
        
        # Asignar las imágenes a los slides correspondientes
        for index, imagen in slide_images.items():
            if index < len(slides_data):
                slides_data[index]['imagen'] = imagen
        
        # Extraer y parsear JSON de testimonios
        testimonios_data = []
        if 'testimonios' in mutable_data:
            testimonios_json = mutable_data.pop('testimonios')
            if isinstance(testimonios_json, str):
                try:
                    testimonios_data = json.loads(testimonios_json)
                except json.JSONDecodeError:
                    testimonios_data = []
        
        # Guardar los datos procesados para usarlos en create/update
        self._slides_data = slides_data
        self._testimonios_data = testimonios_data
        
        return super().to_internal_value(mutable_data)
    
    def create(self, validated_data):
        slides_data = self._slides_data
        testimonios_data = self._testimonios_data
        
        # Crear el contenido principal
        contenido = ContenidoInicio.objects.create(**validated_data)
        
        # Crear los slides
        for index, slide_data in enumerate(slides_data):
            slide_data['contenido'] = contenido
            slide_data['orden'] = index
            Slide.objects.create(**slide_data)
        
        # Crear los testimonios
        for index, test_data in enumerate(testimonios_data):
            test_data['contenido'] = contenido
            test_data['orden'] = index
            Testimonio.objects.create(**test_data)
        
        return contenido
    
    def update(self, instance, validated_data):
        slides_data = self._slides_data
        testimonios_data = self._testimonios_data
        
        # Actualizar campos del contenido principal
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar slides: eliminar todos y recrear
        instance.slides.all().delete()
        for index, slide_data in enumerate(slides_data):
            slide_data['contenido'] = instance
            slide_data['orden'] = index
            Slide.objects.create(**slide_data)
        
        # Actualizar testimonios: eliminar todos y recrear
        instance.testimonios.all().delete()
        for index, test_data in enumerate(testimonios_data):
            test_data['contenido'] = instance
            test_data['orden'] = index
            Testimonio.objects.create(**test_data)
        
        return instance
