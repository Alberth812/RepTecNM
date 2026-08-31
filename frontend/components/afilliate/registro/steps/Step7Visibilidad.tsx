"use client";

import { Controller, useFormContext } from "react-hook-form";
import { DATOS_PUBLICOS_OPTIONS, RegistroFormValues } from "@/lib/registro/types";
import CheckboxGroup from "../ui/CheckboxGroup";
import ToggleSwitch from "../ui/ToggleSwitch";

export default function Step7Visibilidad() {
  const {
    control,
    formState: { errors }} = useFormContext<RegistroFormValues>();

  return (
    <div className="space-y-5">
      <Controller
        name="autoriza_publicacion"
        control={control}
        render={({ field }) => (
          <ToggleSwitch
            label="¿Autoriza la publicación de sus datos en el catálogo público?"
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="datos_publicos"
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="¿Qué datos desea mostrar públicamente?"
            required
            columns={1}
            options={DATOS_PUBLICOS_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.datos_publicos?.message}
          />
        )}
      />
    </div>
  );
}
