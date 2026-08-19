"use client";

import { useFormContext } from "react-hook-form";
import { RegistroFormValues } from "@/lib/registro/types";
import TextInput from "../ui/TextInput";

export default function Step2Contacto() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistroFormValues>();

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Teléfono móvil"
          type="tel"
          required
          inputMode="numeric"
          placeholder="10 dígitos"
          description="Sin guiones ni espacios"
          {...register("telefono_celular")}
          error={errors.telefono_celular?.message}
        />
        <TextInput
          label="Teléfono de casa"
          type="tel"
          inputMode="numeric"
          placeholder="10 dígitos"
          {...register("telefono_casa")}
          error={errors.telefono_casa?.message}
        />
      </div>

      <TextInput
        label="Correo electrónico de contacto"
        type="email"
        required
        placeholder="nombre@correo.com"
        {...register("correo_electronico")}
        error={errors.correo_electronico?.message}
      />

      <TextInput
        label="LinkedIn"
        type="text"
        placeholder="https://www.linkedin.com/in/tu-usuario"
        {...register("linkedin")}
        error={errors.linkedin?.message}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="ORCID"
          type="text"
          placeholder="0000-0000-0000-0000"
          {...register("orcid")}
          error={errors.orcid?.message}
        />
        <TextInput
          label="Sitio web"
          type="url"
          placeholder="https://tu-sitio.com"
          {...register("sitio_web")}
          error={errors.sitio_web?.message}
        />
      </div>
    </div>
  );
}
