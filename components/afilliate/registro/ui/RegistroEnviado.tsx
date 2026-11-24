"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { CheckCircle2 } from "lucide-react";

//
export default function RegistroEnviado({ esCorreccion = false }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
      {/* Icono de éxito */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        {esCorreccion ? "¡Correcciones enviadas con éxito!" : "¡Solicitud de afiliación enviada!"}
      </h2>

      <p className="mt-4 text-lg text-slate-600 max-w-lg mx-auto">
        {esCorreccion
          ? "Gracias por enviar tus correcciones. Un administrador revisará tu solicitud nuevamente."
          : "Gracias por afiliarte a la Red de Egresados de Posgrado del TecNM. Revisaremos tu información."}
      </p>

      <LogoutButton className="w-full" />
    </div>
  );
}
