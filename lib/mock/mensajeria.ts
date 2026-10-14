export interface Mensaje {
 id: string;
 remitente: "yo" | "otro";
 contenido: string;
 adjunto?: { nombre: string; tipo: string; tamano: string };
 hora: string;
 leido: boolean;
}

export interface Conversacion {
 id: string;
 nombre: string;
 institucion: string;
 ultimoMensaje: string;
 ultimaHora: string;
 noLeidos: number;
 bloqueado: boolean;
 mensajes: Mensaje[];
}

export const conversacionesIniciales: Conversacion[] = [
 {
 id: "conv-01",
 nombre: "Dra. Elena Ruiz",
 institucion: "Instituto Tecnológico de Querétaro",
 ultimoMensaje: "¿Tienes disponibilidad para la reunión del jueves?",
 ultimaHora: "10:42",
 noLeidos: 2,
 bloqueado: false,
 mensajes: [
 { id: "m1", remitente: "otro", contenido: "Hola, vi tu publicación sobre redes de sensores. ¿Podemos platicar sobre una colaboración?", hora: "Ayer 09:15", leido: true },
 { id: "m2", remitente: "yo", contenido: "Claro, con mucho gusto. ¿Qué tienes en mente?", hora: "Ayer 09:30", leido: true },
 { id: "m3", remitente: "otro", contenido: "Estoy armando un proyecto interinstitucional con fondos CONAHCYT y creo que tu experiencia en IoT encaja perfecto.", hora: "Ayer 09:32", leido: true },
 { id: "m4", remitente: "yo", contenido: "Suena muy interesante. ¿Me compartes los lineamientos de la convocatoria?", hora: "Ayer 09:40", leido: true },
 { id: "m5", remitente: "otro", contenido: "Te adjunto el documento.", hora: "Ayer 09:42", leido: true, adjunto: { nombre: "Convocatoria-2026.pdf", tipo: "PDF", tamano: "1.8 MB" } },
 { id: "m6", remitente: "yo", contenido: "Perfecto, lo reviso esta tarde.", hora: "Ayer 10:05", leido: true },
 { id: "m7", remitente: "otro", contenido: "¿Tienes disponibilidad para la reunión del jueves?", hora: "Hoy 10:42", leido: false },
 { id: "m8", remitente: "otro", contenido: "Puede ser virtual, de 11 a 12.", hora: "Hoy 10:42", leido: false },
 ],
 },
 {
 id: "conv-02",
 nombre: "Mtro. Carlos Mora",
 institucion: "Instituto Tecnológico de Celaya",
 ultimoMensaje: "Gracias por tu retroalimentación sobre el artículo.",
 ultimaHora: "Ayer",
 noLeidos: 0,
 bloqueado: false,
 mensajes: [
 { id: "m1", remitente: "otro", contenido: "Acabo de subir un artículo al repositorio, ¿me podrías dar tu opinión técnica?", hora: "Lun 16:20", leido: true },
 { id: "m2", remitente: "yo", contenido: "Con gusto, lo leo hoy.", hora: "Lun 17:05", leido: true },
 { id: "m3", remitente: "yo", contenido: "Listo, te dejé comentarios en el PDF.", hora: "Mar 09:15", leido: true },
 { id: "m4", remitente: "otro", contenido: "Gracias por tu retroalimentación sobre el artículo.", hora: "Mar 09:40", leido: true },
 ],
 },
 {
 id: "conv-03",
 nombre: "Dra. Paola Sandoval",
 institucion: "Instituto Tecnológico de Mérida",
 ultimoMensaje: "Nos vemos en el congreso de noviembre.",
 ultimaHora: "Dom",
 noLeidos: 0,
 bloqueado: false,
 mensajes: [
 { id: "m1", remitente: "otro", contenido: "¿Asistirás al Congreso Nacional de Posgrado?", hora: "Sáb 14:10", leido: true },
 { id: "m2", remitente: "yo", contenido: "Sí, estaré presentando un póster.", hora: "Sáb 14:45", leido: true },
 { id: "m3", remitente: "otro", contenido: "Nos vemos en el congreso de noviembre.", hora: "Dom 08:30", leido: true },
 ],
 },
];
