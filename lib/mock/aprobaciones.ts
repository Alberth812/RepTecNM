export interface Solicitud {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  instituto: string;
  posgrado: string;
  anioGraduacion: number;
  areaConocimiento: string;
  estadoResidencia: string;
  ocupacion: string;
  fechaEnvio: string;
  versionActual: number;
  observacionesAnteriores?: string;
  versionAnterior?: Partial<Solicitud>;
  edad: number;
  genero: string;
}

export const solicitudesIniciales: Solicitud[] = [
  {
    id: "SOL-0001",
    nombre: "María Fernanda López Herrera",
    correo: "mf.lopez@ejemplo.com",
    telefono: "55 1234 5678",
    instituto: "Instituto Tecnológico de Celaya",
    posgrado: "Maestría en Ciencias Computacionales",
    anioGraduacion: 2024,
    areaConocimiento: "Ingeniería",
    estadoResidencia: "Guanajuato",
    ocupacion: "Docente e investigadora",
    fechaEnvio: "10 ago 2026",
    versionActual: 1,
    edad: 34,
    genero: "Femenino",
  },
  {
    id: "SOL-0002",
    nombre: "Jorge Alberto Ramírez Soto",
    correo: "ja.ramirez@ejemplo.com",
    telefono: "998 111 2233",
    instituto: "Instituto Tecnológico de Mérida",
    posgrado: "Doctorado en Ciencias de la Ingeniería",
    anioGraduacion: 2023,
    areaConocimiento: "Ingeniería",
    estadoResidencia: "Yucatán",
    ocupacion: "Ingeniero de proyectos",
    fechaEnvio: "08 ago 2026",
    versionActual: 2,
    observacionesAnteriores:
      "El comprobante de pago no coincide con el folio reportado y falta el certificado del posgrado. Se solicita cargar documentación vigente y corregir el teléfono de contacto.",
    versionAnterior: {
      posgrado: "Maestría en Ingeniería Electrónica",
      anioGraduacion: 2021,
      telefono: "999 876 5432",
      fechaEnvio: "28 jul 2026",
      edad: 34,
      genero: "MASCULINO",
    },
    edad: 36,
    genero: "Masculino",
  },
  {
    id: "SOL-0003",
    nombre: "Ana Cecilia Torres Miranda",
    correo: "ac.torres@ejemplo.com",
    telefono: "33 4455 6677",
    instituto: "Instituto Tecnológico de Tijuana",
    posgrado: "Maestría en Administración",
    anioGraduacion: 2025,
    areaConocimiento: "Económico-Administrativas",
    estadoResidencia: "Baja California",
    ocupacion: "Consultora independiente",
    fechaEnvio: "05 ago 2026",
    versionActual: 1,
    edad: 29,
    genero: "Femenino",
  },
];