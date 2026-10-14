export interface ReporteDoc {
 id: string;
 documentoId: string;
 documentoTitulo: string;
 motivo: string;
 detalle?: string;
 reportante: string;
 fecha: string;
 estado: "PENDIENTE" | "RESUELTO";
}

export const reportesIniciales: ReporteDoc[] = [
 {
 id: "REP-001",
 documentoId: "DOC-2026-0003",
 documentoTitulo: "Gestión de riesgos financieros en pymes tecnológicas mexicanas",
 motivo: "Derechos de autor",
 detalle: "El documento parece pertenecer a una editorial que no autorizó su distribución.",
 reportante: "Gabriela Sánchez Moreno",
 fecha: "12 ago 2026",
 estado: "PENDIENTE",
 },
 {
 id: "REP-002",
 documentoId: "DOC-2026-0005",
 documentoTitulo: "Vivienda sostenible y movilidad urbana en ciudades medias de México",
 motivo: "Plagio",
 detalle: "El capítulo 3 coincide con un artículo publicado en 2022 sin la cita correspondiente.",
 reportante: "Héctor Manuel Ortega Luna",
 fecha: "10 ago 2026",
 estado: "PENDIENTE",
 },
 {
 id: "REP-003",
 documentoId: "DOC-2026-0006",
 documentoTitulo: "Innovación educativa mediante laboratorios remotos en la enseñanza de la ingeniería",
 motivo: "Spam",
 reportante: "Sofía Delgado Ramírez",
 fecha: "08 ago 2026",
 estado: "PENDIENTE",
 },
];
