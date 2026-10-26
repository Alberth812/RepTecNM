// components/forms/evaluacion-programa-estudios-form.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useForm,
  type Control,
  type FieldPath,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import {
  valoracionSchema,
  satisfaccionFormacionSchema,
  cumplimientoExpectativasSchema,
} from "@/lib/validation/evaluacion-programa-estudios";
// Import de solo-tipo: se elimina en compilación, no mete Drizzle/pg en el
// bundle del cliente.
import type { evaluacionProgramaEstudios } from "@/lib/db/schema/evaluacion-programa-estudios";

export type EvaluacionProgramaEstudiosRow =
  typeof evaluacionProgramaEstudios.$inferSelect;

// ---------------------------------------------------------------------------
// Catálogos para renderizar las opciones (value/label) en la UI
// ---------------------------------------------------------------------------

const VALORACION_OPTIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "buena", label: "Buena" },
  { value: "regular", label: "Regular" },
  { value: "mala", label: "Mala" },
  { value: "pesima", label: "Pésima" },
] as const;

const SATISFACCION_FORMACION_OPTIONS = [
  { value: "totalmente_satisfecho", label: "Totalmente satisfecho" },
  { value: "muy_satisfecho", label: "Muy satisfecho" },
  { value: "regularmente_satisfecho", label: "Regularmente satisfecho" },
  { value: "poco_satisfecho", label: "Poco satisfecho" },
  { value: "nada_satisfecho", label: "Nada satisfecho" },
] as const;

const CUMPLIMIENTO_EXPECTATIVAS_OPTIONS = [
  { value: "muy_de_acuerdo", label: "Muy de acuerdo" },
  { value: "de_acuerdo", label: "De acuerdo" },
  {
    value: "ni_de_acuerdo_ni_en_desacuerdo",
    label: "Ni de acuerdo ni en desacuerdo",
  },
  { value: "en_desacuerdo", label: "En desacuerdo" },
  { value: "muy_en_desacuerdo", label: "Muy en desacuerdo" },
] as const;

const INFRAESTRUCTURA_ROWS = [
  {
    value: "equipo_computo_conectividad",
    label: "Equipo de cómputo y conectividad",
  },
  {
    value: "programas_informaticos",
    label: "Programas informáticos de apoyo (software)",
  },
  { value: "bases_datos", label: "Bases de datos" },
  { value: "acervo_bibliografico", label: "Acervo bibliográfico" },
  { value: "area_estudios", label: "Área de estudios" },
  { value: "laboratorios", label: "Laboratorios" },
  {
    value: "equipamiento_insumos_laboratorios",
    label: "Equipamiento e insumos de laboratorios",
  },
  {
    value: "apoyo_gestion_administrativa",
    label: "Apoyo y gestión administrativa",
  },
  {
    value: "actividades_extracurriculares",
    label: "Actividades extracurriculares (conferencias, seminarios, etc.)",
  },
] as const;

const SCALE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

// ---------------------------------------------------------------------------
// Zod "de formulario": tipos concretos (sin preprocess) para que RHF infiera
// bien los tipos de cada campo. Reutiliza los enums del schema de servidor.
// La normalización final y las reglas cruzadas se re-validan en el POST con
// `evaluacionProgramaEstudiosSchema` (fuente de verdad).
// ---------------------------------------------------------------------------

const infraestructuraShape = Object.fromEntries(
  INFRAESTRUCTURA_ROWS.map((row) => [
    row.value,
    z.number({ error: "Selecciona un valor" }).int().min(1).max(10),
  ]),
) as Record<(typeof INFRAESTRUCTURA_ROWS)[number]["value"], z.ZodNumber>;

const formSchema = z
  .object({
    nombreTesis: z.string().trim().max(500).optional().or(z.literal("")),

    correspondenciaPlanEstudios: valoracionSchema,
    estrategiasDidacticas: valoracionSchema,
    formasEvaluacion: valoracionSchema,
    bibliografia: valoracionSchema,

    asesoriaTesis: z
      .number({ error: "Selecciona una calificación" })
      .int()
      .min(1)
      .max(10),

    satisfaccionFormacion: satisfaccionFormacionSchema,

    evaluacionInfraestructura: z.object(infraestructuraShape),

    tieneOtroAspectoInfraestructura: z.boolean(),
    otroAspectoInfraestructura: z
      .string()
      .trim()
      .max(300)
      .optional()
      .or(z.literal("")),
    calificacionOtroAspectoInfraestructura: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional(),

    cumplimientoExpectativas: cumplimientoExpectativasSchema,
    calidadPrograma: valoracionSchema,

    areasMejora: z
      .string({ error: "Este campo es obligatorio" })
      .trim()
      .min(10, "Escribe al menos 10 caracteres"),
    mejorasPlanEstudios: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.tieneOtroAspectoInfraestructura) {
      if (
        !data.otroAspectoInfraestructura ||
        data.otroAspectoInfraestructura.trim().length < 3
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["otroAspectoInfraestructura"],
          message: "Especifica el otro aspecto (mínimo 3 caracteres).",
        });
      }
      if (data.calificacionOtroAspectoInfraestructura == null) {
        ctx.addIssue({
          code: "custom",
          path: ["calificacionOtroAspectoInfraestructura"],
          message: "Indica una calificación.",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

const EMPTY_VALUES: Partial<FormValues> = {
  nombreTesis: "",
  tieneOtroAspectoInfraestructura: false,
  otroAspectoInfraestructura: "",
  mejorasPlanEstudios: "",
  areasMejora: "",
};

/** Convierte la fila de BD (con nulls) en defaultValues aptos para RHF. */
function toFormValues(
  data: EvaluacionProgramaEstudiosRow | null,
): Partial<FormValues> {
  if (!data) return EMPTY_VALUES;

  return {
    nombreTesis: data.nombreTesis ?? "",
    correspondenciaPlanEstudios: data.correspondenciaPlanEstudios,
    estrategiasDidacticas: data.estrategiasDidacticas,
    formasEvaluacion: data.formasEvaluacion,
    bibliografia: data.bibliografia,
    asesoriaTesis: data.asesoriaTesis,
    satisfaccionFormacion: data.satisfaccionFormacion,
    evaluacionInfraestructura: data.evaluacionInfraestructura,
    tieneOtroAspectoInfraestructura: data.tieneOtroAspectoInfraestructura,
    otroAspectoInfraestructura: data.otroAspectoInfraestructura ?? "",
    calificacionOtroAspectoInfraestructura:
      data.calificacionOtroAspectoInfraestructura ?? undefined,
    cumplimientoExpectativas: data.cumplimientoExpectativas,
    calidadPrograma: data.calidadPrograma,
    areasMejora: data.areasMejora,
    mejorasPlanEstudios: data.mejorasPlanEstudios ?? "",
  };
}

// ---------------------------------------------------------------------------
// Subcomponentes reutilizables
// ---------------------------------------------------------------------------

function RadioField<TName extends FieldPath<FormValues>>({
  control,
  name,
  label,
  options,
  error,
}: {
  control: Control<FormValues>;
  name: TName;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup
            value={(field.value as string | undefined) ?? undefined}
            onValueChange={field.onChange}
            className="grid gap-2 sm:grid-cols-2"
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                />
                <Label
                  htmlFor={`${name}-${option.value}`}
                  className="font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ValoracionRadioField<TName extends FieldPath<FormValues>>(props: {
  control: Control<FormValues>;
  name: TName;
  label: string;
  error?: string;
}) {
  return <RadioField {...props} options={VALORACION_OPTIONS} />;
}

function ScaleField<TName extends FieldPath<FormValues>>({
  control,
  name,
  label,
  error,
  compact,
}: {
  control: Control<FormValues>;
  name: TName;
  label: string;
  error?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact ? "flex items-center justify-between gap-4" : "space-y-2"
      }
    >
      <Label className={compact ? "font-normal" : undefined}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value != null ? String(field.value) : undefined}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <SelectTrigger className={compact ? "w-20" : "w-full sm:w-40"}>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {SCALE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formulario principal
// ---------------------------------------------------------------------------

interface EvaluacionProgramaEstudiosFormProps {
  /** Datos ya guardados del afiliado, obtenidos en un Server Component. `null` si aún no ha llenado esta sección. */
  initialData: EvaluacionProgramaEstudiosRow | null;
  onSuccess?: () => void;
}

export function EvaluacionProgramaEstudiosForm({
  initialData,
  onSuccess,
}: EvaluacionProgramaEstudiosFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(initialData),
  });

  const tieneOtroAspecto = form.watch("tieneOtroAspectoInfraestructura");

  // Limpia los campos condicionales cuando el afiliado apaga el switch,
  // para no reenviar datos obsoletos si lo vuelve a encender.
  useEffect(() => {
    if (!tieneOtroAspecto) {
      form.setValue("otroAspectoInfraestructura", "");
      form.setValue("calificacionOtroAspectoInfraestructura", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tieneOtroAspecto]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      const res = await fetch("/api/afiliados/evaluacion-programa-estudios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo guardar la evaluación");
      }

      toast.success("Evaluación guardada correctamente");

      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error("Error al guardar", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la evaluación",
      });
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl space-y-8"
    >
      <div className="space-y-2">
        <Label htmlFor="nombreTesis">Nombre de su tesis</Label>
        <Input id="nombreTesis" {...form.register("nombreTesis")} />
        {form.formState.errors.nombreTesis && (
          <p className="text-sm text-destructive">
            {form.formState.errors.nombreTesis.message}
          </p>
        )}
      </div>

      <ValoracionRadioField
        control={form.control}
        name="correspondenciaPlanEstudios"
        label="Valore la correspondencia de los contenidos temáticos del plan de estudios con las exigencias laborales actuales"
        error={form.formState.errors.correspondenciaPlanEstudios?.message}
      />
      <ValoracionRadioField
        control={form.control}
        name="estrategiasDidacticas"
        label="¿Cómo valora las estrategias didácticas utilizadas por los docentes?"
        error={form.formState.errors.estrategiasDidacticas?.message}
      />
      <ValoracionRadioField
        control={form.control}
        name="formasEvaluacion"
        label="¿Cómo valora las formas de evaluación utilizadas por los docentes del programa que se cursó?"
        error={form.formState.errors.formasEvaluacion?.message}
      />
      <ValoracionRadioField
        control={form.control}
        name="bibliografia"
        label="¿Cómo valora la bibliografía utilizada por los docentes?"
        error={form.formState.errors.bibliografia?.message}
      />

      <ScaleField
        control={form.control}
        name="asesoriaTesis"
        label="En una escala del 1 al 10, evalúe el desempeño académico de los profesores en la asesoría de su tesis"
        error={form.formState.errors.asesoriaTesis?.message}
      />

      <RadioField
        control={form.control}
        name="satisfaccionFormacion"
        label="¿Qué tan satisfecho está con la formación adquirida en el programa que cursó?"
        options={SATISFACCION_FORMACION_OPTIONS}
        error={form.formState.errors.satisfaccionFormacion?.message}
      />

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">
          En una escala de 1 a 10, ¿cómo considera los siguientes aspectos de
          infraestructura que la institución puso a su disposición mientras
          cursaba los estudios de posgrado?
        </legend>
        <div className="space-y-3">
          {INFRAESTRUCTURA_ROWS.map((row) => (
            <ScaleField
              key={row.value}
              control={form.control}
              name={`evaluacionInfraestructura.${row.value}` as const}
              label={row.label}
              error={
                form.formState.errors.evaluacionInfraestructura?.[row.value]
                  ?.message
              }
              compact
            />
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <Label
          htmlFor="tieneOtroAspectoInfraestructura"
          className="cursor-pointer pr-4"
        >
          ¿Existe algún otro aspecto de infraestructura que desee calificar?
        </Label>
        <Controller
          control={form.control}
          name="tieneOtroAspectoInfraestructura"
          render={({ field }) => (
            <Switch
              id="tieneOtroAspectoInfraestructura"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {tieneOtroAspecto && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="otroAspectoInfraestructura">
              Especifique el otro aspecto
            </Label>
            <Input
              id="otroAspectoInfraestructura"
              {...form.register("otroAspectoInfraestructura")}
            />
            {form.formState.errors.otroAspectoInfraestructura && (
              <p className="text-sm text-destructive">
                {form.formState.errors.otroAspectoInfraestructura.message}
              </p>
            )}
          </div>

          <ScaleField
            control={form.control}
            name="calificacionOtroAspectoInfraestructura"
            label="Indique la calificación de infraestructura"
            error={
              form.formState.errors.calificacionOtroAspectoInfraestructura
                ?.message
            }
          />
        </div>
      )}

      <RadioField
        control={form.control}
        name="cumplimientoExpectativas"
        label="¿Considera que se cumplieron sus expectativas y metas que se propuso al cursar el posgrado en el ITO?"
        options={CUMPLIMIENTO_EXPECTATIVAS_OPTIONS}
        error={form.formState.errors.cumplimientoExpectativas?.message}
      />

      <ValoracionRadioField
        control={form.control}
        name="calidadPrograma"
        label="¿Cómo evaluaría la calidad del programa que lo formó académicamente?"
        error={form.formState.errors.calidadPrograma?.message}
      />

      <div className="space-y-2">
        <Label htmlFor="areasMejora">
          Señale cuáles son las áreas del posgrado que considera se deben
          mejorar en beneficio de su actividad profesional
        </Label>
        <Textarea id="areasMejora" rows={4} {...form.register("areasMejora")} />
        {form.formState.errors.areasMejora && (
          <p className="text-sm text-destructive">
            {form.formState.errors.areasMejora.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mejorasPlanEstudios">
          ¿Cómo considera que se podría mejorar el Plan de Estudios que cursó?
        </Label>
        <Textarea
          id="mejorasPlanEstudios"
          rows={4}
          {...form.register("mejorasPlanEstudios")}
        />
        {form.formState.errors.mejorasPlanEstudios && (
          <p className="text-sm text-destructive">
            {form.formState.errors.mejorasPlanEstudios.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Guardando…" : "Guardar evaluación"}
      </Button>
    </form>
  );
}
