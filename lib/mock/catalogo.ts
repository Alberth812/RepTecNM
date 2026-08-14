export interface PerfilCatalogo {
  id: string;
  nombre: string;
  posgrado: string;
  instituto: string;
  areas: string[];
  estadoResidencia: string;
  descripcion: string;
  palabrasClave: string[];
  proyectos: string[];
  contactoPublico: boolean;
  correo: string;
  telefono: string;
  servicios: string;
  intereses: string;
}

const NOMBRES = [
  "María Fernanda López Herrera", "Jorge Alberto Ramírez Soto", "Ana Cecilia Torres Miranda",
  "Luis Miguel Hernández Vega", "Gabriela Sánchez Moreno", "Ricardo Pérez Castillo",
  "Verónica Jiménez Ríos", "Héctor Manuel Ortega Luna", "Patricia Flores Aguilar",
  "Alejandro Cruz Mendoza", "Sofía Delgado Ramírez", "Daniel Vargas Ortiz",
  "Mariana Castillo Peña", "Raúl Domínguez Salas", "Claudia Herrera Campos",
  "Ernesto Navarro Rivas", "Lucía Méndez Bravo", "Fernando Rojas Cabrera",
  "Adriana Campos Serrano", "Guillermo Acosta Díaz", "Rosa Elena Paredes Vega",
  "Arturo Sandoval Mora", "Beatriz Quintana Solís", "Rodrigo Lara Espinoza",
  "Carmen Bustos Aguilar", "Emilio Zúñiga Franco", "Alicia Bermúdez Prieto",
  "Gonzalo Escobar Núñez", "Silvia Manzano Rueda", "Óscar Valdez Cortés",
];

const AREAS = ["Ingeniería", "Salud", "Educación", "Económico-Administrativas", "Agropecuarias", "Arquitectura"];
const ESTADOS = ["Guanajuato", "Yucatán", "Baja California", "Nuevo León", "Oaxaca", "Ciudad de México"];
const POSGRADOS = [
  "Maestría en Ciencias Computacionales", "Doctorado en Ciencias de la Ingeniería",
  "Maestría en Administración", "Maestría en Ciencias de la Salud",
  "Doctorado en Ciencias Agropecuarias", "Maestría en Arquitectura y Urbanismo",
];
const INSTITUTOS = [
  "Instituto Tecnológico de Celaya", "Instituto Tecnológico de Mérida",
  "Instituto Tecnológico de Tijuana", "Instituto Tecnológico de Nuevo León",
  "Instituto Tecnológico de Oaxaca", "Instituto Tecnológico de Querétaro",
];
const CLAVES = [
  ["inteligencia artificial", "redes de sensores", "automatización"],
  ["biotecnología", "salud pública", "genómica"],
  ["innovación educativa", "tecnología educativa", "didáctica"],
  ["finanzas corporativas", "gestión de proyectos", "mercadotecnia"],
  ["agronomía sostenible", "recursos hídricos", "bioprocesos"],
  ["diseño urbano", "vivienda sostenible", "movilidad"],
];

export const catalogo: PerfilCatalogo[] = NOMBRES.map((nombre, i) => {
  const area = AREAS[i % AREAS.length];
  const claves = CLAVES[i % CLAVES.length];
  return {
    id: `REP-2026-${String(i + 1).padStart(5, "0")}`,
    nombre,
    posgrado: POSGRADOS[i % POSGRADOS.length],
    instituto: INSTITUTOS[i % INSTITUTOS.length],
    areas: i % 4 === 0 ? [area, AREAS[(i + 1) % AREAS.length]] : [area],
    estadoResidencia: ESTADOS[i % ESTADOS.length],
    descripcion: `Especialista en ${area} con enfoque en ${claves[0]} y ${claves[1]}. Ofrece consultoría, capacitación e investigación aplicada.`,
    palabrasClave: claves,
    proyectos: [
      `Desarrollo de ${claves[0]} en el sector productivo`,
      `Investigación aplicada sobre ${claves[2]}`,
    ],
    contactoPublico: i % 3 !== 0,
    correo: `contacto${i + 1}@ejemplo.com`,
    telefono: `55 ${1000 + i} ${2000 + i}`,
    servicios: i % 2 === 0 ? "Consultoría y capacitación" : "Investigación aplicada",
    intereses: i % 2 === 0 ? "Inteligencia artificial y automatización" : "Biotecnología y salud pública",
  };
});