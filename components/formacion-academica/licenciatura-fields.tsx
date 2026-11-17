// @/components/formacion-academica/licenciatura-fields.tsx
//
// Sección "Licenciatura" del JSON de especificación. Se usa una vez por cada
// elemento del useFieldArray `licenciaturas` en el formulario principal.

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormacionAcademicaInput } from "@/lib/validation/formacion-academica";
import { Trash2 } from "lucide-react";
import type { Control, UseFormSetValue } from "react-hook-form";
import {
  AnioFormField,
  InstitucionFormField,
  TextFormField,
  type Institucion,
} from "./shared";

type LicenciaturaFieldsProps = {
  control: Control<FormacionAcademicaInput>;
  setValue: UseFormSetValue<FormacionAcademicaInput>;
  index: number;
  instituciones: Institucion[];
  onRemove: () => void;
  removable: boolean;
};

export function LicenciaturaFields({
  control,
  setValue,
  index,
  instituciones,
  onRemove,
  removable,
}: LicenciaturaFieldsProps) {
  /*const row = useWatch({ control, name: `licenciaturas.${index}` }) as
    | FormacionAcademica["licenciaturas"][number]
    | undefined;*/

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-4">
        <CardTitle className="text-sm font-medium">
          Licenciatura {index + 1}
        </CardTitle>
        {removable ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="mr-1 h-4 w-4" />
            Quitar
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InstitucionFormField
            control={control}
            name={`licenciaturas.${index}.institucionId`}
            label="Institución en que cursó la licenciatura"
            instituciones={instituciones}
          />
          <TextFormField
            control={control}
            name={`licenciaturas.${index}.programa`}
            label="Nombre del programa"
            placeholder="Ej. Ingeniería en Sistemas Computacionales"
          />
          <TextFormField
            control={control}
            name={`licenciaturas.${index}.disciplina`}
            label="Disciplina o área"
          />
          <div className="grid grid-cols-2 gap-4">
            <AnioFormField
              control={control}
              name={`licenciaturas.${index}.anioIngreso`}
              label="Año de ingreso"
              description="Opcional"
            />
            <AnioFormField
              control={control}
              name={`licenciaturas.${index}.anioEgreso`}
              label="Año de egreso"
            />
          </div>
        </div>

        <AnioFormField
          control={control}
          name={`licenciaturas.${index}.anioTitulacion`}
          label="Año de obtención del título"
        />
      </CardContent>
    </Card>
  );
}
