"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import type { z } from "zod";
import { Loader2, TriangleAlert, CheckCircle2 } from "lucide-react";

import { loginSchema } from "@/lib/validation/schemas";
import { useLoginMutation } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/http-error";
import { applyServerValidationErrors } from "@/lib/forms/apply-server-errors";
import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();

const verified = searchParams.get("verified") === "1";
const verifiedEmail = searchParams.get("email") ?? "";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: verifiedEmail,
      password: "",
    },
  });

  useEffect(() => {
    if (verifiedEmail) {
      form.setValue("email", verifiedEmail);
    }
  }, [verifiedEmail, form]);

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setUnverifiedEmail(null);

    try {
      const result = await loginMutation.mutateAsync(values);

      if (result.user) {
        toast.success(`Bienvenido ${result.user.email}`);
        if (result.user.role === "ADMINISTRADOR") {
          router.push("/admin/inicio");
        } else {
          router.push("/afiliado/inicio");
        }
        router.refresh();
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (
          error.code === "VALIDATION_ERROR" &&
          applyServerValidationErrors(form, error.issues)
        ) {
          return;
        }

        if (error.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(values.email);
          return;
        }

        const retrySuffix =
          error.retryAfterSeconds !== undefined
            ? ` (intenta de nuevo en ${Math.ceil(error.retryAfterSeconds)}s)`
            : "";

        setFormError(`${error.message}${retrySuffix}`);
        return;
      }

      setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
    }
  }

  const emailError = form.formState.errors.email;
  const passwordError = form.formState.errors.password;

  return (
    <AuthShell
      title="Inicia sesión"
      description="Ingresa tus credenciales para continuar"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-[#004B87] hover:underline"
          >
            Regístrate
          </Link>
        </>
      }
    >
      {verified ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Correo verificado</AlertTitle>
          <AlertDescription>
            Tu correo fue verificado correctamente. Ahora puedes iniciar sesión.
          </AlertDescription>
        </Alert>
      ) : null}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
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
                href={`/verify-email?email=${encodeURIComponent(
                  unverifiedEmail,
                )}`}
                className="font-medium underline"
              >
                Ir a verificar
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        <Field data-invalid={!!emailError}>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!emailError}
            {...form.register("email")}
          />

          {emailError ? <FieldError errors={[emailError]} /> : null}
        </Field>

        <Field data-invalid={!!passwordError}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>

            <Link
              href="/forgot-password"
              className="text-sm text-[#004B87] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            {...form.register("password")}
          />

          {passwordError ? <FieldError errors={[passwordError]} /> : null}
        </Field>

        <Button
          type="submit"
          className="w-full bg-[#004B87] hover:bg-[#003a68]"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Iniciar sesión
        </Button>
      </form>
    </AuthShell>
  );
}
