"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  DISPONIBILIDAD_OPTIONS,
  ESTADOS_MEXICO,
  RegistroFormValues,
} from "./types";
import TextInput from "@/components/afilliate/registro/ui/TextInput";
import SelectInput from "@/components/afilliate/registro/ui/SelectInput";
import CheckboxGroup from "@/components/afilliate/registro/ui/CheckboxGroup";

export default function Step3Ubicacion() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RegistroFormValues>();

  return (
    <div className="space-y-5">
      <Controller
        name="estado_residencia"
        control={control}
        render={({ field }) => (
          <SelectInput
            label="Estado de residencia actual"
            required
            name="estado_residencia"
            options={ESTADOS_MEXICO}
            value={field.value}
            onChange={field.onChange}
            error={errors.estado_residencia?.message}
          />
        )}
      />

      <TextInput
        label="Ciudad de residencia actual"
        required
        {...register("ciudad_residencia")}
        error={errors.ciudad_residencia?.message}
      />

      <Controller
        name="disponibilidad_geografica"
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Disponibilidad geográfica"
            required
            options={DISPONIBILIDAD_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.disponibilidad_geografica?.message}
          />
        )}
      />
    </div>
  );
}
