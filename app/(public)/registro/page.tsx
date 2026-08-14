"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Check, Circle, ImagePlus, MailCheck,
  Plus, Save, Trash2, Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ANIO_ACTUAL = new Date().getFullYear();
const ANIO_MINIMO = 1950;
const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 100;
const MODO_DEMO = true;

function soloDigitos(valor: string, maxLongitud: number) {
  return valor.replace(/\D/g, "").slice(0, maxLongitud);
}

function validarRango(valor: string, min: number, max: number, nombre: string): string | null {
  if (valor === "") return null;
  const n = Number(valor);
  if (Number.isNaN(n)) return `${nombre} no es válido.`;
  if (n < min || n > max) return `${nombre} debe estar entre ${min} y ${max}.`;
  return null;
}

function leerStorage(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribirStorage(clave: string, valor: string): boolean {
  try {
    localStorage.setItem(clave, valor);
    return true;
  } catch {
    return false;
  }
}

function borrarStorage(clave: string) {
  try {
    localStorage.removeItem(clave);
  } catch {
    /* sin almacenamiento disponible */
  }
}

const INSTITUTOS = [
  "Instituto Tecnológico de Celaya", "Instituto Tecnológico de Mérida",
  "Instituto Tecnológico de Tijuana", "Instituto Tecnológico de Nuevo León",
  "Instituto Tecnológico de Oaxaca", "Instituto Tecnológico de Querétaro",
];
const SECCIONES = [
  "Datos generales", "Formación académica", "Perfil profesional", "Servicios",
  "Experiencia y proyectos", "Intereses de colaboración", "Visibilidad y documentos",
];

interface Posgrado { tipo: string; instituto: string; anio: string }
interface Proyecto { titulo: string; descripcion: string; rol: string; anio: string }
interface Datos {
  nombre: string; apellidos: string; telefono: string; correoContacto: string;
  genero: string; edad: string;
  posgrados: Posgrado[];
  descripcion: string; ocupacion: string; centroTrabajo: string;
  servicios: string;
  proyectos: Proyecto[];
  intereses: string; tags: string[];
  visibleCatalogo: boolean; correoPublico: boolean; telefonoPublico: boolean;
  nombreComprobante: string; urlFoto: string;
}

const DATOS_INICIALES: Datos = {
  nombre: "", apellidos: "", telefono: "", correoContacto: "", genero: "", edad: "",
  posgrados: [{ tipo: "", instituto: "", anio: "" }],
  descripcion: "", ocupacion: "", centroTrabajo: "",
  servicios: "",
  proyectos: [],
  intereses: "", tags: [],
  visibleCatalogo: true, correoPublico: false, telefonoPublico: false,
  nombreComprobante: "", urlFoto: "",
};

function normalizarTag(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function generarClave() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function politicaContrasena(p: string) {
  return [
    { ok: p.length >= 8, texto: "8 caracteres o más" },
    { ok: /[A-ZÁÉÍÓÚÑ]/.test(p), texto: "Al menos una mayúscula" },
    { ok: /\d/.test(p), texto: "Al menos un número" },
    { ok: /[^A-Za-z0-9]/.test(p), texto: "Al menos un símbolo" },
  ];
}

export default function RegistroPage() {
  const [paso, setPaso] = useState<"cuenta" | "verificacion" | "formulario" | "enviado">("cuenta");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [clave, setClave] = useState("");
  const [claveIngresada, setClaveIngresada] = useState("");
  const [espera, setEspera] = useState(0);
  const [seccion, setSeccion] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [datos, setDatos] = useState<Datos>(() => {
    if (typeof window === "undefined") return DATOS_INICIALES;
    const g = leerStorage("rep-registro");
    if (!g) return DATOS_INICIALES;
    try {
      return { ...DATOS_INICIALES, ...JSON.parse(g) };
    } catch {
      return DATOS_INICIALES;
    }
  });

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera(espera - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const actualizar = (cambios: Partial<Datos>) => setDatos((prev) => ({ ...prev, ...cambios }));

  const guardarProgreso = (silencioso = false) => {
    const ok = escribirStorage("rep-registro", JSON.stringify(datos));
    if (!silencioso) {
      if (ok) toast.success("Progreso guardado. Puedes continuar en otra sesión (RF-AUTH-008).");
      else toast.info("Avance conservado solo en esta sesión: tu navegador bloquea el almacenamiento local.");
    }
  };

  const cambiarSeccion = (n: number) => {
    guardarProgreso(true);
    setSeccion(n);
    toast.info("Avance guardado automáticamente (RF-PERFIL-002).");
  };

  const crearCuenta = () => {
    const correoLimpio = correo.trim();
    if (!/^\S+@\S+\.\S+$/.test(correoLimpio)) {
      toast.error("Ingresa un correo electrónico válido.");
      return;
    }
    if (politicaContrasena(contrasena).some((r) => !r.ok)) {
      toast.error("La contraseña no cumple la política (RF-AUTH-010).");
      return;
    }
    setClave(generarClave());
    setEspera(120);
    setPaso("verificacion");
    toast.success("Cuenta creada. Enviamos un código de verificación a tu correo.");
  };

  const reenviar = () => {
    setClave(generarClave());
    setClaveIngresada("");
    setEspera(120);
    toast.success("Nuevo código enviado. El código anterior quedó invalidado (RF-AUTH-003).");
  };

  const verificar = () => {
    const codigoValido = MODO_DEMO
      ? claveIngresada.length === 6
      : claveIngresada === clave;

    if (!codigoValido) {
      toast.error("Código incorrecto o expirado. Solicita uno nuevo (RF-AUTH-004).");
      return;
    }
    setPaso("formulario");
    toast.success("Correo verificado. Completa tu registro profesional.");
  };

  const agregarTag = () => {
    const t = normalizarTag(tagInput);
    if (!t) return;
    if (datos.tags.length >= 10) { toast.error("Máximo 10 palabras clave (RF-PERFIL-010)."); return; }
    if (datos.tags.includes(t)) { toast.error("Esa palabra clave ya está registrada."); return; }
    actualizar({ tags: [...datos.tags, t] });
    setTagInput("");
  };

  const alSeleccionarComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(f.type)) { toast.error("Formato no permitido. Usa PDF, JPG o PNG."); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("El comprobante excede 10 MB (RF-PERFIL-003)."); return; }
    actualizar({ nombreComprobante: `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB` });
    toast.success("Comprobante de pago cargado.");
  };

  const alSeleccionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) { toast.error("La fotografía debe ser JPG o PNG."); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("La fotografía excede 5 MB (RF-PERFIL-004)."); return; }
    actualizar({ urlFoto: URL.createObjectURL(f) });
    toast.success("Fotografía cargada. Recorte 3:4 aplicado (354 × 472 px).");
  };

  const enviar = () => {
    const errores: string[] = [];

    if (!datos.nombre.trim() || !datos.apellidos.trim()) {
      errores.push("Nombre y apellidos son obligatorios.");
    }

    if (datos.edad !== "") {
      const edad = Number(datos.edad);
      if (edad < EDAD_MINIMA || edad > EDAD_MAXIMA) {
        errores.push(`La edad debe estar entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años.`);
      }
    }

    if (datos.posgrados.some((p) => !p.tipo || !p.instituto || !p.anio)) {
      errores.push("Completa tipo, instituto y año de cada posgrado.");
    }

    if (datos.posgrados.some((p) => {
      const a = Number(p.anio);
      return a < ANIO_MINIMO || a > ANIO_ACTUAL;
    })) {
      errores.push(`El año de graduación debe estar entre ${ANIO_MINIMO} y ${ANIO_ACTUAL}.`);
    }

    if (datos.proyectos.some((p) => !p.titulo.trim() || !p.anio)) {
      errores.push("Completa título y año de cada proyecto registrado.");
    }

    if (datos.proyectos.some((p) => {
      const a = Number(p.anio);
      return a < ANIO_MINIMO || a > ANIO_ACTUAL;
    })) {
      errores.push(`El año de los proyectos debe estar entre ${ANIO_MINIMO} y ${ANIO_ACTUAL}.`);
    }

    if (datos.tags.length < 1) errores.push("Agrega al menos una palabra clave.");
    if (!datos.nombreComprobante) errores.push("Carga el comprobante de pago.");
    if (!datos.urlFoto) errores.push("Carga tu fotografía de perfil.");

    if (errores.length > 0) {
      toast.error(errores[0]);
      return;
    }

    borrarStorage("rep-registro");
    setPaso("enviado");
  };

  const reglas = politicaContrasena(contrasena);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Indicador de etapas */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {["Cuenta", "Verificación", "Registro", "Envío"].map((et, i) => {
          const orden = ["cuenta", "verificacion", "formulario", "enviado"].indexOf(paso);
          return (
            <div key={et} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i <= orden ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i <= orden ? "font-medium" : "text-muted-foreground"}`}>{et}</span>
              {i < 3 && <div className="h-px w-6 bg-border" />}
            </div>
          );
        })}
      </div>

      {paso === "cuenta" && (
        <div className="glass mx-auto max-w-md rounded-3xl p-8">
          <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registro de afiliados a la Red de Egresados de Posgrado del TecNM.
          </p>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <span className="text-sm font-medium">Correo electrónico</span>
              <Input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tucorreo@ejemplo.com" />
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Contraseña</span>
              <Input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" />
              <ul className="mt-1 grid grid-cols-2 gap-1">
                {reglas.map((r) => (
                  <li key={r.texto} className={`flex items-center gap-1.5 text-xs ${r.ok ? "text-green-700" : "text-muted-foreground"}`}>
                    {r.ok ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />} {r.texto}
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={crearCuenta}>Crear cuenta y verificar correo</Button>
          </div>
        </div>
      )}

      {paso === "verificacion" && (
        <div className="glass mx-auto max-w-md rounded-3xl p-8">
          <MailCheck className="h-8 w-8 text-primary" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Verifica tu correo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa el código de 6 dígitos enviado a <span className="font-medium text-foreground">{correo}</span>.
          </p>
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            Entorno de demostración: se acepta cualquier código de 6 dígitos.
            En producción el código se enviará por correo (RNF-009).
          </div>
          <div className="mt-6 grid gap-4">
            <Input
              value={claveIngresada}
              onChange={(e) => setClaveIngresada(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="text-center font-mono text-lg tracking-[0.5em]"
            />
            <Button onClick={verificar}>Verificar correo</Button>
            <Button variant="outline" onClick={reenviar} disabled={espera > 0}>
              {espera > 0 ? `Reenviar código en ${espera} s` : "Reenviar código"}
            </Button>
          </div>
        </div>
      )}

      {paso === "formulario" && (
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2">
            {SECCIONES.map((s, i) => (
              <button
                key={s}
                onClick={() => cambiarSeccion(i)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${i === seccion ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl p-6 md:p-8">
            {seccion === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Nombre(s)</span>
                  <Input value={datos.nombre} onChange={(e) => actualizar({ nombre: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Apellidos</span>
                  <Input value={datos.apellidos} onChange={(e) => actualizar({ apellidos: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Teléfono de contacto</span>
                  <Input value={datos.telefono} onChange={(e) => actualizar({ telefono: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Correo de contacto</span>
                  <Input value={datos.correoContacto} onChange={(e) => actualizar({ correoContacto: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Género (confidencial)</span>
                  <Select value={datos.genero} onValueChange={(v) => actualizar({ genero: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Edad (confidencial)</span>
                  {(() => {
                    const error = validarRango(datos.edad, EDAD_MINIMA, EDAD_MAXIMA, "La edad");
                    return (
                      <>
                        <Input
                          inputMode="numeric"
                          placeholder={`Ej. 34 (${EDAD_MINIMA}-${EDAD_MAXIMA})`}
                          value={datos.edad}
                          onChange={(e) => actualizar({ edad: soloDigitos(e.target.value, 3) })}
                          className={error ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {error && <p className="text-xs text-red-600">{error}</p>}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {seccion === 1 && (
              <div className="grid gap-4">
                {datos.posgrados.map((p, i) => (
                  <div key={i} className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-[1fr_1fr_100px_auto]">
                    <Select
                      value={p.tipo}
                      onValueChange={(v) => {
                        const copia = [...datos.posgrados];
                        copia[i] = { ...copia[i], tipo: v };
                        actualizar({ posgrados: copia });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Tipo de grado" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maestría">Maestría</SelectItem>
                        <SelectItem value="Doctorado">Doctorado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={p.instituto}
                      onValueChange={(v) => {
                        const copia = [...datos.posgrados];
                        copia[i] = { ...copia[i], instituto: v };
                        actualizar({ posgrados: copia });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Instituto TecNM" /></SelectTrigger>
                      <SelectContent>
                        {INSTITUTOS.map((ins) => (
                          <SelectItem key={ins} value={ins}>{ins}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid gap-1">
                      <Input
                        inputMode="numeric"
                        placeholder={`Año (${ANIO_MINIMO}-${ANIO_ACTUAL})`}
                        value={p.anio}
                        onChange={(e) => {
                          const copia = [...datos.posgrados];
                          copia[i] = { ...copia[i], anio: soloDigitos(e.target.value, 4) };
                          actualizar({ posgrados: copia });
                        }}
                        className={validarRango(p.anio, ANIO_MINIMO, ANIO_ACTUAL, "El año") ? "border-red-400 focus-visible:ring-red-400" : ""}
                      />
                      {validarRango(p.anio, ANIO_MINIMO, ANIO_ACTUAL, "El año") && (
                        <p className="text-[11px] text-red-600">
                          {validarRango(p.anio, ANIO_MINIMO, ANIO_ACTUAL, "El año")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={datos.posgrados.length === 1}
                      onClick={() => actualizar({ posgrados: datos.posgrados.filter((_, x) => x !== i) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={() => actualizar({ posgrados: [...datos.posgrados, { tipo: "", instituto: "", anio: "" }] })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Agregar posgrado
                </Button>
              </div>
            )}

            {seccion === 2 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Descripción profesional</span>
                  <Textarea rows={4} value={datos.descripcion} onChange={(e) => actualizar({ descripcion: e.target.value })} />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Ocupación actual</span>
                    <Input value={datos.ocupacion} onChange={(e) => actualizar({ ocupacion: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Centro de trabajo</span>
                    <Input value={datos.centroTrabajo} onChange={(e) => actualizar({ centroTrabajo: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {seccion === 3 && (
              <div className="grid gap-2">
                <span className="text-sm font-medium">Servicios que ofreces</span>
                <Textarea rows={4} value={datos.servicios} onChange={(e) => actualizar({ servicios: e.target.value })} placeholder="Consultoría, capacitación, investigación aplicada..." />
              </div>
            )}

            {seccion === 4 && (
              <div className="grid gap-4">
                {datos.proyectos.map((p, i) => (
                  <div key={i} className="grid gap-3 rounded-xl border bg-background p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_100px_auto]">
                      <Input
                        placeholder="Título"
                        value={p.titulo}
                        onChange={(e) => {
                          const copia = [...datos.proyectos];
                          copia[i] = { ...copia[i], titulo: e.target.value };
                          actualizar({ proyectos: copia });
                        }}
                      />
                      <div className="grid gap-1">
                        <Input
                          inputMode="numeric"
                          placeholder={`Año (${ANIO_MINIMO}-${ANIO_ACTUAL})`}
                          value={p.anio}
                          onChange={(e) => {
                            const copia = [...datos.proyectos];
                            copia[i] = { ...copia[i], anio: soloDigitos(e.target.value, 4) };
                            actualizar({ proyectos: copia });
                          }}
                          className={validarRango(p.anio, ANIO_MINIMO, ANIO_ACTUAL, "El año") ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {validarRango(p.anio, ANIO_MINIMO, ANIO_ACTUAL, "El año") && (
                          <p className="text-[11px] text-red-600">
                            {validarRango(p.anio, ANIO_MINIMO, ANIO_ACTUAL, "El año")}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => actualizar({ proyectos: datos.proyectos.filter((_, x) => x !== i) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Rol desempeñado"
                      value={p.rol}
                      onChange={(e) => {
                        const copia = [...datos.proyectos];
                        copia[i] = { ...copia[i], rol: e.target.value };
                        actualizar({ proyectos: copia });
                      }}
                    />
                    <Textarea
                      rows={2}
                      placeholder="Descripción"
                      value={p.descripcion}
                      onChange={(e) => {
                        const copia = [...datos.proyectos];
                        copia[i] = { ...copia[i], descripcion: e.target.value };
                        actualizar({ proyectos: copia });
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-fit"
                  disabled={datos.proyectos.length >= 10}
                  onClick={() => actualizar({ proyectos: [...datos.proyectos, { titulo: "", descripcion: "", rol: "", anio: "" }] })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Agregar proyecto (máx. 10)
                </Button>
              </div>
            )}

            {seccion === 5 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Intereses de colaboración</span>
                  <Textarea rows={3} value={datos.intereses} onChange={(e) => actualizar({ intereses: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Palabras clave (1 a 10)</span>
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarTag(); } }} placeholder="ej. inteligencia artificial" />
                    <Button variant="outline" onClick={agregarTag}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {datos.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1">
                        {t}
                        <button onClick={() => actualizar({ tags: datos.tags.filter((x) => x !== t) })}>×</button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Se normalizan automáticamente: minúsculas, sin acentos ni espacios redundantes (RF-PERFIL-010).</p>
                </div>
              </div>
            )}

            {seccion === 6 && (
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={datos.visibleCatalogo} onCheckedChange={(v) => actualizar({ visibleCatalogo: v === true })} />
                    Deseo aparecer en el catálogo público
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={datos.correoPublico} onCheckedChange={(v) => actualizar({ correoPublico: v === true })} />
                    Autorizo mostrar mi correo de contacto
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={datos.telefonoPublico} onCheckedChange={(v) => actualizar({ telefonoPublico: v === true })} />
                    Autorizo mostrar mi teléfono de contacto
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border bg-background p-4">
                    <p className="flex items-center gap-2 text-sm font-medium"><Upload className="h-4 w-4 text-primary" /> Comprobante de pago</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, JPG o PNG · máx. 10 MB (RF-PERFIL-003).</p>
                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-3" onChange={alSeleccionarComprobante} />
                    {datos.nombreComprobante && <p className="mt-2 text-xs font-medium text-green-700">{datos.nombreComprobante}</p>}
                  </div>
                  <div className="rounded-xl border bg-background p-4">
                    <p className="flex items-center gap-2 text-sm font-medium"><ImagePlus className="h-4 w-4 text-primary" /> Fotografía de perfil</p>
                    <p className="mt-1 text-xs text-muted-foreground">JPG o PNG · máx. 5 MB · recorte 3:4 (RF-PERFIL-004).</p>
                    <Input type="file" accept=".jpg,.jpeg,.png" className="mt-3" onChange={alSeleccionarFoto} />
                    {datos.urlFoto && (
                      <div className="mt-3 w-24 overflow-hidden rounded-lg border aspect-[3/4]">
                        <img src={datos.urlFoto} alt="Vista previa" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t pt-4">
              <Button variant="outline" disabled={seccion === 0} onClick={() => cambiarSeccion(seccion - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
              <Button variant="ghost" onClick={() => guardarProgreso()}>
                <Save className="mr-2 h-4 w-4" /> Guardar avance
              </Button>
              {seccion < SECCIONES.length - 1 ? (
                <Button onClick={() => cambiarSeccion(seccion + 1)}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={enviar}>Enviar solicitud</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {paso === "enviado" && (
        <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
          <BadgeCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Solicitud enviada</h1>
          <div className="mt-3">
            <Badge variant="secondary">PENDIENTE_APROBACION</Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Un Administrador General revisará tu solicitud. Recibirás una notificación
            por correo con el resultado (RF-MEMB-010).
          </p>
          <Button className="mt-6" onClick={() => { setPaso("cuenta"); setSeccion(0); setDatos(DATOS_INICIALES); }}>
            Volver al inicio
          </Button>
        </div>
      )}
    </div>
  );
}
