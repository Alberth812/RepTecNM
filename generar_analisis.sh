#!/bin/bash
OUTPUT_FILE="analisis_proyecto.txt"

echo "=== ANÁLISIS ESTRUCTURAL DEL PROYECTO ===" > $OUTPUT_FILE
echo "Fecha: $(date)" >> $OUTPUT_FILE
echo "Directorio: $(pwd)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "1. DEPENDENCIAS PRINCIPALES" >> $OUTPUT_FILE
echo "--- Backend (Python) ---" >> $OUTPUT_FILE
cat backend/requirements.txt >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "--- Frontend (Node.js - dependencias clave) ---" >> $OUTPUT_FILE
cat frontend/package.json | grep -E '"(react|next|lucide|tailwind|sonner)"' >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "2. ESTRUCTURA DE ARCHIVOS DE CÓDIGO (Excluyendo caché y dependencias)" >> $OUTPUT_FILE
find . -type d \( -name node_modules -o -name .next -o -name __pycache__ -o -name .git -o -name media_files -o -name venv -o -name tmp \) -prune -o -type f -print | grep -E '\.(py|tsx|ts|jsx|js|yml|yaml|json|conf)$' | sort >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "3. LÓGICA CRÍTICA DEL BACKEND" >> $OUTPUT_FILE
echo "--- Modelo de Blog ---" >> $OUTPUT_FILE
cat backend/blog/models.py >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "--- Serializer de Blog ---" >> $OUTPUT_FILE
cat backend/blog/serializers.py >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "--- Configuración de Almacenamiento (final de settings.py) ---" >> $OUTPUT_FILE
tail -n 20 backend/config/settings.py >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "4. LÓGICA CRÍTICA DEL FRONTEND" >> $OUTPUT_FILE
echo "--- Formulario de Publicación (Ruta original) ---" >> $OUTPUT_FILE
cat "frontend/app/(admin)/publicar-blog/page.tsx" >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado en esta ruta" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "--- Vista Unificada de Admin (si existe) ---" >> $OUTPUT_FILE
cat "frontend/app/(admin)/admin/blog/page.tsx" >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "5. INFRAESTRUCTURA" >> $OUTPUT_FILE
echo "--- Nginx Config ---" >> $OUTPUT_FILE
cat nginx/default.conf >> $OUTPUT_FILE 2>/dev/null || echo "No encontrado" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "=========================================" >> $OUTPUT_FILE
echo "Análisis generado exitosamente en: $OUTPUT_FILE"
