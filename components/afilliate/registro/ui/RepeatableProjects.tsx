"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { RegistroFormValues } from "@/lib/registro/types";
import { cn } from "@/lib/registro/cn";
import { inputBaseClass, inputErrorClass } from "./styles";

const MAX_PROJECTS = 5;
const currentYear = new Date().getFullYear();

/** Lista repetible (0 a 5) de proyectos relevantes: nombre, descripción, rol y año. */
export default function RepeatableProjects() {
 const {
 control,
 register,
 formState: { errors },
 } = useFormContext<RegistroFormValues>();

 const { fields, append, remove } = useFieldArray({
 control,
 name: "proyectos_relevantes",
 });

 return (
 <div className="space-y-3">
 <div className="flex items-baseline justify-between">
 <div>
 <p className="text-sm font-medium text-slate-700">Proyectos relevantes</p>
 <p className="text-xs text-slate-500">Opcional. Agrega hasta {MAX_PROJECTS} proyectos.</p>
 </div>
 <span className="text-xs tabular-nums text-slate-400">
 {fields.length}/{MAX_PROJECTS}
 </span>
 </div>

 {fields.length === 0 && (
 <p className="rounded-lg border border-dashed border-slate-300 px-4 py-4 text-center text-sm text-slate-400">
 Aún no has agregado proyectos.
 </p>
 )}

 <div className="space-y-4">
 {fields.map((field, index) => {
 const itemErrors = errors.proyectos_relevantes?.[index];
 return (
 <div key={field.id} className="relative space-y-3 rounded-xl border border-slate-200 p-4">
 <button
 type="button"
 onClick={() => remove(index)}
 aria-label="Eliminar proyecto"
 className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
 >
 <Trash2 className="h-4 w-4" />
 </button>

 <div className="grid gap-3 pr-8 sm:grid-cols-[1fr_auto]">
 <div className="space-y-1">
 <label className="text-xs font-medium text-slate-600">Nombre del proyecto</label>
 <input
 {...register(`proyectos_relevantes.${index}.nombre` as const)}
 className={cn(inputBaseClass, itemErrors?.nombre && inputErrorClass)}
 placeholder="Nombre del proyecto"
 />
 {itemErrors?.nombre && (
 <p className="text-xs font-medium text-red-600">{itemErrors.nombre.message}</p>
 )}
 </div>
 <div className="space-y-1 sm:w-32">
 <label className="text-xs font-medium text-slate-600">Año</label>
 <input
 type="number"
 {...register(`proyectos_relevantes.${index}.anio` as const, { valueAsNumber: true })}
 max={currentYear}
 className={cn(inputBaseClass, itemErrors?.anio && inputErrorClass)}
 placeholder={String(currentYear)}
 />
 {itemErrors?.anio && (
 <p className="text-xs font-medium text-red-600">{itemErrors.anio.message}</p>
 )}
 </div>
 </div>

 <div className="space-y-1 pr-8">
 <label className="text-xs font-medium text-slate-600">Rol desempeñado</label>
 <input
 {...register(`proyectos_relevantes.${index}.rol` as const)}
 className={cn(inputBaseClass, itemErrors?.rol && inputErrorClass)}
 placeholder="Ej. Líder técnico, investigador, desarrollador…"
 />
 {itemErrors?.rol && <p className="text-xs font-medium text-red-600">{itemErrors.rol.message}</p>}
 </div>

 <div className="space-y-1 pr-8">
 <label className="text-xs font-medium text-slate-600">Descripción</label>
 <textarea
 rows={3}
 {...register(`proyectos_relevantes.${index}.descripcion` as const)}
 className={cn(inputBaseClass, "resize-y", itemErrors?.descripcion && inputErrorClass)}
 placeholder="Describe brevemente el proyecto y tu participación"
 />
 {itemErrors?.descripcion && (
 <p className="text-xs font-medium text-red-600">{itemErrors.descripcion.message}</p>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {fields.length < MAX_PROJECTS && (
 <button
 type="button"
 onClick={() =>
 append({ nombre: "", descripcion: "", rol: "", anio: currentYear })
 }
 className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-[#004B87] transition hover:border-[#004B87] hover:bg-[#004B87]/5"
 >
 <Plus className="h-4 w-4" />
 Agregar proyecto
 </button>
 )}
 </div>
 );
}
