"use client";

import { CheckCircle2, Clock, Home, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegistroEnviado({ esCorreccion = false }: { esCorreccion?: boolean }) {
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);

  const handleLogout = async () => {
    setCerrando(true);
    try {
      // Ajusta esta ruta si tu endpoint de cierre de sesión es diferente
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      router.push("/");
      router.refresh();
    }
  };

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
          ? "Gracias por actualizar tu información. Un administrador revisará tus correcciones a la brevedad."
          : "Hemos recibido tu solicitud de ingreso a la Red de Egresados de Posgrado del TecNM."}
      </p>

      {/* Línea de tiempo de próximos pasos */}
      <div className="mt-8 text-left bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#004B87]" />
          Próximos pasos
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004B87] text-white text-xs font-bold mt-0.5">1</div>
            <div>
              <p className="text-sm font-medium text-slate-900">Revisión documental</p>
              <p className="text-sm text-slate-500">Nuestra directiva revisará tu expediente (tiempo estimado: 24 a 48 horas hábiles).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004B87] text-white text-xs font-bold mt-0.5">2</div>
            <div>
              <p className="text-sm font-medium text-slate-900">Notificación por correo</p>
              <p className="text-sm text-slate-500">Te enviaremos un correo electrónico confirmando la aprobación de tu cuenta.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004B87] text-white text-xs font-bold mt-0.5">3</div>
            <div>
              <p className="text-sm font-medium text-slate-900">Cuenta activada</p>
              <p className="text-sm text-slate-500">Podrás iniciar sesión, generar tu credencial digital y acceder al catálogo completo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          variant="outline"
          className="w-full sm:w-auto border-slate-300 hover:bg-slate-50"
          onClick={() => router.push("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>
        
        <Button
          variant="default"
          className="w-full sm:w-auto bg-[#004B87] hover:bg-[#003a68]"
          onClick={() => router.push("/catalogo")}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Explorar Catálogo
        </Button>

        <Button
          variant="ghost"
          className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
          disabled={cerrando}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {cerrando ? "Cerrando..." : "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );
}
