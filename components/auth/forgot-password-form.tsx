"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import type { z } from "zod";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { useForgotPasswordMutation } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/http-error";
import { applyServerValidationErrors } from "@/lib/forms/apply-server-errors";
import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      const result = await forgotPasswordMutation.mutateAsync(values);
      // RF-AUTH-011: el backend siempre responde el mismo mensaje uniforme,
      // exista o no la cuenta. No hay nada más que inferir de una respuesta
      // exitosa, así que la mostramos tal cual.
      setSuccessMessage(result.message);
      form.reset();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.code === "VALIDATION_ERROR" && applyServerValidationErrors(form, error.issues)) {
          return;
        }
        // El único caso que sí distingue con un 429 explícito es el límite
        // por IP (RF-AUTH-023), que no depende de si la cuenta existe.
        const retrySuffix = error.retryAfterSeconds
          ? ` (intenta de nuevo en ${error.retryAfterSeconds}s)`
          : "";
        setFormError(`${error.message}${retrySuffix}`);
        return;
      }
      setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
    }
  }

  return (
    <AuthShell
      title="Recupera tu contraseña"
      description="Te enviaremos un enlace para restablecerla"
      footer={
        <Link href="/login" className="font-medium text-[#004B87] hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError ? (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>No se pudo procesar la solicitud</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#004B87] hover:bg-[#003a68]"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Enviar enlace de recuperación
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
