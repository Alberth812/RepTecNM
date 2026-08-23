"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import type { z } from "zod";
import { Loader2, TriangleAlert } from "lucide-react";

import { loginSchema } from "@/lib/validation/schemas";
import { useLoginMutation } from "@/lib/hooks/use-auth";
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

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setUnverifiedEmail(null);
    try {
      const result = await loginMutation.mutateAsync(values);
      // RF-AUTH-013: mensaje de bienvenida exacto, solo presente para
      // administradores.
      if (result.message) toast.success(result.message);
      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.code === "VALIDATION_ERROR" && applyServerValidationErrors(form, error.issues)) {
          return;
        }
        // No hay un código dedicado para "correo no verificado" expuesto por
        // toErrorResponse en este caso (viene de better-auth vía isAPIError),
        // así que detectamos el mismo patrón que ya usa el backend en
        // app/api/login/route.ts para no contarlo como intento fallido.
        if (error.code === "EMAIL_NOT_VERIFIED" || /verif/i.test(error.message)) {
          setUnverifiedEmail(values.email);
          return;
        }
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
      title="Inicia sesión"
      description="Ingresa tus credenciales para continuar"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-[#004B87] hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError ? (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>No se pudo iniciar sesión</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          {unverifiedEmail ? (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Correo no verificado</AlertTitle>
              <AlertDescription>
                Verifica tu cuenta antes de iniciar sesión.{" "}
                <Link
                  href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="font-medium underline"
                >
                  Ir a verificar
                </Link>
              </AlertDescription>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Contraseña</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#004B87] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#004B87] hover:bg-[#003a68]"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Iniciar sesión
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
