#!/bin/bash

# ══════════════════════════════════════════════════════════════════════════════
# ANÁLISIS FORENSE DE PROYECTO RepTecNM
# Genera reporte completo de calidad de código, seguridad y arquitectura
# ═══════════════════════════════════════════════════════════════════════════════

REPORTE="reporte-forense-$(date +%Y%m%d-%H%M%S).txt"
PROYECTO_DIR="$(pwd)"

echo " Iniciando análisis forense del proyecto..."
echo " Reporte se guardará en: $REPORTE"
echo ""

# Inicializar reporte
cat > "$REPORTE" << EOF
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ANÁLISIS FORENSE DE PROYECTO                              ║
║                    RepTecNM - $(date)                              ║
══════════════════════════════════════════════════════════════════════════════╝

Directorio analizado: $PROYECTO_DIR
Fecha de análisis: $(date)

══════════════════════════════════════════════════════════════════════════════
EOF

# ─────────────────────────────────────────────────────────────────────────────
# 1. ESTRUCTURA DEL PROYECTO
# ─────────────────────────────────────────────────────────────────────────────
echo " Analizando estructura del proyecto..."

cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. ESTRUCTURA DEL PROYECTO                                                   │
└──────────────────────────────────────────────────────────────────────────────

EOF

echo "### Estructura de directorios principal ###" >> "$REPORTE"
tree -L 3 -I 'node_modules|.next|.git|dist' --dirsfirst 2>/dev/null || find . -maxdepth 3 -type d -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*' | sort >> "$REPORTE"

echo "" >> "$REPORTE"
echo "### Estadísticas de archivos ###" >> "$REPORTE"
echo "Total de archivos TypeScript/TSX: $(find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)" >> "$REPORTE"
echo "Total de archivos JavaScript: $(find . -type f -name "*.js" -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)" >> "$REPORTE"
echo "Total de archivos CSS: $(find . -type f \( -name "*.css" -o -name "*.scss" \) -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)" >> "$REPORTE"
echo "Total de archivos de configuración: $(find . -maxdepth 1 -type f \( -name "*.json" -o -name "*.ts" -o -name "*.js" -o -name "*.yml" -o -name "*.yaml" \) | wc -l)" >> "$REPORTE"

# ─────────────────────────────────────────────────────────────────────────────
# 2. CÓDIGO MUERTO (ARCHIVOS HUÉRFANOS)
# ────────────────────────────────────────────────────────────────────────────
echo " Buscando código muerto..."

cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 2. CÓDIGO MUERTO Y ARCHIVOS HUÉRFANOS                                        │
└──────────────────────────────────────────────────────────────────────────────┘

### Archivos que no son importados en ningún otro archivo ###
EOF

# Buscar archivos .ts/.tsx que no son importados en ningún lado
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path '*/node_modules/*' -not -path '*/.next/*' -not -path '*/app/api/*' | while read -r file; do
  filename=$(basename "$file" | sed 's/\.[^.]*$//')
  # Buscar si el nombre del archivo (sin extensión) aparece en algún import
  if ! grep -r "from.*['\"].*$filename['\"]" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next > /dev/null 2>&1; then
    # Verificar si es un page.tsx o layout.tsx (estos no necesitan ser importados)
    if [[ "$file" != *"page.tsx" && "$file" != *"layout.tsx" && "$file" != *"loading.tsx" && "$file" != *"error.tsx" && "$file" != *"not-found.tsx" ]]; then
      echo "    Posiblemente huérfano: $file" >> "$REPORTE"
    fi
  fi
done

echo "" >> "$REPORTE"

# ─────────────────────────────────────────────────────────────────────────────
# 3. IMPORTS NO USADOS
# ─────────────────────────────────────────────────────────────────────────────
echo "Detectando imports no usados..."

cat >> "$REPORTE" << EOF

### Imports que podrían no estar siendo usados ###
EOF

find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path '*/node_modules/*' -not -path '*/.next/*' | while read -r file; do
  # Extraer imports y verificar si se usan en el archivo
  grep -E "^import .* from" "$file" 2>/dev/null | while read -r import_line; do
    # Extraer el nombre importado (simplificado)
    imported_name=$(echo "$import_line" | grep -oE "\{[^}]+\}" | tr -d '{}' | tr ',' '\n' | head -1 | tr -d ' ')
    if [ -n "$imported_name" ]; then
      # Contar cuántas veces aparece el nombre en el archivo (excluyendo la línea de import)
      count=$(grep -c "$imported_name" "$file" 2>/dev/null)
      if [ "$count" -le 1 ]; then
        echo "    $file: $import_line" >> "$REPORTE"
      fi
    fi
  done
done

echo "" >> "$REPORTE"

# ────────────────────────────────────────────────────────────────────────────
# 4. VULNERABILIDADES DE SEGURIDAD
# ─────────────────────────────────────────────────────────────────────────────
echo " Analizando vulnerabilidades de seguridad..."

cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 3. VULNERABILIDADES DE SEGURIDAD                                             │
└──────────────────────────────────────────────────────────────────────────────┘

### Secrets hardcoded (contraseñas, API keys, tokens) ###
EOF

grep -rn -E "(password|secret|api_key|apikey|token|private_key)\s*[:=]\s*['\"][^'\"]{8,}['\"]" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.env*" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | \
  grep -v "process.env" | \
  grep -v ".env.example" | \
  head -20 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Uso de eval() o Function() constructor (peligroso) ###
EOF

grep -rn -E "\b(eval|new Function)\s*\(" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | head -10 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### dangerouslySetInnerHTML sin sanitizar ###
EOF

grep -rn "dangerouslySetInnerHTML" \
  --include="*.tsx" --include="*.jsx" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | head -10 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### SQL queries raw sin parametrizar ###
EOF

grep -rn -E "sql\.\s*raw\s*\(" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | head -10 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Archivos .env expuestos o en repositorio ###
EOF

if [ -f ".env" ]; then
  echo "    .env encontrado en el repositorio (debería estar en .gitignore)" >> "$REPORTE"
fi
if [ -f ".env.local" ]; then
  echo "    .env.local encontrado en el repositorio" >> "$REPORTE"
fi

echo "" >> "$REPORTE"

# ─────────────────────────────────────────────────────────────────────────────
# 5. CÓDIGO BASURA Y PRÁCTICAS NO PROFESIONALES
# ────────────────────────────────────────────────────────────────────────────
echo " Detectando código basura..."

cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 4. CÓDIGO BASURA Y PRÁCTICAS NO PROFESIONALES                                │
└──────────────────────────────────────────────────────────────────────────────┘

### console.log en código de producción ###
EOF

grep -rn "console\.\(log\|debug\|info\|warn\)" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | \
  grep -v "node_modules" | \
  head -30 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Comentarios TODO, FIXME, HACK, XXX ###
EOF

grep -rn -E "\b(TODO|FIXME|HACK|XXX|BUG|OPTIMIZE)\b" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | head -20 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Código comentado extenso (bloques de más de 3 líneas) ###
EOF

# Buscar bloques de código comentado
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' | while read -r file; do
  # Contar líneas comentadas consecutivas
  awk '/^\/\// {count++; if(count>3) print FILENAME":"FNR": Bloque de "count" líneas comentadas"} 
       !/^\/\// {count=0}' "$file" 2>/dev/null | head -5
done | head -20 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Variables no usadas (declaradas pero nunca referenciadas) ###
EOF

# Buscar declaraciones de variables que podrían no usarse
grep -rn -E "\b(const|let|var)\s+\w+\s*=" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | head -20 >> "$REPORTE"

echo "" >> "$REPORTE"

# ─────────────────────────────────────────────────────────────────────────────
# 6. CÓDIGO ESPAGUETI Y COMPLEJIDAD
# ─────────────────────────────────────────────────────────────────────────────
echo " Analizando complejidad de código..."

cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 5. CÓDIGO ESPAGUETI Y COMPLEJIDAD EXCESIVA                                   │
└──────────────────────────────────────────────────────────────────────────────┘

### Archivos muy grandes (más de 300 líneas) ###
EOF

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' | while read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 300 ]; then
    echo "    $file ($lines líneas)" >> "$REPORTE"
  fi
done | sort -t'(' -k2 -rn | head -20 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Funciones muy largas (más de 50 líneas) ###
EOF

# Buscar funciones largas (aproximación simple)
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' | while read -r file; do
  awk '
    /function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/ {
      start=NR; braces=0; in_func=1
    }
    in_func {
      gsub(/[^{}]/,""); braces+=length
      if(braces>=2 && NR-start>50) {
        print FILENAME":"start": Función de "NR-start" líneas"
        in_func=0
      }
    }
  ' "$file" 2>/dev/null
done | head -20 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Anidamiento excesivo (más de 4 niveles) ###
EOF

# Buscar líneas con muchos niveles de anidamiento
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' | while read -r file; do
  awk '{
    level=gsub(/\{/,"") - gsub(/\}/,"")
    if(level>4) print FILENAME":"NR": "level" niveles de anidamiento"
  }' "$file" 2>/dev/null
done | head -20 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Archivos con muchos imports (más de 15) ###
EOF

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' | while read -r file; do
  imports=$(grep -c "^import " "$file" 2>/dev/null)
  if [ "$imports" -gt 15 ]; then
    echo "   $file ($imports imports)" >> "$REPORTE"
  fi
done | sort -t'(' -k2 -rn | head -10 >> "$REPORTE"

echo "" >> "$REPORTE"

# ─────────────────────────────────────────────────────────────────────────────
# 7. DEPENDENCIAS Y CONFIGURACIÓN
# ─────────────────────────────────────────────────────────────────────────────
echo "Analizando dependencias..."

cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 6. DEPENDENCIAS Y CONFIGURACIÓN                                              │
──────────────────────────────────────────────────────────────────────────────┘

### Dependencias en package.json ###
EOF

if [ -f "package.json" ]; then
  echo "Dependencias de producción:" >> "$REPORTE"
  node -e "const pkg=require('./package.json'); Object.keys(pkg.dependencies||{}).forEach(d=>console.log('  - '+d))" 2>/dev/null >> "$REPORTE"
  echo "" >> "$REPORTE"
  echo "Dependencias de desarrollo:" >> "$REPORTE"
  node -e "const pkg=require('./package.json'); Object.keys(pkg.devDependencies||{}).forEach(d=>console.log('  - '+d))" 2>/dev/null >> "$REPORTE"
fi

cat >> "$REPORTE" << EOF

### Versiones de tecnologías principales ###
EOF

echo "Next.js: $(node -e "try{console.log(require('next/package.json').version)}catch(e){}" 2>/dev/null)" >> "$REPORTE"
echo "React: $(node -e "try{console.log(require('react/package.json').version)}catch(e){}" 2>/dev/null)" >> "$REPORTE"
echo "TypeScript: $(npx tsc --version 2>/dev/null)" >> "$REPORTE"
echo "Payload CMS: $(node -e "try{console.log(require('payload/package.json').version)}catch(e){}" 2>/dev/null)" >> "$REPORTE"
echo "Drizzle ORM: $(node -e "try{console.log(require('drizzle-orm/package.json').version)}catch(e){}" 2>/dev/null)" >> "$REPORTE"

echo "" >> "$REPORTE"

# ─────────────────────────────────────────────────────────────────────────────
# 8. PRÁCTICAS DE CÓDIGO
# ─────────────────────────────────────────────────────────────────────────────
echo "Analizando prácticas de código..."

cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 7. PRÁCTICAS DE CÓDIGO Y CONVENCIONES                                        │
└──────────────────────────────────────────────────────────────────────────────┘

### Uso de 'any' en TypeScript (debería evitarse) ###
EOF

grep -rn ": any\b\|<any>\|as any" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | head -20 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Componentes sin TypeScript (archivos .js/.jsx en proyecto TS) ###
EOF

find . -type f \( -name "*.js" -o -name "*.jsx" \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' \
  -not -name "*.config.*" | head -10 >> "$REPORTE"

cat >> "$REPORTE" << EOF

### Archivos sin exportación (podrían ser módulos incompletos) ###
EOF

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' \
  -not -path '*/app/*' | while read -r file; do
  if ! grep -q "export " "$file" 2>/dev/null; then
    echo "    $file" >> "$REPORTE"
  fi
done | head -20 >> "$REPORTE"

echo "" >> "$REPORTE"

# ─────────────────────────────────────────────────────────────────────────────
# 9. RESUMEN EJECUTIVO
# ─────────────────────────────────────────────────────────────────────────────
cat >> "$REPORTE" << EOF

┌──────────────────────────────────────────────────────────────────────────────┐
│ 8. RESUMEN EJECUTIVO                                                         │
──────────────────────────────────────────────────────────────────────────────┘

### Métricas generales ###
- Total de archivos analizados: $(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)
- Líneas totales de código: $(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -not -path '*/node_modules/*' -not -path '*/.next/*' -exec cat {} \; | wc -l)
- console.log encontrados: $(grep -r "console\.\(log\|debug\|info\)" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | wc -l)
- TODOs/FIXMEs: $(grep -r -E "\b(TODO|FIXME|HACK)\b" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | wc -l)
- Archivos grandes (>300 líneas): $(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -not -path '*/node_modules/*' -not -path '*/.next/*' -exec sh -c 'wc -l < "$1" | grep -q "^.\{3,\}$" && echo "$1"' _ {} \; 2>/dev/null | wc -l)

### Recomendaciones prioritarias ###
1. Revisar archivos marcados como "posiblemente huérfanos" y eliminarlos si no se usan
2. Eliminar console.log de código de producción
3. Resolver TODOs y FIXMEs pendientes
4. Refactorizar archivos muy grandes (>300 líneas) en módulos más pequeños
5. Reemplazar usos de 'any' con tipos específicos de TypeScript
6. Verificar que no haya secrets hardcoded en el código
7. Sanitizar usos de dangerouslySetInnerHTML y sql.raw

══════════════════════════════════════════════════════════════════════════════
Fin del reporte generado el $(date)
══════════════════════════════════════════════════════════════════════════════
EOF

echo ""
echo " Análisis forense completado!"
echo " Reporte guardado en: $REPORTE"
echo ""
echo " Resumen rápido:"
echo "  - Archivos analizados: $(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)"
echo "  - console.log encontrados: $(grep -r "console\.\(log\|debug\|info\)" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | wc -l)"
echo "  - TODOs/FIXMEs: $(grep -r -E "\b(TODO|FIXME|HACK)\b" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | wc -l)"
echo ""
echo " Abre el archivo $REPORTE para ver el análisis completo"

