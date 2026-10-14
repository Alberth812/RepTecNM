export interface Comentario { autor: string; texto: string; fecha: string }

export const COMENTARIOS_INICIALES: Record<string, Comentario[]> = {
 "DOC-2026-0001": [
 { autor: "Jorge Alberto Ramírez Soto", texto: "Excelente trabajo de campo. ¿Compartirán el dataset de lecturas?", fecha: "12 ago 2026" },
 { autor: "Gabriela Sánchez Moreno", texto: "Muy útil como referencia para mi proyecto de sensores en salud.", fecha: "11 ago 2026" },
 ],
 "DOC-2026-0002": [
 { autor: "Ricardo Pérez Castillo", texto: "¿El modelo está disponible como código abierto?", fecha: "09 ago 2026" },
 ],
};
