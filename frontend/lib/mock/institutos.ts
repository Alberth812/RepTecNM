export interface Instituto {
  nombre: string;
  activo: boolean;
}

export const INSTITUTOS_BASE: Instituto[] = [
  { nombre: "Instituto Tecnológico de Celaya", activo: true },
  { nombre: "Instituto Tecnológico de Mérida", activo: true },
  { nombre: "Instituto Tecnológico de Tijuana", activo: true },
  { nombre: "Instituto Tecnológico de Nuevo León", activo: true },
  { nombre: "Instituto Tecnológico de Oaxaca", activo: true },
  { nombre: "Instituto Tecnológico de Querétaro", activo: true },
];
