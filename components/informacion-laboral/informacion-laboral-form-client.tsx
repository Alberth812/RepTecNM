// @/components/informacion-laboral/informacion-laboral-form-client.tsx
//
// Puente entre el formulario (agnóstico de red) y el endpoint HTTP. Se deja
// como un componente aparte para que <InformacionLaboralForm /> permanezca
// reutilizable (tests, Storybook, otro flujo de guardado, etc.) sin acoplarse
// a `fetch` ni al router de Next.
//
// Usa el componente `Alert` de shadcn para mostrar éxito/error en vez de una
// librería de toasts, para no asumir que ya tienes una configurada. Si usas
// `sonner` (el toast recomendado actualmente por shadcn), puedes reemplazar
// el estado `status` de abajo por `toast.success(...)` / `toast.error(...)`.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  InformacionLaboralForm,
  type DeepPartial,
  type InformacionLaboralFormValues,
  type InformacionLaboralSeccionOutput,
} from "./informacion-laboral-form";

interface InformacionLaboralFormClientProps {
  defaultValues?: DeepPartial<InformacionLaboralFormValues>;
}

interface SubmitStatus {
  type: "success" | "error";
  message: string;
}

export function InformacionLaboralFormClient({
  defaultValues,
}: InformacionLaboralFormClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<SubmitStatus | null>(null);

  async function handleSubmit(data: InformacionLaboralSeccionOutput) {
    setStatus(null);

    let response: Response;
    try {
      response = await fetch("/api/informacion-laboral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      setStatus({
        type: "error",
        message:
          "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
      });
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatus({
        type: "error",
        message:
          body?.error ??
          "No se pudo guardar la información laboral. Intenta de nuevo.",
      });
      return;
    }

    setStatus({
      type: "success",
      message: "Información laboral guardada correctamente.",
    });
    // Revalida los datos del Server Component (por si el usuario vuelve a
    // entrar a esta página o navega a un resumen que dependa de ella).
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {status && (
        <Alert variant={status.type === "error" ? "destructive" : "default"}>
          {status.type === "error" ? (
            <AlertCircle className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <AlertTitle>
            {status.type === "error" ? "Ocurrió un problema" : "Listo"}
          </AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <InformacionLaboralForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
