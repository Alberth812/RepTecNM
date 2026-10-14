"use client";

import RadioGroup from "@/components/afilliate/registro/ui/RadioGroup";
import TextInput from "@/components/afilliate/registro/ui/TextInput";
import { GENERO_OPTIONS, RegistroFormValues } from "./types";
import { Controller, useFormContext } from "react-hook-form";

export default function Step1DatosGenerales() {
 const {
 register,
 control,
 formState: { errors },
 } = useFormContext<RegistroFormValues>();

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
