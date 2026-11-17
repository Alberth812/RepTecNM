"use client";

// @/components/afiliado/actualizacion-profesional-form.tsx
// Sección 6 · ACTUALIZACIÓN PROFESIONAL
// - Carga la respuesta vigente con GET (o muestra el formulario vacío si no hay).
// - Guarda con PUT: cada envío reemplaza por completo al anterior.
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
 type Control,
 type DefaultValues,
 type Path,
 type Resolver,
 useFieldArray,
 useForm,
 useWatch,
} from "react-hook-form";
import {
 Campo,
 CampoChecks,
 CampoMes,
 CampoNumero,
 CampoSiNo,
 CampoTexto,
} from "./campos-formulario";
import { Button } from "@/components/ui/button";
import {
 ANIO_MINIMO_CARGO,
 DISPONIBILIDAD_ACTUALIZACION,
 DISPONIBILIDAD_ACTUALIZACION_LABELS,
 DISPONIBILIDAD_EXCLUSIVA,
 MAX_ITEMS_REPETIBLE,
} from "@/lib/validation/actualizacion-profesional/actualizacion-constants";
import { cn } from "@/lib/utils";
import {
 type ActualizacionProfesionalInput as Valores,
 actualizacionProfesionalSchema,
} from "@/lib/validation/actualizacion-profesional/actualizacion-profesional";

const API_URL = "/api/afiliados/actualizacion-profesional";

type Respuesta = { data: Valores | null; updatedAt: string | null };
type Aviso = { tipo: "ok" | "error"; texto: string };
type Cargo = NonNullable<Valores["detalleCargoPublico"]>[number];

const OPCIONES_DISPONIBILIDAD = DISPONIBILIDAD_ACTUALIZACION.map((value) => ({
 value,
 label: DISPONIBILIDAD_ACTUALIZACION_LABELS[value],
}));

/* -------------------------------------------------------------------------- */
/* Valores iniciales y normalización */
/* -------------------------------------------------------------------------- */

/** Formulario vacío: los Sí/No arrancan sin responder (undefined). */
const VALORES_VACIOS: DefaultValues<Valores> = {
 haTomadoActualizacion: undefined,
 actividadesActualizacion: [],
 actualizacionDeseada: "",
 disponibilidadActualizacion: [],
 horarioActualizacion: "",
 creacionEmpresa: undefined,
 nombreEmpresa: "",
 puesto5Anios: "",
 haOcupadoCargoEleccionPopular: undefined,
 detalleCargoPublico: [],
};

const actividadVacia = () => ({ tematica: "", institucion: "" });

// Un cargo nuevo empieza sin año/mes (undefined); TS exige number, de ahí el cast.
const cargoVacio = (): Cargo => ({
 puesto: "",
 lugar: "",
 esCargoActual: false,
 anioInicio: undefined as unknown as number,
 mesInicio: undefined as unknown as number,
 anioTermino: undefined,
 mesTermino: undefined,
});

/** Datos del servidor (con null) → valores de formulario (sin null en inputs). */
const aValoresFormulario = (d: Valores): DefaultValues<Valores> => ({
 ...d,
 actividadesActualizacion: d.actividadesActualizacion ?? [],
 horarioActualizacion: d.horarioActualizacion ?? "",
 nombreEmpresa: d.nombreEmpresa ?? "",
 puesto5Anios: d.puesto5Anios ?? "",
 detalleCargoPublico: d.detalleCargoPublico ?? [],
});

const vacioANull = (s: string | null | undefined) =>
 s == null || s.trim() === "" ? null : s;

/**
 * Deja los datos en la forma que exige el esquema (y la BD):
 * - campos condicionales ocultos → null
 * - textos opcionales vacíos ("") → null
 * - cargo actual → sin fecha de término
 * Así los campos ocultos nunca generan errores que el usuario no puede ver.
 */
function normalizar(v: Valores): Valores {
 return {
 ...v,
 actividadesActualizacion: v.haTomadoActualizacion
 ? (v.actividadesActualizacion ?? [])
 : null,
 horarioActualizacion: vacioANull(v.horarioActualizacion),
 nombreEmpresa: v.creacionEmpresa ? vacioANull(v.nombreEmpresa) : null,
 puesto5Anios: vacioANull(v.puesto5Anios),
 detalleCargoPublico: v.haOcupadoCargoEleccionPopular
 ? (v.detalleCargoPublico ?? []).map((c) =>
 c.esCargoActual ? { ...c, anioTermino: null, mesTermino: null } : c,
 )
 : null,
 };
}

// Zod valida siempre sobre los datos normalizados; RHF recibe el resultado ya limpio.
const validar = zodResolver(actualizacionProfesionalSchema);
const resolver: Resolver<Valores> = (values, context, options) =>
 validar(normalizar(values), context, options);

/* -------------------------------------------------------------------------- */
/* Formulario */
/* -------------------------------------------------------------------------- */

export function ActualizacionProfesionalForm() {
 const form = useForm<Valores>({
 resolver,
 defaultValues: VALORES_VACIOS,
 });
 const {
 control,
 handleSubmit,
 reset,
 setError,
 formState: { errors, isSubmitting },
 } = form;

 const [carga, setCarga] = useState<"cargando" | "listo" | "error">(
 "cargando",
 );
 const [errorCarga, setErrorCarga] = useState<string | null>(null);
 const [intento, setIntento] = useState(0);
 const [aviso, setAviso] = useState<Aviso | null>(null);
 const [actualizadoEn, setActualizadoEn] = useState<string | null>(null);

 const actividades = useFieldArray({
 control,
 name: "actividadesActualizacion",
 });
 const cargos = useFieldArray({ control, name: "detalleCargoPublico" });

 const haTomado = useWatch({ control, name: "haTomadoActualizacion" });
 const creoEmpresa = useWatch({ control, name: "creacionEmpresa" });
 const ocupoCargo = useWatch({
 control,
 name: "haOcupadoCargoEleccionPopular",
 });

 /* ---- Cargar la respuesta actual (o dejar el formulario vacío) ---- */
 useEffect(() => {
 const ac = new AbortController();
 setCarga("cargando");
 (async () => {
 try {
 const res = await fetch(API_URL, {
 signal: ac.signal,
 cache: "no-store",
 });
 if (!res.ok) {
 const cuerpo = await res.json().catch(() => null);
 throw new Error(
 cuerpo?.message ?? "No se pudo cargar tu información.",
 );
 }
 const { data, updatedAt } = (await res.json()) as Respuesta;
 if (data) reset(aValoresFormulario(data));
 setActualizadoEn(updatedAt);
 setCarga("listo");
 } catch (e) {
 if (ac.signal.aborted) return;
 setErrorCarga(
 e instanceof Error ? e.message : "No se pudo cargar tu información.",
 );
 setCarga("error");
 }
 })();
 return () => ac.abort();
 }, [reset, intento]);

 /* ---- Guardar (PUT reemplaza la respuesta anterior) ---- */
 const onSubmit = handleSubmit(async (datos) => {
 setAviso(null);
 try {
 const res = await fetch(API_URL, {
 method: "PUT",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(datos),
 });
 const cuerpo = await res.json().catch(() => null);

 if (!res.ok) {
 if (res.status === 422 && Array.isArray(cuerpo?.errors)) {
 for (const e of cuerpo.errors as {
 path: string;
 message: string;
 }[]) {
 setError(e.path as Path<Valores>, {
 type: "server",
 message: e.message,
 });
 }
 }
 setAviso({
 tipo: "error",
 texto: cuerpo?.message ?? "No se pudo guardar. Intenta de nuevo.",
 });
 return;
 }

 reset(aValoresFormulario((cuerpo as Respuesta).data as Valores));
 setActualizadoEn((cuerpo as Respuesta).updatedAt);
 setAviso({
 tipo: "ok",
 texto: "Tu información se guardó correctamente.",
 });
 } catch {
 setAviso({
 tipo: "error",
 texto:
 "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
 });
 }
 });

 /* ---- Estados de carga ---- */
 if (carga === "cargando") {
 return (
 <div className="space-y-4" role="status" aria-label="Cargando formulario">
 {[0, 1, 2, 3].map((i) => (
 <div key={i} className="bg-muted h-16 animate-pulse rounded-md" />
 ))}
 </div>
 );
 }
 if (carga === "error") {
 return (
 <div
 role="alert"
 className="border-destructive/40 bg-destructive/10 space-y-3 rounded-md border p-4"
 >
 <p className="text-destructive text-sm">{errorCarga}</p>
 <Button
 type="button"
 variant="outline"
 onClick={() => setIntento((n) => n + 1)}
 >
 Reintentar
 </Button>
 </div>
 );
 }

 const errorActividades =
 errors.actividadesActualizacion?.root?.message ??
 errors.actividadesActualizacion?.message;
 const errorCargos =
 errors.detalleCargoPublico?.root?.message ??
 errors.detalleCargoPublico?.message;

 return (
 <form onSubmit={onSubmit} noValidate className="space-y-10">
 {/* ------------------------- Cursos de actualización ------------------------- */}
 <section className="space-y-6">
 <CampoSiNo
 control={control}
 name="haTomadoActualizacion"
 label="Desde la terminación de su posgrado, ¿Ha tomado cursos de actualización?"
 required
 onCambio={(si) => {
 // min_items = 1: al contestar "Sí" se ofrece la primera fila.
 if (si && actividades.fields.length === 0) {
 actividades.append(actividadVacia());
 }
 }}
 />

 {haTomado === true && (
 <Campo
 id="actividades"
 grupo
 required
 label="Especifique los diplomados, cursos, seminarios, talleres, etc., que haya tomado"
 error={errorActividades}
 >
 <div className="space-y-3">
 {actividades.fields.map((campo, i) => (
 <div key={campo.id} className="space-y-4 rounded-lg border p-4">
 <div className="flex items-center justify-between">
 <p className="text-sm font-medium">Actividad {i + 1}</p>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => actividades.remove(i)}
 aria-label={`Eliminar actividad ${i + 1}`}
 >
 <Trash2 className="size-4" /> Eliminar
 </Button>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 <CampoTexto
 control={control}
 name={`actividadesActualizacion.${i}.tematica`}
 label="Temática"
 required
 maxLength={200}
 />
 <CampoTexto
 control={control}
 name={`actividadesActualizacion.${i}.institucion`}
 label="Institución"
 required
 maxLength={200}
 />
 </div>
 </div>
 ))}
 <Button
 type="button"
 variant="outline"
 onClick={() => actividades.append(actividadVacia())}
 disabled={actividades.fields.length >= MAX_ITEMS_REPETIBLE}
 >
 <Plus className="size-4" /> Agregar actividad
 </Button>
 </div>
 </Campo>
 )}

 <CampoTexto
 control={control}
 name="actualizacionDeseada"
 label="Indique las temáticas de las actividades de actualización que le gustaría que su institución impartiera"
 required
 multiline
 maxLength={1000}
 />

 <CampoChecks
 control={control}
 name="disponibilidadActualizacion"
 label="¿Cuál es el tiempo que dispone para el desarrollo de las actividades de actualización profesional?"
 required
 opciones={OPCIONES_DISPONIBILIDAD}
 exclusiva={DISPONIBILIDAD_EXCLUSIVA}
 />

 <CampoTexto
 control={control}
 name="horarioActualizacion"
 label="Horario"
 description="Por ejemplo: 18:00 a 20:00 hrs"
 maxLength={100}
 />
 </section>

 {/* ------------------------------ Emprendimiento ------------------------------ */}
 <section className="space-y-6">
 <CampoSiNo
 control={control}
 name="creacionEmpresa"
 label="¿En los tres años siguientes a su egreso, participó en la creación de alguna empresa?"
 required
 />
 {creoEmpresa === true && (
 <CampoTexto
 control={control}
 name="nombreEmpresa"
 label="Especifique el nombre de la empresa"
 required
 maxLength={200}
 />
 )}

 <CampoTexto
 control={control}
 name="puesto5Anios"
 label="A los 5 años de su egreso, ¿Qué puesto desempeñaba en su lugar de trabajo? (Principal actividad)"
 multiline
 rows={3}
 maxLength={500}
 />
 </section>

 {/* --------------------------- Cargos de elección popular --------------------------- */}
 <section className="space-y-6">
 <CampoSiNo
 control={control}
 name="haOcupadoCargoEleccionPopular"
 label="¿Ha ocupado u ocupa algún cargo de elección popular?"
 required
 onCambio={(si) => {
 if (si && cargos.fields.length === 0) cargos.append(cargoVacio());
 }}
 />

 {ocupoCargo === true && (
 <Campo
 id="cargos"
 grupo
 required
 label="Mencione el puesto, el lugar y el periodo"
 error={errorCargos}
 >
 <div className="space-y-3">
 {cargos.fields.map((campo, i) => (
 <CargoItem
 key={campo.id}
 control={control}
 index={i}
 onEliminar={() => cargos.remove(i)}
 />
 ))}
 <Button
 type="button"
 variant="outline"
 onClick={() => cargos.append(cargoVacio())}
 disabled={cargos.fields.length >= MAX_ITEMS_REPETIBLE}
 >
 <Plus className="size-4" /> Agregar cargo
 </Button>
 </div>
 </Campo>
 )}
 </section>

 {/* ------------------------------------ Envío ------------------------------------ */}
 <div className="space-y-4 border-t pt-6">
 {aviso && (
 <div
 role={aviso.tipo === "error" ? "alert" : "status"}
 className={cn(
 "rounded-md border px-4 py-3 text-sm",
 aviso.tipo === "ok"
 ? "border-green-600/30 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
 : "border-destructive/40 bg-destructive/10 text-destructive",
 )}
 >
 {aviso.texto}
 </div>
 )}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <p className="text-muted-foreground text-sm">
 {actualizadoEn
 ? `Última actualización: ${new Date(actualizadoEn).toLocaleString(
 "es-MX",
 {
 dateStyle: "long",
 timeStyle: "short",
 },
 )}. Al guardar, reemplazarás tu respuesta anterior.`
 : "Aún no has registrado esta sección."}
 </p>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting && <Loader2 className="size-4 animate-spin" />}
 {isSubmitting ? "Guardando…" : "Guardar"}
 </Button>
 </div>
 </div>
 </form>
 );
}

/* -------------------------------------------------------------------------- */
/* Un cargo de elección popular */
/* -------------------------------------------------------------------------- */

function CargoItem({
 control,
 index,
 onEliminar,
}: {
 control: Control<Valores>;
 index: number;
 onEliminar: () => void;
}) {
 const base = `detalleCargoPublico.${index}` as const;
 const esActual = useWatch({ control, name: `${base}.esCargoActual` });
 const anioMax = new Date().getFullYear() - 1; // max_value: current_year - 1

 return (
 <div className="space-y-4 rounded-lg border p-4">
 <div className="flex items-center justify-between">
 <p className="text-sm font-medium">Cargo {index + 1}</p>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={onEliminar}
 aria-label={`Eliminar cargo ${index + 1}`}
 >
 <Trash2 className="size-4" /> Eliminar
 </Button>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <CampoTexto
 control={control}
 name={`${base}.puesto`}
 label="Puesto"
 required
 maxLength={200}
 />
 <CampoTexto
 control={control}
 name={`${base}.lugar`}
 label="Lugar"
 required
 maxLength={200}
 />
 </div>

 <CampoSiNo
 control={control}
 name={`${base}.esCargoActual`}
 label="¿Es su cargo actual?"
 required
 />

 <div className="grid gap-4 sm:grid-cols-2">
 <CampoNumero
 control={control}
 name={`${base}.anioInicio`}
 label="Año de inicio"
 required
 min={ANIO_MINIMO_CARGO}
 max={anioMax}
 />
 <CampoMes
 control={control}
 name={`${base}.mesInicio`}
 label="Mes de inicio"
 required
 />
 {/* Con cargo actual, la fecha de término se oculta y se envía como null. */}
 {esActual === false && (
 <>
 <CampoNumero
 control={control}
 name={`${base}.anioTermino`}
 label="Año de término"
 required
 min={ANIO_MINIMO_CARGO}
 max={anioMax}
 />
 <CampoMes
 control={control}
 name={`${base}.mesTermino`}
 label="Mes de término"
 required
 />
 </>
 )}
 </div>
 </div>
 );
}
