"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
 const [successMessage, setSuccessMessage] = useState<string | null>(null);
 const [formError, setFormError] = useState<string | null>(null);
 const forgotPasswordMutation = useForgotPasswordMutation();

 const form = useForm<ForgotPasswordValues>({
 resolver: zodResolver(forgotPasswordSchema),
 defaultValues: {
 email: "",
 },
 });

 async function onSubmit(values: ForgotPasswordValues) {
 setFormError(null);
 setSuccessMessage(null);

 try {
 const result = await forgotPasswordMutation.mutateAsync(values);

 setSuccessMessage(result.message);
 form.reset();
 } catch (error) {
 if (error instanceof ApiRequestError) {
 if (
 error.code === "VALIDATION_ERROR" &&
 applyServerValidationErrors(form, error.issues)
 ) {
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
 title="Recupera tu contraseña"
 description="Te enviaremos un enlace para restablecerla"
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

 <Controller
 control={form.control}
 name="email"
 render={({ field, fieldState }) => (
 <div className="space-y-2">
 <label htmlFor={field.name} className="text-sm font-medium">
 Correo electrónico
 </label>

 <Input
 id={field.name}
 type="email"
 autoComplete="email"
 aria-invalid={fieldState.invalid}
 aria-describedby={
 fieldState.error ? `${field.name}-error` : undefined
 }
 {...field}
 />

 {fieldState.error ? (
 <p
 id={`${field.name}-error`}
 className="text-sm font-medium text-destructive"
 >
 {fieldState.error.message}
 </p>
 ) : null}
 </div>
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
 </AuthShell>
 );
}
