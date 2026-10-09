import type { Field, GlobalConfig } from "payload";

const INTERNAL_PATH_REGEX = /^\/[a-zA-Z0-9\-._~/?=&%]*$/;
const validateHref = (required: boolean) => (value: string | null | undefined): true | string => {
  if (!value || value.trim() === "") return required ? "Este campo es obligatorio." : true;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return INTERNAL_PATH_REGEX.test(trimmed) ? true : "La ruta interna contiene caracteres no permitidos.";
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:") return true;
    return 'Las URLs externas deben usar "https://".';
  } catch {
    return 'Debe ser una ruta interna (ej. "/catalogo") o una URL externa "https://...".';
  }
};

const validateSocialUrl = (value: string | null | undefined): true | string => {
  if (!value || value.trim() === "") return true;
  try {
    const url = new URL(value.trim());
    if (url.protocol === "http:" || url.protocol === "https:") return true;
    return 'Debe ser una URL "http://" o "https://" válida.';
  } catch {
    return 'Debe ser una URL "http://" o "https://" válida.';
  }
};

const ctaGroupField = ({ name, label, required, defaultLabel, defaultHref }: { name: string; label: string; required: boolean; defaultLabel?: string; defaultHref?: string }): Field => ({
  name, type: "group", label,
  fields: [
    { name: "label", type: "text", label: "Texto del botón", required, minLength: 2, maxLength: 40, defaultValue: defaultLabel },
    { name: "href", type: "text", label: "Enlace (href)", required, defaultValue: defaultHref, validate: validateHref(required) },
  ],
});

const socialUrlField = (name: string, label: string, defaultValue?: string): Field => ({
  name, type: "text", label, required: false, defaultValue, validate: validateSocialUrl,
});

const heroField: Field = {
  name: "hero", type: "group", label: "Hero (Carousel principal)",
  fields: [{
    name: "slides", type: "array", label: "Slides", minRows: 1, maxRows: 8,
    defaultValue: [{ activo: true, etiqueta: "Red de Egresados", titulo: "Conectamos el talento de posgrado del TecNM", texto: "Una comunidad nacional de profesionales.", duracion: 5000, ctaPrincipal: { label: "Explorar catálogo", href: "/catalogo" } }],
    fields: [
      { name: "activo", type: "checkbox", label: "Activo", defaultValue: true },
      { name: "etiqueta", type: "text", label: "Etiqueta", required: true, maxLength: 40 },
      { name: "titulo", type: "text", label: "Título", required: true, maxLength: 90 },
      { name: "texto", type: "textarea", label: "Texto", required: true, maxLength: 220 },
      { name: "imagen", type: "upload", relationTo: "media", label: "Imagen", required: false },
      { name: "duracion", type: "number", label: "Duración (ms)", required: true, min: 2000, max: 15000, defaultValue: 5000 },
      ctaGroupField({ name: "ctaPrincipal", label: "CTA principal", required: true }),
      ctaGroupField({ name: "ctaSecundario", label: "CTA secundario", required: false }),
    ],
  }],
};

const nosotrosField: Field = {
  name: "nosotros", type: "group", label: "Nosotros",
  fields: [
    { name: "titulo", type: "text", label: "Título", required: true, defaultValue: "Nosotros" },
    { name: "texto", type: "textarea", label: "Texto", required: true },
    { name: "imagen1", type: "upload", relationTo: "media", label: "Imagen 1", required: false },
    { name: "imagen2", type: "upload", relationTo: "media", label: "Imagen 2", required: false },
  ],
};

const misionField: Field = {
  name: "mision", type: "group", label: "Misión",
  fields: [
    { name: "titulo", type: "text", label: "Título", required: true, defaultValue: "Misión" },
    { name: "texto", type: "textarea", label: "Texto", required: true },
  ],
};

const visionField: Field = {
  name: "vision", type: "group", label: "Visión",
  fields: [
    { name: "titulo", type: "text", label: "Título", required: true, defaultValue: "Visión" },
    { name: "texto", type: "textarea", label: "Texto", required: true },
  ],
};

const afiliacionField: Field = {
  name: "afiliacion", type: "group", label: "Afiliación",
  fields: [
    { name: "titulo", type: "text", label: "Título", required: true, defaultValue: "Afiliación" },
    { name: "descripcion", type: "textarea", label: "Descripción", required: true },
    {
      name: "secciones", type: "array", label: "Secciones", minRows: 1, maxRows: 6,
      defaultValue: [{ titulo: "Beneficios", items: [{ texto: "Credencial digital con verificación por QR." }] }],
      fields: [
        { name: "titulo", type: "text", label: "Título de la sección", required: true },
        { name: "items", type: "array", label: "Elementos", minRows: 1, fields: [{ name: "texto", type: "text", label: "Texto", required: true }] },
      ],
    },
    ctaGroupField({ name: "cta", label: "Botón de afiliación", required: true, defaultLabel: "¿Eres nuevo? Afíliate", defaultHref: "/register" }),
  ],
};

const queHacemosField: Field = {
  name: "queHacemos", type: "group", label: "Qué hacemos",
  fields: [
    { name: "titulo", type: "text", label: "Título", required: true, defaultValue: "Qué hacemos" },
    { name: "texto", type: "textarea", label: "Texto", required: true },
  ],
};

const testimoniosField: Field = {
  name: "testimonios", type: "array", label: "Testimonios", minRows: 0, maxRows: 12,
  defaultValue: [{ activo: true, nombre: "Dra. Elena Ruiz", texto: "La red me permitió vincular mi investigación.", puntaje: 5 }],
  fields: [
    { name: "activo", type: "checkbox", label: "Activo", defaultValue: true },
    { name: "nombre", type: "text", label: "Nombre", required: true },
    { name: "texto", type: "textarea", label: "Texto", required: true },
    { name: "puntaje", type: "number", label: "Puntaje", required: true, min: 1, max: 5 },
    { name: "foto", type: "upload", relationTo: "media", label: "Foto", required: false },
  ],
};

const contactoField: Field = {
  name: "contacto", type: "group", label: "Contacto",
  fields: [
    { name: "titulo", type: "text", label: "Título", required: true, defaultValue: "Contacto" },
    { name: "texto", type: "textarea", label: "Texto", required: true },
    {
      name: "redes", type: "group", label: "Redes sociales",
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


export const Home: GlobalConfig = {
  slug: "home",
  label: "Inicio (Landing Page)",
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  versions: { drafts: true, max: 5 },
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
