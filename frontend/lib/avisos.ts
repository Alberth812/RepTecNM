export type Aviso = {
  id: string;
  titulo: string;
  texto: string;
  imagen_url?: string | null;
  tono: "info" | "exito" | "alerta" | "aviso";
  activo: boolean;
  fecha_creacion?: string;
};

const CLAVE = "rep-avisos";
const CERRADOS = "rep-avisos-cerrados";

export function obtenerAvisos(): Aviso[] {
  if (typeof window === "undefined") return [];
  try {
    const datos = localStorage.getItem(CLAVE);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

export function guardarAvisos(avisos: Aviso[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAVE, JSON.stringify(avisos));
}

export function avisosPendientes(): Aviso[] {
  const cerrados = leerCerrados();
  return obtenerAvisos().filter((a) => a.activo && !cerrados.includes(a.id));
}

export function cerrarAviso(id: string) {
  const cerrados = leerCerrados();
  if (!cerrados.includes(id)) {
    cerrados.push(id);
    localStorage.setItem(CERRADOS, JSON.stringify(cerrados));
  }
}

function leerCerrados(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const datos = localStorage.getItem(CERRADOS);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

export function crearAviso(
  titulo: string,
  texto: string,
  tono: Aviso["tono"],
  imagen_url?: string | null
): Aviso {
  return {
    id: `AV-${Date.now()}`,
    titulo,
    texto,
    tono,
    imagen_url: imagen_url || null,
    activo: true,
    fecha_creacion: new Date().toISOString(),
  };
}
