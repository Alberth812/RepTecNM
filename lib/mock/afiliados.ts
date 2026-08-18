export type EstadoAfiliado = "ACTIVO" | "INACTIVO" | "BAJA" | "PENDIENTE_APROBACION";

export interface Afiliado {
  id: string;
  nombre: string;
  instituto: string;
  posgrado: string;
  estado: EstadoAfiliado;
  ultimaActualizacion: string;
  contactoPublico: boolean;
}

export const afiliadosIniciales: Afiliado[] = [
  { id: "REP-2026-00001", nombre: "María Fernanda López Herrera", instituto: "Instituto Tecnológico de Celaya", posgrado: "Maestría en Ciencias Computacionales", estado: "ACTIVO", ultimaActualizacion: "2025-05-10", contactoPublico: true },
  { id: "REP-2026-00002", nombre: "Jorge Alberto Ramírez Soto", instituto: "Instituto Tecnológico de Mérida", posgrado: "Doctorado en Ciencias de la Ingeniería", estado: "ACTIVO", ultimaActualizacion: "2026-07-02", contactoPublico: true },
  { id: "REP-2026-00003", nombre: "Ana Cecilia Torres Miranda", instituto: "Instituto Tecnológico de Tijuana", posgrado: "Maestría en Administración", estado: "PENDIENTE_APROBACION", ultimaActualizacion: "2026-08-05", contactoPublico: false },
  { id: "REP-2026-00004", nombre: "Gabriela Sánchez Moreno", instituto: "Instituto Tecnológico de Querétaro", posgrado: "Doctorado en Biotecnología", estado: "ACTIVO", ultimaActualizacion: "2026-06-20", contactoPublico: true },
  { id: "REP-2026-00005", nombre: "Ricardo Pérez Castillo", instituto: "Instituto Tecnológico de Nuevo León", posgrado: "Maestría en Finanzas", estado: "INACTIVO", ultimaActualizacion: "2024-11-30", contactoPublico: false },
  { id: "REP-2026-00006", nombre: "Verónica Jiménez Ríos", instituto: "Instituto Tecnológico de Oaxaca", posgrado: "Doctorado en Ciencias Ambientales", estado: "ACTIVO", ultimaActualizacion: "2026-03-15", contactoPublico: true },
  { id: "REP-2026-00007", nombre: "Héctor Manuel Ortega Luna", instituto: "Instituto Tecnológico de Querétaro", posgrado: "Maestría en Urbanismo", estado: "BAJA", ultimaActualizacion: "2024-06-01", contactoPublico: false },
  { id: "REP-2026-00008", nombre: "Sofía Delgado Ramírez", instituto: "Instituto Tecnológico de Mérida", posgrado: "Maestría en Educación", estado: "ACTIVO", ultimaActualizacion: "2026-08-01", contactoPublico: false },
];
