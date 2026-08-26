export type Notificacion = {
  id: string;
  tipo: "retiro" | "comentario" | "sistema";
  documento: string;
  texto: string;
  fecha: string;
};

const SEMILLA: Notificacion[] = [
  {
    id: "N-SEM-1",
    tipo: "comentario",
    documento: "Redes de sensores inalámbricos para monitoreo agrícola en zonas áridas",
    texto: "Gabriela Sánchez Moreno comentó: \"Muy útil como referencia para mi proyecto de sensores en salud.\"",
    fecha: "2026-08-11",
  },
  {
    id: "N-SEM-2",
    tipo: "comentario",
    documento: "Redes de sensores inalámbricos para monitoreo agrícola en zonas áridas",
    texto: "Jorge Alberto Ramírez Soto comentó: \"Excelente trabajo de campo. ¿Compartirán el dataset de lecturas?\"",
    fecha: "2026-08-12",
  },
  {
    id: "N-SEM-3",
    tipo: "sistema",
    documento: "Cuestionario de seguimiento",
    texto: "Tu formulario lleva más de 12 meses sin actualizarse. Responde para mantener tu afiliación en estado ACTIVO (RF-SEG-004).",
    fecha: "2026-08-01",
  },
];

export function cargarNotificaciones(): Notificacion[] {
  if (typeof window === "undefined") return SEMILLA;
  const retiros = JSON.parse(localStorage.getItem("rep-notificaciones") ?? "[]").map(
    (r: { id: string; documento: string; motivo: string; fecha: string }) => ({
      id: String(r.id),
      tipo: "retiro" as const,
      documento: r.documento,
      texto: `La administración retiró esta publicación del repositorio. Motivo: ${r.motivo}.`,
      fecha: r.fecha,
    })
  );
  return [...retiros, ...SEMILLA].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function leerLeidas(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("rep-leidas") ?? "[]");
}

export function marcarLeidas(ids: string[]) {
  localStorage.setItem("rep-leidas", JSON.stringify(ids));
}
