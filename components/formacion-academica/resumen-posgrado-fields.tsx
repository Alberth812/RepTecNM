// @/components/formacion-academica/resumen-posgrado-fields.tsx
//
// Sección "Resumen de estudios de posgrado" (entity: resumen_posgrado, one_to_one).
// Es un dato de navegación/formulario; no sustituye los registros detallados
// de la sección "Posgrados".

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FormacionAcademicaInput } from "@/lib/validation/formacion-academica";
import type { Control } from "react-hook-form";
import { CheckboxGroupField, YesNoField } from "./shared";

const PROGRAMAS_POSGRADO_OPTIONS = [
  { value: "MAESTRIA", label: "Maestría" },
  { value: "DOCTORADO", label: "Doctorado" },
];

export function ResumenPosgradoFields({
  control,
}: {
  control: Control<FormacionAcademicaInput>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Resumen de estudios de posgrado
        </CardTitle>
        <CardDescription>
          Este resumen es solo de navegación; los detalles completos se capturan
          en la pestaña "Posgrado".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <CheckboxGroupField
          control={control}
          name="resumenPosgrado.programasPosgradoCursados"
          label="Programas de posgrado cursados"
          options={PROGRAMAS_POSGRADO_OPTIONS}
        />
        <YesNoField
          control={control}
          name="resumenPosgrado.trayectoriaMaestriaDoctoradoIntegrada"
          label="¿La trayectoria corresponde a un programa integrado de Maestría y Doctorado?"
        />
      </CardContent>
    </Card>
  );
}
