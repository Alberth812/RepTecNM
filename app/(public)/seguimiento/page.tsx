"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarClock, Save } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const SECCIONES = [
  "Aspectos demográficos", "Datos académicos", "Información laboral", "Investigación",
  "Evaluación del programa", "Actualización profesional", "Comentarios y sugerencias",
];

const ENTIDADES = ["Guanajuato", "Yucatán", "Baja California", "Nuevo León", "Oaxaca", "Ciudad de México", "Otro"];
const ESTADO_CIVIL = ["Soltero(a)", "Casado(a)", "Divorciado(a)", "Viudo(a)", "Unión libre"];
const SITUACION_LABORAL = ["Empleado", "Independiente", "Desempleado", "Estudiando", "Jubilado"];
const TIPO_ACTIVIDAD = ["Académica", "Empresarial", "Gubernamental", "Independiente", "Otra"];
const TIPO_CONTRATACION = ["Planta", "Contrato temporal", "Por honorarios", "Por proyecto", "Otro"];
const SECTOR = ["Educación", "Industria", "Gobierno", "Servicios", "Investigación", "Otro"];
const TIEMPO_EMPLEO = ["Antes de egresar", "0 a 3 meses", "3 a 6 meses", "6 a 12 meses", "Más de 12 meses", "No aplica"];
const SI_NO = ["Sí", "No"];

interface Resp {
  entidad: string; estadoCivil: string;
  obtuvoGrado: string; anioGrado: string; becado: string;
  situacionLaboral: string; tipoActividad: string; tipoContratacion: string; sector: string; tiempoEmpleo: string;
  investiga: string; publicaciones: string; sni: string;
  satisfaccion: number; correspondencia: number; docentes: number; calidad: number; infraestructura: number;
  cursos: string; numCursos: string;
  comentarios: string;
}

const RESP_INICIAL: Resp = {
  entidad: "", estadoCivil: "",
  obtuvoGrado: "", anioGrado: "", becado: "",
  situacionLaboral: "", tipoActividad: "", tipoContratacion: "", sector: "", tiempoEmpleo: "",
  investiga: "", publicaciones: "", sni: "",
  satisfaccion: 0, correspondencia: 0, docentes: 0, calidad: 0, infraestructura: 0,
  cursos: "", numCursos: "",
  comentarios: "",
};

const ANIO_ACTUAL = new Date().getFullYear();

function soloDigitos(v: string, n: number) {
  return v.replace(/\D/g, "").slice(0, n);
}

function Pregunta({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{etiqueta}</span>
      {children}
    </div>
  );
}

function Escala({ valor, onChange }: { valor: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
            valor === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {n}
        </button>
      ))}
      <span className="ml-2 self-center text-xs text-muted-foreground">1 = muy en desacuerdo · 5 = muy de acuerdo</span>
    </div>
  );
}

function Selector({ valor, onValue, placeholder, opciones }: {
  valor: string; onValue: (v: string) => void; placeholder: string; opciones: string[];
}) {
  return (
    <Select value={valor || undefined} onValueChange={(v) => { if (v) onValue(v); }}>
      <SelectTrigger className="bg-background"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {opciones.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export default function SeguimientoPage() {
  const [resp, setResp] = useState<Resp>(() => {
    if (typeof window === "undefined") return RESP_INICIAL;
    try {
      const g = localStorage.getItem("rep-seguimiento");
      return g ? { ...RESP_INICIAL, ...JSON.parse(g) } : RESP_INICIAL;
    } catch {
      return RESP_INICIAL;
    }
  });
  const [seccion, setSeccion] = useState(0);
  const [ultima, setUltima] = useState<string>(() => {
    if (typeof window === "undefined") return "2025-05-10";
    try { return localStorage.getItem("rep-seguimiento-fecha") ?? "2025-05-10"; } catch { return "2025-05-10"; }
  });
  const [enviado, setEnviado] = useState(false);

  const meses = (() => {
    const d = new Date(ultima);
    const a = new Date();
    return (a.getFullYear() - d.getFullYear()) * 12 + (a.getMonth() - d.getMonth());
  })();
  const alDia = meses < 12;

  const actualizar = (c: Partial<Resp>) => setResp((p) => ({ ...p, ...c }));

  const cambiarSeccion = (n: number) => {
    try { localStorage.setItem("rep-seguimiento", JSON.stringify(resp)); } catch {}
    setSeccion(n);
    toast.info("Avance guardado automáticamente (RF-SEG-002).");
  };

  const enviar = () => {
    const faltantes: string[] = [];
    if (!resp.entidad) faltantes.push("entidad de residencia");
    if (!resp.situacionLaboral) faltantes.push("situación laboral");
    if (!resp.tipoActividad) faltantes.push("tipo de actividad");
    if (!resp.tiempoEmpleo) faltantes.push("tiempo al primer empleo");
    if (!resp.obtuvoGrado) faltantes.push("obtención del grado");
    if ([resp.satisfaccion, resp.correspondencia, resp.docentes, resp.calidad, resp.infraestructura].some((v) => v === 0)) {
      faltantes.push("escalas de evaluación del programa");
    }
    if (faltantes.length > 0) {
      toast.error(`Falta responder: ${faltantes.join(", ")}.`);
      return;
    }
    const hoy = new Date().toISOString().slice(0, 10);
    try { localStorage.setItem("rep-seguimiento", JSON.stringify(resp)); } catch {}
    try { localStorage.setItem("rep-seguimiento-fecha", hoy); } catch {}
    setUltima(hoy);
    setEnviado(true);
    toast.success("Cuestionario actualizado. Tu afiliación se mantiene al día (RF-SEG-006).");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cuestionario de Seguimiento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Última actualización: {ultima} · La versión anterior se sobrescribe al enviar (RF-SEG-003).
          </p>
        </div>
        {alDia ? (
          <Badge className="bg-green-600 text-white">Al día</Badge>
        ) : (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">Desactualizado</Badge>
        )}
      </div>

      {!alDia && !enviado && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Tu formulario lleva más de 12 meses sin actualizarse. Responde el cuestionario
            para mantener tu afiliación en estado ACTIVO (RF-MEMB-005 y RF-SEG-004).
          </p>
        </div>
      )}

      {enviado ? (
        <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
          <BadgeCheck className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-4 text-xl font-bold tracking-tight">Cuestionario actualizado</h2>
          <div className="mt-3">
            <Badge className="bg-green-600 text-white">Al día</Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Gracias por mantener tu información al día. Recuerda que podrás actualizarla
            en cualquier momento mientras tu estado sea ACTIVO o INACTIVO.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setEnviado(false)}>
            Volver a editar
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2">
            {SECCIONES.map((s, i) => (
              <button
                key={s}
                onClick={() => cambiarSeccion(i)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === seccion ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl p-6 md:p-8">
            {seccion === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Pregunta etiqueta="Estado de residencia">
                  <Selector valor={resp.entidad} onValue={(v) => actualizar({ entidad: v })} placeholder="Selecciona" opciones={ENTIDADES} />
                </Pregunta>
                <Pregunta etiqueta="Estado civil">
                  <Selector valor={resp.estadoCivil} onValue={(v) => actualizar({ estadoCivil: v })} placeholder="Selecciona" opciones={ESTADO_CIVIL} />
                </Pregunta>
              </div>
            )}

            {seccion === 1 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Pregunta etiqueta="¿Obtuviste el grado?">
                  <Selector valor={resp.obtuvoGrado} onValue={(v) => actualizar({ obtuvoGrado: v })} placeholder="Selecciona" opciones={SI_NO} />
                </Pregunta>
                <Pregunta etiqueta="Año de obtención">
                  <Input
                    inputMode="numeric"
                    className="bg-background"
                    value={resp.anioGrado}
                    onChange={(e) => actualizar({ anioGrado: soloDigitos(e.target.value, 4) })}
                    placeholder={`Hasta ${ANIO_ACTUAL}`}
                  />
                </Pregunta>
                <Pregunta etiqueta="¿Fuiste becado(a)?">
                  <Selector valor={resp.becado} onValue={(v) => actualizar({ becado: v })} placeholder="Selecciona" opciones={SI_NO} />
                </Pregunta>
              </div>
            )}

            {seccion === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Pregunta etiqueta="Situación laboral actual">
                  <Selector valor={resp.situacionLaboral} onValue={(v) => actualizar({ situacionLaboral: v })} placeholder="Selecciona" opciones={SITUACION_LABORAL} />
                </Pregunta>
                <Pregunta etiqueta="Tipo de actividad profesional">
                  <Selector valor={resp.tipoActividad} onValue={(v) => actualizar({ tipoActividad: v })} placeholder="Selecciona" opciones={TIPO_ACTIVIDAD} />
                </Pregunta>
                <Pregunta etiqueta="Tipo de contratación">
                  <Selector valor={resp.tipoContratacion} onValue={(v) => actualizar({ tipoContratacion: v })} placeholder="Selecciona" opciones={TIPO_CONTRATACION} />
                </Pregunta>
                <Pregunta etiqueta="Sector económico primario">
                  <Selector valor={resp.sector} onValue={(v) => actualizar({ sector: v })} placeholder="Selecciona" opciones={SECTOR} />
                </Pregunta>
                <Pregunta etiqueta="Tiempo para conseguir el primer empleo tras el egreso">
                  <Selector valor={resp.tiempoEmpleo} onValue={(v) => actualizar({ tiempoEmpleo: v })} placeholder="Selecciona" opciones={TIEMPO_EMPLEO} />
                </Pregunta>
              </div>
            )}

            {seccion === 3 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Pregunta etiqueta="¿Participas en actividades de investigación?">
                  <Selector valor={resp.investiga} onValue={(v) => actualizar({ investiga: v })} placeholder="Selecciona" opciones={SI_NO} />
                </Pregunta>
                <Pregunta etiqueta="Publicaciones desde el egreso">
                  <Input
                    inputMode="numeric"
                    className="bg-background"
                    value={resp.publicaciones}
                    onChange={(e) => actualizar({ publicaciones: soloDigitos(e.target.value, 3) })}
                    placeholder="0"
                  />
                </Pregunta>
                <Pregunta etiqueta="¿Perteneces al SNI?">
                  <Selector valor={resp.sni} onValue={(v) => actualizar({ sni: v })} placeholder="Selecciona" opciones={SI_NO} />
                </Pregunta>
              </div>
            )}

            {seccion === 4 && (
              <div className="grid gap-5">
                <Pregunta etiqueta="Nivel de satisfacción con el programa de posgrado">
                  <Escala valor={resp.satisfaccion} onChange={(n) => actualizar({ satisfaccion: n })} />
                </Pregunta>
                <Pregunta etiqueta="Correspondencia entre la formación y tu campo laboral">
                  <Escala valor={resp.correspondencia} onChange={(n) => actualizar({ correspondencia: n })} />
                </Pregunta>
                <Pregunta etiqueta="Valoración del desempeño docente">
                  <Escala valor={resp.docentes} onChange={(n) => actualizar({ docentes: n })} />
                </Pregunta>
                <Pregunta etiqueta="Valoración de la calidad del programa">
                  <Escala valor={resp.calidad} onChange={(n) => actualizar({ calidad: n })} />
                </Pregunta>
                <Pregunta etiqueta="Valoración de la infraestructura académica">
                  <Escala valor={resp.infraestructura} onChange={(n) => actualizar({ infraestructura: n })} />
                </Pregunta>
              </div>
            )}

            {seccion === 5 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Pregunta etiqueta="¿Cursos de actualización en los últimos 12 meses?">
                  <Selector valor={resp.cursos} onValue={(v) => actualizar({ cursos: v })} placeholder="Selecciona" opciones={SI_NO} />
                </Pregunta>
                <Pregunta etiqueta="Número de cursos">
                  <Input
                    inputMode="numeric"
                    className="bg-background"
                    value={resp.numCursos}
                    onChange={(e) => actualizar({ numCursos: soloDigitos(e.target.value, 3) })}
                    placeholder="0"
                  />
                </Pregunta>
              </div>
            )}

            {seccion === 6 && (
              <Pregunta etiqueta="Comentarios y sugerencias para el programa">
                <Textarea rows={5} value={resp.comentarios} onChange={(e) => actualizar({ comentarios: e.target.value })} placeholder="Tu opinión nos ayuda a mejorar..." />
              </Pregunta>
            )}

            <div className="mt-8 flex items-center justify-between border-t pt-4">
              <Button variant="outline" disabled={seccion === 0} onClick={() => cambiarSeccion(seccion - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
              <Button variant="ghost" onClick={() => { try { localStorage.setItem("rep-seguimiento", JSON.stringify(resp)); } catch {} toast.success("Avance guardado."); }}>
                <Save className="mr-2 h-4 w-4" /> Guardar avance
              </Button>
              {seccion < SECCIONES.length - 1 ? (
                <Button onClick={() => cambiarSeccion(seccion + 1)}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={enviar}>Enviar cuestionario</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
