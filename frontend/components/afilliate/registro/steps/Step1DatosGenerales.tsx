"use client";

import { Controller, useFormContext } from "react-hook-form";
import { RegistroFormValues, GENERO_OPTIONS } from "@/lib/registro/types";
import {
  COMPROBANTE_MIME_TYPES,
  MAX_COMPROBANTE_SIZE_BYTES} from "@/lib/registro/validators";
import TextInput from "../ui/TextInput";
import RadioGroup from "../ui/RadioGroup";
import PhotoUpload from "../ui/PhotoUpload";
import FileUpload from "../ui/FileUpload";

export default function Step1DatosGenerales() {
  const {
    register,
    control,
    formState: { errors }} = useFormContext<RegistroFormValues>();

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Apellido paterno"
          required
          {...register("apellido_paterno")}
          error={errors.apellido_paterno?.message}
        />
        <TextInput
          label="Apellido materno"
          required
          {...register("apellido_materno")}
          error={errors.apellido_materno?.message}
        />
      </div>

      <TextInput
        label="Nombre(s)"
        required
        {...register("nombres")}
        error={errors.nombres?.message}
      />

      <Controller
        name="fotografia"
        control={control}
        render={({ field }) => (
          <PhotoUpload
            label="Fotografía"
            required
            description="Reciente (no mayor a 2 años), tipo retrato, rostro claramente visible y expresión neutral o cordial."
            value={field.value}
            onChange={field.onChange}
            error={errors.fotografia?.message as string | undefined}
          />
        )}
      />

      <Controller
        name="comprobante_membresia"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Comprobante de pago de membresía"
            value={field.value}
            required
            onChange={field.onChange}
            accept={COMPROBANTE_MIME_TYPES.join(",")}
            acceptedLabel="PDF, JPG o PNG"
            maxSizeBytes={MAX_COMPROBANTE_SIZE_BYTES}
            error={errors.comprobante_membresia?.message as string | undefined}
          />
        )}
      />

      <Controller
        name="genero"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="Género"
            required
            name="genero"
            options={GENERO_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.genero?.message}
          />
        )}
      />
    </div>
  );
}
