export type Mensaje = {
  id: string;
  para: { rol: "admin" | "afiliado"; nombre: string };
  de: { nombre: string; correo: string; telefono: string };
  asunto: string;
  cuerpo: string;
  fecha: string;
  leido: boolean;
};

const CLAVE = "rep-mensajes";

const SEMILLA: Mensaje[] = [
  {
    id: "MSG-SEM-1",
    para: { rol: "afiliado", nombre: "María Fernanda López Herrera" },
    de: { nombre: "Ing. Laura Vega Duarte", correo: "laura.vega@empresa.mx", telefono: "55 4433 2211" },
    asunto: "Invitación a congreso de IoT",
    cuerpo:
      "Estimada María Fernanda: leí su artículo sobre redes de sensores y me gustaría invitarla a presentar una ponencia en nuestro congreso nacional de IoT industrial. ¿Podría confirmarme su disponibilidad por este medio o al teléfono indicado?",
    fecha: "2026-08-20T10:30:00.000Z",
    leido: false,
  },
  {
    id: "MSG-SEM-2",
    para: { rol: "admin", nombre: "Administración RepTecNM" },
    de: { nombre: "Mtro. Daniel Ríos", correo: "d.rios@itqueretaro.edu.mx", telefono: "44 2233 4455" },
    asunto: "Duda sobre proceso de afiliación",
    cuerpo:
      "Buen día: varios egresados de nuestro instituto tenemos dudas sobre los requisitos de afiliación para egresados de posgrado. ¿Podrían orientarnos o agendar una sesión informativa virtual?",
    fecha: "2026-08-21T15:10:00.000Z",
    leido: false,
  },
  {
    id: "MSG-SEM-3",
    para: { rol: "admin", nombre: "Administración RepTecNM" },
    de: { nombre: "Lic. Sandra Molina", correo: "sandra.molina@ong.org", telefono: "33 1122 3344" },
    asunto: "Convenio de colaboración",
    cuerpo:
      "Represento a una organización de becas de posgrado y nos interesa explorar un convenio con la red. Quedo atenta a su respuesta por correo o teléfono para ampliarles la propuesta.",
    fecha: "2026-08-22T09:00:00.000Z",
    leido: false,
  },
];

export function cargarMensajes(): Mensaje[] {
  if (typeof window === "undefined") return SEMILLA;
  const g = localStorage.getItem(CLAVE);
  if (g) return JSON.parse(g) as Mensaje[];
  localStorage.setItem(CLAVE, JSON.stringify(SEMILLA));
  return SEMILLA;
}

export function guardarMensajes(lista: Mensaje[]) {
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

export function enviarMensaje(m: Omit<Mensaje, "id" | "fecha" | "leido">) {
  const todos = cargarMensajes();
  todos.unshift({ ...m, id: `MSG-${Date.now()}`, fecha: new Date().toISOString(), leido: false });
  guardarMensajes(todos);
}

export function marcarLeido(id: string) {
  guardarMensajes(cargarMensajes().map((m) => (m.id === id ? { ...m, leido: true } : m)));
}
