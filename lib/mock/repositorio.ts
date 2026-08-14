export interface Documento {
  id: string;
  titulo: string;
  resumen: string;
  tipo: string;
  anio: number;
  autores: string[];
  palabrasClave: string[];
  doi?: string;
  revista?: string;
  tamano: string;
  afiliado: string;
  propio?: boolean;
}

export const documentosIniciales: Documento[] = [
  {
    id: "DOC-2026-0001",
    titulo: "Redes de sensores inalámbricos para monitoreo agrícola en zonas áridas",
    resumen: "Se presenta una arquitectura de redes de sensores de bajo consumo para el monitoreo de humedad y temperatura en cultivos de zonas áridas, con resultados de campo en tres estados del norte del país.",
    tipo: "Artículo",
    anio: 2025,
    autores: ["María Fernanda López Herrera", "Jorge Alberto Ramírez Soto"],
    palabrasClave: ["redes de sensores", "agricultura", "iot"],
    doi: "10.1234/rev.2025.001",
    revista: "Revista de Ingeniería Tecnológica",
    tamano: "2.4 MB",
    afiliado: "María Fernanda López Herrera",
    propio: true,
  },
  {
    id: "DOC-2026-0002",
    titulo: "Modelos de aprendizaje profundo para la detección temprana de retinopatía diabética",
    resumen: "Tesis doctoral que propone un modelo de visión por computadora para la detección temprana de retinopatía diabética, alcanzando una sensibilidad superior al 94% en conjuntos de datos públicos.",
    tipo: "Tesis",
    anio: 2024,
    autores: ["Gabriela Sánchez Moreno"],
    palabrasClave: ["salud", "inteligencia artificial", "visión por computadora"],
    tamano: "4.8 MB",
    afiliado: "Gabriela Sánchez Moreno",
  },
  {
    id: "DOC-2026-0003",
    titulo: "Gestión de riesgos financieros en pymes tecnológicas mexicanas",
    resumen: "Reporte técnico con un marco de referencia para la gestión de riesgos financieros en pequeñas y medianas empresas del sector tecnológico, aplicado a una muestra de 120 organizaciones.",
    tipo: "Reporte técnico",
    anio: 2025,
    autores: ["Ricardo Pérez Castillo", "Ana Cecilia Torres Miranda"],
    palabrasClave: ["finanzas", "pymes", "riesgo"],
    tamano: "1.9 MB",
    afiliado: "Ricardo Pérez Castillo",
  },
  {
    id: "DOC-2026-0004",
    titulo: "Bioprocesos sostenibles para el tratamiento de aguas residuales industriales",
    resumen: "Memoria de congreso que describe bioprocesos basados en microalgas para el tratamiento de aguas residuales industriales, con reducción de costos energéticos de hasta 30%.",
    tipo: "Memoria de congreso",
    anio: 2026,
    autores: ["Verónica Jiménez Ríos"],
    palabrasClave: ["bioprocesos", "agua", "sostenibilidad"],
    tamano: "1.2 MB",
    afiliado: "Verónica Jiménez Ríos",
  },
  {
    id: "DOC-2026-0005",
    titulo: "Vivienda sostenible y movilidad urbana en ciudades medias de México",
    resumen: "Libro que analiza patrones de crecimiento urbano en ciudades medias y propone lineamientos de vivienda sostenible integrada a sistemas de movilidad no motorizada.",
    tipo: "Libro",
    anio: 2023,
    autores: ["Héctor Manuel Ortega Luna", "Patricia Flores Aguilar", "Alejandro Cruz Mendoza"],
    palabrasClave: ["urbanismo", "movilidad", "vivienda"],
    revista: "Editorial TecNM",
    tamano: "3.6 MB",
    afiliado: "Héctor Manuel Ortega Luna",
  },
  {
    id: "DOC-2026-0006",
    titulo: "Innovación educativa mediante laboratorios remotos en la enseñanza de la ingeniería",
    resumen: "Ensayo sobre la integración de laboratorios remotos en programas de ingeniería, con evidencia de mejora en el aprovechamiento práctico de estudiantes de posgrado.",
    tipo: "Ensayo",
    anio: 2024,
    autores: ["Sofía Delgado Ramírez"],
    palabrasClave: ["educación", "laboratorios remotos", "innovación"],
    tamano: "0.9 MB",
    afiliado: "Sofía Delgado Ramírez",
  },
];