
# REP TecNM · Red de Egresados de Posgrado

Plataforma web para la **Asociación de Egresados de Posgrado del Tecnológico Nacional de México (TecNM)**. Sistema full-stack containerizado que gestiona la comunidad académica, publicaciones, credenciales digitales y contenido dinámico del sitio institucional.



##  Objetivo

Conectar el talento de posgrado del TecNM mediante una comunidad nacional de profesionales que colabora, investiga y transforma al país, proporcionando herramientas digitales para la vinculación académica, científica y profesional.



##  Stack Tecnológico

### Frontend
- **Next.js 16** (App Router + Turbopack)
- **TypeScript** y **React 19**
- **Tailwind CSS** + **shadcn/ui**
- **Lucide React** (iconografía)
- **Sonner** (notificaciones toast)

### Backend
- **Django 5.0.6** + **Django REST Framework 3.15**
- **Python 3.12**
- **django-cors-headers** (CORS)
- **Pillow** (procesamiento de imágenes)

### Base de Datos
- **PostgreSQL 15** (Alpine)

### Almacenamiento
- **MinIO** (compatible con S3, para archivos multimedia)

### Infraestructura
- **Docker** + **Docker Compose** (contenedores de desarrollo)
- **Nginx** (proxy reverso, ruteo de peticiones)
- **Git** (control de versiones)



##  Estructura del Proyecto

```
reptecnm/
├── frontend/              # Aplicación Next.js (puerto 3000)
│   ├── app/
│   │   ├── (public)/      # Rutas públicas (inicio, blog, catálogo, credencial)
│   │   ├── (admin)/       # Panel administrativo (dashboard, CMS, aprobaciones)
│   │   └── layout.tsx     # Layout raíz
│   ├── components/
│   │   ├── ui/            # Componentes shadcn reutilizables
│   │   └── public/        # Componentes específicos (avisos, barra sesión, etc.)
│   ├── lib/               # Utilidades, mocks, validaciones
│   ├── public/            # Assets estáticos (logo, imágenes)
│   └── Dockerfile
│
├── backend/               # API Django (puerto 8000)
│   ├── config/            # Configuración principal (settings, urls)
│   ├── cms/               # Módulo CMS (contenido de inicio)
│   ├── blog/              # Módulo de publicaciones
│   ├── afiliados/         # Gestión de afiliados
│   ├── media_files/       # Archivos subidos (imágenes, PDFs)
│   └── Dockerfile
│
├── nginx/                 # Configuración del proxy reverso
│   ├── Dockerfile
│   └── default.conf
│
├── docs/                  # Documentación (diagramas, especificaciones)
├── docker-compose.dev.yml # Orquestación de contenedores en desarrollo
├── .gitignore
└── README.md
```



##  Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Git** (clonar el repositorio)
- **8 GB RAM** recomendados (para correr todos los contenedores)
- **Puertos disponibles**: 80 (Nginx), 3000 (frontend), 8000 (backend), 9000/9001 (MinIO)



##  Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alberth812/RepTecNM.git
cd RepTecNM
```

### 2. Levantar los contenedores

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Este comando construye y levanta los 5 servicios:
- `reptecnm-frontend` (Next.js)
- `reptecnm-backend` (Django)
- `reptecnm-db` (PostgreSQL)
- `reptecnm-minio` (Almacenamiento)
- `reptecnm-nginx` (Proxy)

### 3. Verificar estado

```bash
docker compose -f docker-compose.dev.yml ps
```

Todos los servicios deben aparecer en estado **Up**.

### 4. Aplicar migraciones del backend

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

### 5. Crear superusuario (admin del CMS)

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```



##  URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Sitio público** | http://localhost | Página principal, blog, catálogo |
| **Panel Admin Django** | http://localhost/admin/ | Administración de modelos Django |
| **Consola MinIO** | http://localhost:9001 | Gestión de archivos multimedia |
| **API Backend** | http://localhost/api/ | Endpoints REST (JSON) |
| **Frontend directo** | http://localhost:3000 | Next.js (sin Nginx) |



##  Credenciales de Prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `Adminrep` | `RepTecNM2026` |

>  **Importante**: Cambia estas credenciales antes de cualquier despliegue en producción.



##  Funcionalidades Implementadas

### Página Pública
- **Hero dinámico**: Slider con hasta 5 slides editables desde el CMS
- **Sección Nosotros**: Texto e imágenes configurables
- **Misión y Visión**: Tarjetas con diseño institucional (banda azul + glassmorphism)
- **Qué Hacemos**: Descripción de servicios de la asociación
- **Afiliación**: Beneficios, requisitos y proceso de afiliación
- **Testimonios**: Sección preparada para opiniones de afiliados
- **Contacto**: Correo, teléfono, dirección y redes sociales
- **Avisos flotantes**: Notificaciones gestionables desde el CMS con tipos (informativo, aviso, urgente, convocatoria)

### Panel Administrativo (`/dashboard`)
- **Dashboard**: Estadísticas operativas (afiliados, publicaciones, institutos)
- **CMS de Inicio**: Editor completo de la página principal (slides, textos, imágenes, avisos)
- **Publicar Blog**: Formulario con subida de imágenes y PDFs
- **Aprobaciones**: Gestión de solicitudes de afiliación
- **Catálogo**: Directorio de profesionales afiliados
- **Mensajería**: Bandeja de entrada y formularios de contacto
- **Configuración**: Cambio de tema (claro/oscuro/sepia) y datos de perfil

### Sistema de Autenticación
- Login con credenciales
- Recuperación de contraseña (flujo por correo)
- Roles: Visitante, Afiliado, Administrador
- Cierre de sesión automático al cerrar la pestaña



##  Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (Puerto 80)                     │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  / → Frontend:3000  │  │  /api/ → Backend:8000        │  │
│  │  /media/ → MinIO    │  │  /admin/ → Backend:8000      │  │
│  └─────────────────────┘  ──────────────────────────────┘  │
─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
─────────────────┐            ┌─────────────────────┐
│  Next.js 16     │            │  Django 5.0.6       │
│  (Turbopack)    │            │  + DRF              │
│  TypeScript     │            │  PostgreSQL 15      │
│  Tailwind CSS   │            │  MinIO (S3)         │
└─────────────────┘            └─────────────────────┘
```



## 📋 Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.dev.yml logs -f

# Logs de un servicio específico
docker compose -f docker-compose.dev.yml logs backend --tail 50

# Reiniciar un servicio
docker compose -f docker-compose.dev.yml restart frontend

# Detener todos los contenedores
docker compose -f docker-compose.dev.yml down

# Limpiar caché de Next.js
docker compose -f docker-compose.dev.yml exec frontend rm -rf .next

# Acceder a la shell del backend
docker compose -f docker-compose.dev.yml exec backend bash

# Ejecutar migraciones
docker compose -f docker-compose.dev.yml exec backend python manage.py makemigrations
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
```



##  Desarrollo

### Frontend (Next.js)

Los cambios en el frontend se reflejan automáticamente gracias al **hot-reload** de Turbopack. Los archivos se sincronizan mediante volúmenes de Docker.

### Backend (Django)

Django corre en modo desarrollo con `StatReloader`, detectando cambios en los archivos `.py` automáticamente.

### Base de Datos

Los datos de PostgreSQL persisten en un volumen Docker (`pgdata`), por lo que no se pierden al reiniciar contenedores.

---

##  Licencia

Proyecto desarrollado para la **Asociación de Egresados de Posgrado del Tecnológico Nacional de México, A.C.**

Última actualización: **1 de septiembre de 2026**

---

##  Equipo

- **Desarrollo Frontend & Arquitectura**: Andrés Hernández Sosa
- **Asesoría**: Dr. 
- **Colaboración Backend**: Raúl 



