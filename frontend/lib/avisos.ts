export type Aviso = {
  id: string;
  titulo: string;
  texto: string;
  tono: "info" | "exito" | "alerta";
  activo: boolean;
};

const CLAVE = "rep-avisos";
const CERRADOS = "rep-avisos-cerrados";

const SEMILLA: Aviso[] = [
  {
    id: "AV-1",
    titulo: "Aviso de afiliación",
    texto: "Por el momento nuestra plataforma se encuentra en desarrollo. ¡Gracias por tu interés!",
    tono: "info",
    activo: true,
  },
  {
    id: "AV-2",
    titulo: "Convocatoria 2026",
    texto: "Ya está disponible la convocatoria al congreso nacional de egresados. Consulta el repositorio para más detalles.",
    tono: "exito",
    activo: true,
  },
];

export function cargarAvisos(): Aviso[] {
  if (typeof window === "undefined") return SEMILLA;
  const g = localStorage.getItem(CLAVE);
  if (g) return JSON.parse(g) as Aviso[];
  localStorage.setItem(CLAVE, JSON.stringify(SEMILLA));
  return SEMILLA;
}

export function guardarAvisos(lista: Aviso[]) {
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

export function leerCerrados(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CERRADOS) ?? "[]");
}

export function cerrarAviso(id: string) {
  localStorage.setItem(CERRADOS, JSON.stringify([...leerCerrados(), id]));
}

export function avisosPendientes(): Aviso[] {
  const cerrados = leerCerrados();
  return cargarAvisos().filter((a) => a.activo && !cerrados.includes(a.id));
}
