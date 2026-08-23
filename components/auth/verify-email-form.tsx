"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import { emailSchema, otpSchema } from "@/lib/validation/schemas";
import { authClient } from "@/lib/auth-client";
import { useResendVerificationMutation } from "@/lib/hooks/use-auth";
import { useResendCooldown } from "@/lib/hooks/use-resend-cooldown";
import { ApiRequestError } from "@/lib/api/http-error";
import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const verifyEmailFormSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

type VerifyEmailValues = z.infer<typeof verifyEmailFormSchema>;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [formError, setFormError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const resendMutation = useResendVerificationMutation();
  const { secondsLeft, canResend, startCooldown } = useResendCooldown();

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailFormSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: "",
    },
  });

  async function onSubmit(values: VerifyEmailValues) {
    setFormError(null);
    setIsVerifying(true);

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: values.email,
        otp: values.otp,
      });

      if (error) {
        setFormError(error.message ?? "Código inválido o expirado.");
        return;
      }

      router.push("/login?verified=1");
    } catch {
      setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setFormError(null);
    setResendMessage(null);

    const emailValue = form.getValues("email");
    const parsedEmail = emailSchema.safeParse(emailValue);

    if (!parsedEmail.success) {
      form.setError("email", {
        message: "Ingresa un correo válido para reenviar el código.",
      });
      return;
    }

    try {
      const result = await resendMutation.mutateAsync({
        email: parsedEmail.data,
      });

      setResendMessage(result.message);
      startCooldown(120);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(error.message);

        if (error.retryAfterSeconds) {
          startCooldown(error.retryAfterSeconds);
        }

        return;
      }

      setFormError("No se pudo reenviar el código. Intenta de nuevo.");
    }
  }

  return (
    <AuthShell
      title="Verifica tu correo"
      description="Ingresa el código de 6 dígitos que enviamos a tu correo"
      footer={
        <Link
          href="/login"
          className="font-medium text-[#004B87] hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      }
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {formError ? (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>No se pudo verificar</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        {resendMessage ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{resendMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Field
          data-invalid={!!form.formState.errors.email}
          orientation="vertical"
        >
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>

          <FieldContent>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />

            {form.formState.errors.email && (
              <FieldError>{form.formState.errors.email.message}</FieldError>
            )}
          </FieldContent>
        </Field>

        <Controller
          control={form.control}
          name="otp"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="vertical">
              <FieldLabel htmlFor="otp">Código de verificación</FieldLabel>

              <FieldContent>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#004B87] hover:bg-[#003a68]"
          disabled={isVerifying}
        >
          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Verificar correo
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={!canResend || resendMutation.isPending}
        >
          {resendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}

          {canResend ? "Reenviar código" : `Reenviar en ${secondsLeft}s`}
        </Button>
      </form>
    </AuthShell>
  );
}
