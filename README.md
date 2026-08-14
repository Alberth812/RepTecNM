# REP TecNM · Red de Egresados de Posgrado

Plataforma web para la Asociación de Egresados de Posgrado del Tecnológico Nacional de México. Prototipo de alta fidelidad validado con directivos.

## Objetivo

Conectar el talento de posgrado del TecNM mediante una comunidad nacional de profesionales que colabora, investiga y transforma al país.

## Stack tecnológico

- Next.js 16 (App Router, Turbopack)
- TypeScript y React 19
- Tailwind CSS 4 y shadcn/ui
- Recharts, qrcode.react, lucide-react, sonner
- pnpm como gestor de paquetes

## Requisitos previos

- Node.js 20 o superior
- pnpm 9 o superior

~~~bash
npm install -g pnpm
~~~

## Instalación

~~~bash
git clone https://github.com/Alberth812/RepTecNM.git
cd RepTecNM
pnpm install
~~~

## Ejecución en desarrollo

~~~bash
pnpm dev
~~~

Direcciones disponibles al arrancar:

| Entorno | Dirección |
|---------|-----------|
| Local | http://localhost:3000 |
| Red local | http://TU_IP:3000 (la muestra la terminal) |

La dirección de red permite probar en teléfonos y escanear el QR de la credencial durante demostraciones.

## Estructura del proyecto

![Estructura del proyecto](docs/estructura.png)

El diagrama se genera desde `docs/estructura.puml` (PlantUML). Para regenerarlo:

~~~bash
curl -X POST https://kroki.io/plantuml/png \
  -H "Content-Type: text/plain" \
  --data-binary @docs/estructura.puml \
  -o docs/estructura.png
~~~

## Rutas principales

### Lado público

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio con slider editable, estadísticas agregadas y secciones |
| `/catalogo` | Búsqueda con relevancia y filtros combinables |
| `/catalogo/[id]` | Ficha completa del profesional |
| `/repositorio` | Publicaciones con visor en línea, foro y contacto al autor |
| `/credencial` | Espacio personal con credencial digital editable |
| `/verificar/[folio]` | Verificación pública por código QR |
| `/mensajeria` | Mensajería interna con adjuntos y bloqueo |
| `/seguimiento` | Cuestionario de seguimiento en 7 secciones |
| `/registro` | Registro multi-paso con verificación de correo |
| `/login` | Inicio de sesión |

### Panel de administración

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Estadísticas operativas con gráficas |
| `/aprobaciones` | Bandeja de aprobación con versionado de solicitudes |
| `/cms` | Editor de la página de inicio |
| `/reportes` | Gestión de reportes de documentos |

## Requisitos funcionales cubiertos

- RF-AUTH: autenticación y verificación de correo
- RF-PERFIL: perfil profesional multi-sección con autoguardado
- RF-MEMB: membresía y estados (ACTIVO, INACTIVO, BAJA)
- RF-CAT: catálogo de profesionales
- RF-CRED: credencial digital con QR e impresión en PDF
- RF-DOC: repositorio de documentos académicos
- RF-MSG: mensajería interna
- RF-SEG: cuestionario de seguimiento de egresados
- RF-DASH: dashboard y estadísticas públicas agregadas
- RF-ADMIN: administración, aprobaciones y CMS

## Scripts disponibles

~~~bash
pnpm dev     # servidor de desarrollo en http://localhost:3000
pnpm build   # build de producción
pnpm start   # servidor de producción
pnpm lint    # ESLint
~~~

## Próximos pasos (Incremento 1)

- [ ] Backend con BetterAuth (JWT y sesiones)
- [ ] PostgreSQL con Prisma ORM
- [ ] Resend para envío de correos
- [ ] SeaweedFS para almacenamiento de archivos
- [ ] Dominio de producción para el QR de verificación

Las interfaces de `lib/mock` (Solicitud, Documento, PerfilCatalogo, Conversacion, ContenidoHome) funcionan como contrato de datos entre el front y el futuro backend.

## Equipo

- Desarrollo: Alberth812
- Validación: directivos de la Asociación de Egresados de Posgrado del TecNM

---

Última actualización: 2026-08-15
