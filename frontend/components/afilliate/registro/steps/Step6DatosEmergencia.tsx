"use client";

import { Controller, useFormContext } from "react-hook-form";
import { ShieldAlert } from "lucide-react";
import {
  PARENTESCO_OPTIONS,
  RegistroFormValues,
  TIPO_SANGUINEO_OPTIONS} from "@/lib/registro/types";
import TextInput from "../ui/TextInput";
import TextArea from "../ui/TextArea";
import SelectInput from "../ui/SelectInput";
import RadioGroup from "../ui/RadioGroup";
import ToggleSwitch from "../ui/ToggleSwitch";

const OTRO = "Otro (especifique)";

export default function Step6DatosEmergencia() {
  const {
    register,
    control,
    watch,
    formState: { errors }} = useFormContext<RegistroFormValues>();

  const parentesco = watch("parentesco_contacto_emergencia");
  const alergias = watch("alergias_condiciones_medicas");

  return (
    <div className="space-y-5">
      <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Esta información es de carácter privado. No se mostrará en el catálogo
          público de egresados; solo estará disponible en tu credencial.
        </p>
      </div>

      <TextInput
        label="Nombre completo del contacto de emergencia"
        required
        {...register("nombre_contacto_emergencia")}
        error={errors.nombre_contacto_emergencia?.message}
      />

      <Controller
        name="parentesco_contacto_emergencia"
        control={control}
        render={({ field }) => (
          <SelectInput
            label="Parentesco o relación con el contacto de emergencia"
            required
            name="parentesco_contacto_emergencia"
            options={PARENTESCO_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.parentesco_contacto_emergencia?.message}
          />
        )}
      />
      {parentesco === OTRO && (
        <TextInput
          label="Especifica el parentesco"
          required
          {...register("parentesco_contacto_emergencia_otro")}
          error={errors.parentesco_contacto_emergencia_otro?.message}
        />
      )}

      <TextInput
        label="Teléfono del contacto de emergencia"
        type="tel"
        required
        inputMode="numeric"
        placeholder="10 dígitos"
        description="Sin guiones ni espacios"
        {...register("telefono_contacto_emergencia")}
        error={errors.telefono_contacto_emergencia?.message}
      />

      <Controller
        name="tipo_sanguineo"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="Tipo sanguíneo"
            required
            name="tipo_sanguineo"
            options={TIPO_SANGUINEO_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.tipo_sanguineo?.message}
          />
        )}
      />

      <TextArea
        label="Alergias o condiciones médicas relevantes"
        description="Indica únicamente lo que deba conocerse en caso de emergencia. Si no aplica, deja este campo vacío."
        maxWords={500}
        maxChars={500}
        currentValue={alergias}
        rows={4}
        {...register("alergias_condiciones_medicas")}
        error={errors.alergias_condiciones_medicas?.message}
      />

      <Controller
        name="privacidad_datos_emergencia"
        control={control}
        render={({ field }) => (
          <ToggleSwitch
            label="¿Desea que sus datos de emergencia se muestren al escanear su credencial QR?"
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
