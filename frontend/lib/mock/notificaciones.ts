export interface Notificacion {
  id: string;
  tipo: "aprobacion" | "reporte" | "mensaje";
  texto: string;
  fecha: string;
  leida: boolean;
  href: string;
}

export const notificacionesIniciales: Notificacion[] = [
  { id: "n1", tipo: "aprobacion", texto: "Nueva solicitud de afiliación: Ana Cecilia Torres Miranda.", fecha: "Hoy 09:12", leida: false, href: "/aprobaciones" },
  { id: "n2", tipo: "reporte", texto: "Reporte por derechos de autor pendiente de resolver.", fecha: "Ayer 17:40", leida: false, href: "/reportes" },
  { id: "n3", tipo: "mensaje", texto: "Comentario nuevo en el foro del repositorio.", fecha: "Ayer 10:05", leida: false, href: "/moderacion" },
  { id: "n4", tipo: "aprobacion", texto: "Jorge Alberto Ramírez Soto envió la versión 2 de su solicitud.", fecha: "08 ago 2026", leida: true, href: "/aprobaciones" },
];
