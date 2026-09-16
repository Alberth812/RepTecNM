"use client";

import { CheckCircle2 } from "lucide-react";

export default function RegistroEnviado({ esCorreccion = false }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto h-12 w-12 text-[#004B87]" />

      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        {esCorreccion ? "¡Solicitud reenviada!" : "¡Registro enviado!"}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {esCorreccion
          ? "Gracias por enviar tus correcciones. Un administrador revisará tu solicitud nuevamente."
          : "Gracias por afiliarte a la Red de Egresados de Posgrado del TecNM. Revisaremos tu información y te contactaremos por correo electrónico."}
      </p>
    </div>
  );
}
