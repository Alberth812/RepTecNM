export interface Slide {
 tipo: "normal" | "aviso";
 prioridad?: "alta" | "normal";
 etiqueta: string;
 titulo: string;
 texto: string;
 ctaLabel: string;
 ctaHref: string;
 imagen: string;
}

export interface Testimonio {
 nombre: string;
 texto: string;
 puntaje: number;
 foto: string;
}

export interface ContenidoHome {
 slides: Slide[];
 nosotrosTexto: string;
 mision: string;
 vision: string;
 nosotrosImagen1: string;
 nosotrosImagen2: string;
 queHacemosTexto: string;
 testimonios: Testimonio[];
 contactoTitulo: string;
 contactoTexto: string;
 redes: {
 facebook: string;
 instagram: string;
 linkedin: string;
 youtube: string;
 tiktok: string;
 };
}

export const CONTENIDO_DEFAULT: ContenidoHome = {
 mision: "Consolidar una comunidad de egresados de posgrado del TecNM que promueva la colaboración académica, científica y social, contribuyendo al desarrollo sustentable, la innovación tecnológica y el fortalecimiento institucional, con impacto en los ámbitos local, regional, nacional e internacional.",
 vision: "Ser una red de referencia nacional e internacional que articule conocimientos, proyectos y liderazgos de los egresados del TecNM, posicionando su incidencia en la transformación productiva, la innovación social, el desarrollo territorial y la consolidación de una sociedad más justa, equitativa y sostenible.",
 slides: [
 {
 tipo: "normal",
 etiqueta: "Red de Egresados",
 titulo: "Conectamos el talento de posgrado del TecNM",
 texto: "Una comunidad nacional de profesionales que colabora, investiga y transforma al país.",
 ctaLabel: "Explorar catálogo",
 ctaHref: "/catalogo",
 imagen: "",
 },
 {
 tipo: "normal",
 etiqueta: "Credencial digital",
 titulo: "Tu afiliación, siempre contigo",
 texto: "Credencial con verificación por código QR, disponible en formato digital e imprimible.",
 ctaLabel: "Conocer la credencial",
 ctaHref: "/catalogo",
 imagen: "",
 },
 {
 tipo: "normal",
 etiqueta: "Vinculación",
 titulo: "Servicios profesionales con respaldo académico",
 texto: "Consultoría, investigación y capacitación para el sector productivo y gubernamental.",
 ctaLabel: "Únete a la red",
 ctaHref: "/registro",
 imagen: "",
 },
 ],
 nosotrosTexto:
 "La Red de Egresados de Posgrado del TecNM reúne a maestras, maestros, doctoras y doctores egresados de los institutos tecnológicos del país. Nuestro propósito es fortalecer la vinculación profesional, la colaboración académica y la presencia del posgrado tecnológico en el desarrollo nacional.",
 nosotrosImagen1: "",
 nosotrosImagen2: "",
 queHacemosTexto:
 "Impulsamos la investigación aplicada, la publicación académica y la vinculación del talento de posgrado con los sectores productivo, social y gubernamental, para que el conocimiento generado en las aulas del TecNM se traduzca en desarrollo para México.",
 testimonios: [
 { nombre: "Dra. Elena Ruiz", texto: "La red me permitió vincular mi investigación con el sector productivo de mi estado.", puntaje: 5, foto: "" },
 { nombre: "Mtro. Carlos Mora", texto: "Encontré colaboradores para un proyecto interinstitucional en menos de una semana.", puntaje: 4, foto: "" },
 { nombre: "Dra. Paola Sandoval", texto: "La credencial digital con QR es práctica y segura; la uso en congresos y eventos.", puntaje: 5, foto: "" },
 ],
 contactoTitulo: "Contacto",
 contactoTexto:
 "¿Quieres saber más sobre la afiliación o los servicios de la red? Escríbenos o síguenos en nuestras redes oficiales.",
 redes: {
 facebook: "https://facebook.com/reptecnm",
 instagram: "",
 linkedin: "",
 youtube: "",
 tiktok: "",
 },
};

const KEY = "rep-cms-home";

export function cargarContenido(): ContenidoHome {
 if (typeof window === "undefined") return CONTENIDO_DEFAULT;
 try {
 const g = localStorage.getItem(KEY);
 return g ? { ...CONTENIDO_DEFAULT, ...JSON.parse(g) } : CONTENIDO_DEFAULT;
 } catch {
 return CONTENIDO_DEFAULT;
 }
}

export function guardarContenido(c: ContenidoHome) {
 localStorage.setItem(KEY, JSON.stringify(c));
}