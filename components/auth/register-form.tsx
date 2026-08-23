"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import type { z } from "zod";
import { Loader2, TriangleAlert } from "lucide-react";

import { registerSchema } from "@/lib/validation/schemas";
import { useRegisterMutation } from "@/lib/hooks/use-auth";
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

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      const result = await registerMutation.mutateAsync(values);
      // El backend siempre crea la cuenta como AFILIADO y dispara el primer
      // OTP (RF-AUTH-001/002); mandamos al usuario a verificarlo.
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.code === "VALIDATION_ERROR" && applyServerValidationErrors(form, error.issues)) {
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
      title="Crea tu cuenta"
      description="Regístrate como afiliado en unos segundos"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-[#004B87] hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError ? (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>No se pudo completar el registro</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juana Pérez" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    {...field}
                  />
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
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#004B87] hover:bg-[#003a68]"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Crear cuenta
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
