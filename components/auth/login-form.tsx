"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  loginImage?: string;
}

export function LoginForm({ loginImage }: LoginFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified") === "1";
  const verifiedEmail = searchParams.get("email") ?? "";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: verifiedEmail, password: "" },
  });

  useEffect(() => {
    if (verifiedEmail) form.setValue("email", verifiedEmail);
  }, [verifiedEmail, form]);

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setUnverifiedEmail(null);

    try {
      const result = await loginMutation.mutateAsync(values);
      const user = result.user;

      if (user.role === "ADMINISTRADOR") {
        toast.success(`Bienvenido ${user.email}`);

        // El layout decidirá qué barra administrativa mostrar.
        router.push("/admin/inicio");
      } else {
        toast.success(`Bienvenido ${user.email}`);

        const requiresRegistration = [
          "NO_INICIADA",
          "PENDIENTE_APROBACION",
          "REQUIERE_CORRECCION",
        ].includes(user.membershipStatus);

        router.push(requiresRegistration ? "/registro" : "/afiliado/inicio");
      }

      router.refresh();
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

        if (error.code === "ADMIN_INACTIVE") {
          setFormError(
            "Tu cuenta de administrador está desactivada. Contacta al administrador general.",
          );
          return;
        }

        if (error.code === "AFFILIATE_SUSPENDED") {
          setFormError(
            "Tu membresía se encuentra suspendida. Contacta a la administración de REP TecNM.",
          );
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
      variant="split"
      backLink="/"
      title="Inicia sesión"
      description="Ingresa tus credenciales para continuar"
      loginImage={loginImage} //  Pasamos la imagen al shell
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
      {verified && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Correo verificado</AlertTitle>
          <AlertDescription>
            Tu correo fue verificado correctamente. Ahora puedes iniciar sesión.
          </AlertDescription>
        </Alert>
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {formError && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>No se pudo iniciar sesión</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        {unverifiedEmail && (
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
        )}
        <Field data-invalid={!!emailError}>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!emailError}
            {...form.register("email")}
          />
          {emailError && <FieldError errors={[emailError]} />}
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
          {passwordError && <FieldError errors={[passwordError]} />}
        </Field>
        <Button
          type="submit"
          className="w-full h-11 bg-[#004B87] hover:bg-[#003a68] text-white font-semibold shadow-md transition-all"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Iniciar sesión
        </Button>
      </form>
    </AuthShell>
  );
}
