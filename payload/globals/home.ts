// @/payload/collections/Home.ts
import type { Field, GlobalConfig } from "payload";

/* -------------------------------------------------------------------------------------------- */
/*  VALIDADORES                                                                                  */
/* -------------------------------------------------------------------------------------------- */

/**
 * Acepta rutas internas de Next.js (ej. "/catalogo", "/registro?ref=home")
 * o URLs externas que usen exclusivamente "https://".
 * Rechaza cualquier otro esquema (ej. "javascript:", "data:", "//host-externo").
 */
const INTERNAL_PATH_REGEX = /^\/[a-zA-Z0-9\-._~/?=&%]*$/;

const validateHref =
  (required: boolean) =>
  (value: string | null | undefined): true | string => {
    if (!value || value.trim() === "") {
      return required ? "Este campo es obligatorio." : true;
    }

    const trimmed = value.trim();

    // Ruta interna de Next.js (debe empezar con "/", nunca con "//").
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return INTERNAL_PATH_REGEX.test(trimmed)
        ? true
        : "La ruta interna contiene caracteres no permitidos.";
    }

    // URL externa: solo se permite "https://".
    try {
      const url = new URL(trimmed);
      if (url.protocol === "https:") {
        return true;
      }
      return 'Las URLs externas deben usar "https://". No se permiten otros esquemas (ej. "javascript:", "http:").';
    } catch {
      return 'Debe ser una ruta interna que empiece con "/" (ej. "/catalogo") o una URL externa "https://...".';
    }
  };

/** Redes sociales: se acepta http:// o https://. Siempre opcional. */
const validateSocialUrl = (value: string | null | undefined): true | string => {
  if (!value || value.trim() === "") return true;

  try {
    const url = new URL(value.trim());
    if (url.protocol === "http:" || url.protocol === "https:") {
      return true;
    }
    return 'Debe ser una URL "http://" o "https://" válida.';
  } catch {
    return 'Debe ser una URL "http://" o "https://" válida.';
  }
};

/* -------------------------------------------------------------------------------------------- */
/*  FIELD FACTORIES REUTILIZABLES                                                                */
/* -------------------------------------------------------------------------------------------- */

/**
 * Grupo CTA (label + href) reutilizado por Hero.slides y Afiliación.
 * Nota: Payload no soporta `required` a nivel de `group`, por lo que la
 * obligatoriedad se aplica marcando `label` y `href` como required en sus
 * subcampos. El resultado funcional es el mismo: el admin no puede guardar
 * un CTA "obligatorio" incompleto.
 */
const ctaGroupField = ({
  name,
  label,
  required,
  description,
  defaultLabel,
  defaultHref,
}: {
  name: string;
  label: string;
  required: boolean;
  description?: string;
  /** Solo aplica cuando el grupo NO vive dentro de un array (ej. Afiliación.cta). */
  defaultLabel?: string;
  defaultHref?: string;
}): Field => ({
  name,
  type: "group",
  label,
  admin: {
    description:
      description ??
      (required
        ? "Botón obligatorio."
        : "Botón opcional. Si se deja vacío, el frontend no lo muestra."),
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Texto del botón",
      required,
      minLength: 2,
      maxLength: 40,
      defaultValue: defaultLabel,
      admin: {
        description: 'Texto visible del botón, ej. "Explorar catálogo".',
      },
    },
    {
      name: "href",
      type: "text",
      label: "Enlace (href)",
      required,
      defaultValue: defaultHref,
      admin: {
        description:
          'Ruta interna (ej. "/catalogo") o URL externa "https://...". No se permiten esquemas inseguros como "javascript:".',
      },
      validate: validateHref(required),
    },
  ],
});

/** Campo de red social individual: siempre opcional, valida http(s). */
const socialUrlField = (
  name: string,
  label: string,
  defaultValue?: string,
): Field => ({
  name,
  type: "text",
  label,
  required: false,
  defaultValue,
  admin: {
    description: `URL completa de ${label} (https://...). Déjalo vacío si no se usa.`,
  },
  validate: validateSocialUrl,
});

/* -------------------------------------------------------------------------------------------- */
/*  HERO / SLIDES                                                                                */
/* -------------------------------------------------------------------------------------------- */

const heroField: Field = {
  name: "hero",
  type: "group",
  label: "Hero (Carousel principal)",
  admin: {
    description:
      "Slides del carousel principal de la home. El orden de la lista define el orden de aparición; arrastra para reordenar.",
  },
  fields: [
    {
      name: "slides",
      type: "array",
      label: "Slides",
      labels: { singular: "Slide", plural: "Slides" },
      minRows: 1,
      maxRows: 8,
      admin: {
        initCollapsed: true,
        description:
          "Cada slide se muestra en el orden en que aparece aquí. Arrastra el ícono de la izquierda para reordenar.",
      },
      defaultValue: [
        {
          activo: true,
          etiqueta: "Red de Egresados",
          titulo: "Conectamos el talento de posgrado del TecNM",
          texto:
            "Una comunidad nacional de profesionales que colabora, investiga y transforma al país.",
          duracion: 5000,
          ctaPrincipal: { label: "Explorar catálogo", href: "/catalogo" },
          ctaSecundario: { label: "Buscar profesionales", href: "/catalogo" },
        },
        {
          activo: true,
          etiqueta: "Credencial digital",
          titulo: "Tu afiliación, siempre contigo",
          texto:
            "Credencial con verificación por código QR, disponible en formato digital e imprimible.",
          duracion: 5000,
          ctaPrincipal: { label: "Conocer la credencial", href: "/catalogo" },
        },
        {
          activo: true,
          etiqueta: "Vinculación",
          titulo: "Servicios profesionales con respaldo académico",
          texto:
            "Consultoría, investigación y capacitación para el sector productivo y gubernamental.",
          duracion: 5000,
          ctaPrincipal: { label: "Únete a la red", href: "/registro" },
        },
      ],
      fields: [
        {
          name: "activo",
          type: "checkbox",
          label: "Activo",
          defaultValue: true,
          admin: {
            description:
              "Desmárcalo para ocultar temporalmente este slide sin eliminarlo.",
          },
        },
        {
          name: "etiqueta",
          type: "text",
          label: "Etiqueta (kicker)",
          required: true,
          minLength: 2,
          maxLength: 40,
        },
        {
          name: "titulo",
          type: "text",
          label: "Título",
          required: true,
          minLength: 5,
          maxLength: 90,
        },
        {
          name: "texto",
          type: "textarea",
          label: "Texto",
          required: true,
          minLength: 10,
          maxLength: 220,
        },
        {
          name: "imagen",
          type: "upload",
          relationTo: "media",
          label: "Imagen",
          required: false,
        },
        {
          name: "duracion",
          type: "number",
          label: "Duración (ms)",
          required: true,
          min: 2000,
          max: 15000,
          defaultValue: 5000,
          admin: {
            description:
              "Milisegundos que el slide permanece visible antes de avanzar (recomendado 3000–8000).",
          },
        },
        ctaGroupField({
          name: "ctaPrincipal",
          label: "CTA principal",
          required: true,
        }),
        ctaGroupField({
          name: "ctaSecundario",
          label: "CTA secundario",
          required: false,
        }),
      ],
    },
  ],
};

/* -------------------------------------------------------------------------------------------- */
/*  NOSOTROS                                                                                     */
/* -------------------------------------------------------------------------------------------- */

const nosotrosField: Field = {
  name: "nosotros",
  type: "group",
  label: "Nosotros",
  admin: { description: 'Sección "Nosotros" de la home.' },
  fields: [
    {
      name: "titulo",
      type: "text",
      label: "Título",
      required: true,
      minLength: 3,
      maxLength: 60,
      defaultValue: "Nosotros",
    },
    {
      name: "texto",
      type: "textarea",
      label: "Texto",
      required: true,
      minLength: 50,
      maxLength: 800,
      defaultValue:
        "La Red de Egresados de Posgrado del TecNM reúne a maestras, maestros, doctoras y doctores egresados de los institutos tecnológicos del país. Nuestro propósito es fortalecer la vinculación profesional, la colaboración académica y la presencia del posgrado tecnológico en el desarrollo nacional.",
    },
    {
      name: "imagen1",
      type: "upload",
      relationTo: "media",
      label: "Imagen 1",
      required: false,
    },
    {
      name: "imagen2",
      type: "upload",
      relationTo: "media",
      label: "Imagen 2",
      required: false,
    },
  ],
};

/* -------------------------------------------------------------------------------------------- */
/*  MISIÓN / VISIÓN                                                                              */
/* -------------------------------------------------------------------------------------------- */

const misionField: Field = {
  name: "mision",
  type: "group",
  label: "Misión",
  admin: { description: 'Sección "Misión" de la home.' },
  fields: [
    {
      name: "titulo",
      type: "text",
      label: "Título",
      required: true,
      minLength: 3,
      maxLength: 40,
      defaultValue: "Misión",
    },
    {
      name: "texto",
      type: "textarea",
      label: "Texto",
      required: true,
      minLength: 50,
      maxLength: 900,
      defaultValue:
        "Consolidar una comunidad de egresados de posgrado del TecNM que promueva la colaboración académica, científica y social, contribuyendo al desarrollo sustentable, la innovación tecnológica y el fortalecimiento institucional, con impacto en los ámbitos local, regional, nacional e internacional.",
    },
  ],
};

const visionField: Field = {
  name: "vision",
  type: "group",
  label: "Visión",
  admin: { description: 'Sección "Visión" de la home.' },
  fields: [
    {
      name: "titulo",
      type: "text",
      label: "Título",
      required: true,
      minLength: 3,
      maxLength: 40,
      defaultValue: "Visión",
    },
    {
      name: "texto",
      type: "textarea",
      label: "Texto",
      required: true,
      minLength: 50,
      maxLength: 900,
      defaultValue:
        "Ser una red de referencia nacional e internacional que articule conocimientos, proyectos y liderazgos de los egresados del TecNM, posicionando su incidencia en la transformación productiva, la innovación social, el desarrollo territorial y la consolidación de una sociedad más justa, equitativa y sostenible.",
    },
  ],
};

/* -------------------------------------------------------------------------------------------- */
/*  AFILIACIÓN                                                                                   */
/* -------------------------------------------------------------------------------------------- */

const afiliacionField: Field = {
  name: "afiliacion",
  type: "group",
  label: "Afiliación",
  admin: {
    description: 'Sección "Afiliación": beneficios, requisitos y proceso.',
  },
  fields: [
    {
      name: "titulo",
      type: "text",
      label: "Título",
      required: true,
      minLength: 3,
      maxLength: 40,
      defaultValue: "Afiliación",
    },
    {
      name: "descripcion",
      type: "textarea",
      label: "Descripción",
      required: true,
      minLength: 10,
      maxLength: 300,
      defaultValue:
        "Conoce los beneficios, requisitos y el proceso para unirte a la red.",
    },
    {
      name: "secciones",
      type: "array",
      label: "Secciones",
      labels: { singular: "Sección", plural: "Secciones" },
      minRows: 1,
      maxRows: 6,
      admin: {
        initCollapsed: true,
        description:
          "Bloques de contenido (ej. Beneficios, Requisitos, Proceso). Arrastra para reordenar; agrega o elimina según necesites.",
      },
      defaultValue: [
        {
          titulo: "Beneficios",
          items: [
            { texto: "Credencial digital con verificación por QR." },
            { texto: "Perfil en el catálogo nacional de profesionales." },
            { texto: "Mensajería con la comunidad de posgrado." },
            { texto: "Publicación en el repositorio académico." },
          ],
        },
        {
          titulo: "Requisitos",
          items: [
            { texto: "Grado de posgrado en un instituto TecNM." },
            { texto: "Comprobante de pago de membresía." },
            { texto: "Fotografía 3:4 reciente." },
          ],
        },
        {
          titulo: "Proceso",
          items: [
            { texto: "Crea tu cuenta y verifica tu correo." },
            { texto: "Completa tu expediente y documentación." },
            { texto: "La directiva revisa y aprueba tu solicitud." },
            { texto: "Recibe tu credencial digital activa." },
          ],
        },
      ],
      fields: [
        {
          name: "titulo",
          type: "text",
          label: "Título de la sección",
          required: true,
          minLength: 2,
          maxLength: 40,
        },
        {
          name: "items",
          type: "array",
          label: "Elementos",
          labels: { singular: "Elemento", plural: "Elementos" },
          minRows: 1,
          maxRows: 12,
          admin: {
            initCollapsed: true,
            description:
              "Elementos (bullets) de esta sección. Arrastra para reordenar.",
          },
          fields: [
            {
              name: "texto",
              type: "text",
              label: "Texto",
              required: true,
              minLength: 3,
              maxLength: 200,
            },
          ],
        },
      ],
    },
    ctaGroupField({
      name: "cta",
      label: "Botón de afiliación",
      required: true,
      description: "Botón principal de la sección de afiliación. Obligatorio.",
      defaultLabel: "¿Eres nuevo? Afíliate",
      defaultHref: "/register",
    }),
  ],
};

/* -------------------------------------------------------------------------------------------- */
/*  QUÉ HACEMOS                                                                                  */
/* -------------------------------------------------------------------------------------------- */

const queHacemosField: Field = {
  name: "queHacemos",
  type: "group",
  label: "Qué hacemos",
  admin: { description: 'Sección "Qué hacemos" de la home.' },
  fields: [
    {
      name: "titulo",
      type: "text",
      label: "Título",
      required: true,
      minLength: 3,
      maxLength: 40,
      defaultValue: "Qué hacemos",
    },
    {
      name: "texto",
      type: "textarea",
      label: "Texto",
      required: true,
      minLength: 50,
      maxLength: 800,
      defaultValue:
        "Impulsamos la investigación aplicada, la publicación académica y la vinculación del talento de posgrado con los sectores productivo, social y gubernamental, para que el conocimiento generado en las aulas del TecNM se traduzca en desarrollo para México.",
    },
  ],
};

/* -------------------------------------------------------------------------------------------- */
/*  TESTIMONIOS                                                                                  */
/* -------------------------------------------------------------------------------------------- */

const testimoniosField: Field = {
  name: "testimonios",
  type: "array",
  label: "Testimonios",
  labels: { singular: "Testimonio", plural: "Testimonios" },
  minRows: 0,
  maxRows: 12,
  admin: {
    initCollapsed: true,
    description:
      "Sección opcional: puede dejarse completamente vacía. Arrastra para reordenar los testimonios.",
  },
  defaultValue: [
    {
      activo: true,
      nombre: "Dra. Elena Ruiz",
      texto:
        "La red me permitió vincular mi investigación con el sector productivo de mi estado.",
      puntaje: 5,
    },
    {
      activo: true,
      nombre: "Mtro. Carlos Mora",
      texto:
        "Encontré colaboradores para un proyecto interinstitucional en menos de una semana.",
      puntaje: 4,
    },
    {
      activo: true,
      nombre: "Dra. Paola Sandoval",
      texto:
        "La credencial digital con QR es práctica y segura; la uso en congresos y eventos.",
      puntaje: 5,
    },
  ],
  fields: [
    {
      name: "activo",
      type: "checkbox",
      label: "Activo",
      defaultValue: true,
      admin: {
        description:
          "Desmárcalo para ocultar temporalmente este testimonio sin eliminarlo.",
      },
    },
    {
      name: "nombre",
      type: "text",
      label: "Nombre",
      required: true,
      minLength: 3,
      maxLength: 80,
    },
    {
      name: "texto",
      type: "textarea",
      label: "Texto",
      required: true,
      minLength: 10,
      maxLength: 400,
    },
    {
      name: "puntaje",
      type: "number",
      label: "Puntaje",
      required: true,
      min: 1,
      max: 5,
      admin: { description: "Calificación de 1 a 5." },
    },
    {
      name: "foto",
      type: "upload",
      relationTo: "media",
      label: "Foto",
      required: false,
    },
  ],
};

/* -------------------------------------------------------------------------------------------- */
/*  CONTACTO                                                                                     */
/* -------------------------------------------------------------------------------------------- */

const contactoField: Field = {
  name: "contacto",
  type: "group",
  label: "Contacto",
  admin: { description: 'Sección "Contacto" de la home.' },
  fields: [
    {
      name: "titulo",
      type: "text",
      label: "Título",
      required: true,
      minLength: 3,
      maxLength: 40,
      defaultValue: "Contacto",
    },
    {
      name: "texto",
      type: "textarea",
      label: "Texto",
      required: true,
      minLength: 10,
      maxLength: 400,
      defaultValue:
        "¿Quieres saber más sobre la afiliación o los servicios de la red? Escríbenos o síguenos en nuestras redes oficiales.",
    },
    {
      name: "redes",
      type: "group",
      label: "Redes sociales",
      admin: {
        description:
          "Todas son opcionales. Deja vacío el campo de la red que no uses.",
      },
      fields: [
        socialUrlField("facebook", "Facebook", "https://facebook.com/reptecnm"),
        socialUrlField("instagram", "Instagram"),
        socialUrlField("linkedin", "LinkedIn"),
        socialUrlField("youtube", "YouTube"),
        socialUrlField("tiktok", "TikTok"),
      ],
    },
  ],
};

/* -------------------------------------------------------------------------------------------- */
/*  GLOBAL: HOME                                                                                 */
/* -------------------------------------------------------------------------------------------- */

export const Home: GlobalConfig = {
  slug: "home",
  label: "Inicio (Landing Page)",
  admin: {
    description:
      "Contenido editorial de la página principal. Este Global controla textos, imágenes y enlaces; no controla layout, estilos Tailwind ni componentes React.",
  },
  access: {
    // Lectura pública: el frontend (Next.js) necesita poder resolver el contenido
    // de la home sin autenticación.
    read: () => true,
    // Escritura solo para usuarios autenticados (misma convención que la
    // Collection `media`, vía la Better Auth strategy: req.user existe solo
    // si betterAuthStrategy.authenticate devolvió un usuario).
    update: ({ req }) => Boolean(req.user),
  },
  versions: {
    drafts: true,
    max: 5,
  },
  fields: [
    heroField,
    nosotrosField,
    misionField,
    visionField,
    afiliacionField,
    queHacemosField,
    testimoniosField,
    contactoField,
  ],
};

export default Home;
