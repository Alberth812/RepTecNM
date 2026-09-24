"use client";

import { Controller, useFormContext } from "react-hook-form";
import { AREA_CONOCIMIENTO_OPTIONS, RegistroFormValues } from "./types";
import TextInput from "@/components/afilliate/registro/ui/TextInput";
import TextArea from "@/components/afilliate/registro/ui/TextArea";
import CheckboxGroup from "@/components/afilliate/registro/ui/CheckboxGroup";
import TagInput from "@/components/afilliate/registro/ui/TagInput";
import RepeatableProjects from "@/components/afilliate/registro/ui/RepeatableProjects";

const OTRO = "Otro (especifique)";

export default function Step4PerfilProfesional() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<RegistroFormValues>();

  const areaConocimiento = watch("area_conocimiento");
  const perfilProfesional = watch("perfil_profesional");

  return (
    <div className="space-y-5">
      <Controller
        name="area_conocimiento"
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Área de conocimiento"
            required
            options={AREA_CONOCIMIENTO_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.area_conocimiento?.message}
          />
        )}
      />

      {areaConocimiento?.includes(OTRO) && (
        <TextInput
          label="Especifica el área de conocimiento"
          required
          {...register("area_conocimiento_otro")}
          error={errors.area_conocimiento_otro?.message}
        />
      )}

      <TextArea
        label="Descripción breve del perfil profesional"
        required
        maxWords={200}
        maxChars={500}
        currentValue={perfilProfesional}
        rows={5}
        placeholder="Resume tu trayectoria, especialidad y lo que te distingue profesionalmente."
        {...register("perfil_profesional")}
        error={errors.perfil_profesional?.message}
      />

      <Controller
        name="palabras_clave"
        control={control}
        render={({ field }) => (
          <TagInput
            label="Palabras clave (tags) de los servicios que puede ofrecer"
            required
            value={field.value}
            onChange={field.onChange}
            error={errors.palabras_clave?.message as string | undefined}
          />
        )}
      />

      <TextArea
        label="Habilidades tecnológicas con las que cuenta"
        required
        rows={4}
        placeholder="Lenguajes, herramientas, metodologías, certificaciones…"
        {...register("habilidades_tecnologicas")}
        error={errors.habilidades_tecnologicas?.message}
      />

      <RepeatableProjects />
    </div>
  );
}
