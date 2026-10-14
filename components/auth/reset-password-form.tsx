"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import { passwordSchema } from "@/lib/validation/password";
import { useResetPasswordMutation } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/http-error";
import { applyServerValidationErrors } from "@/lib/forms/apply-server-errors";
import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// `newPassword` reutiliza las mismas reglas de RF-AUTH-010 que ya aplica el
// registro; `confirmPassword` es un campo puramente de UI, nunca viaja al
// backend.
const resetPasswordFormSchema = z
 .object({
 newPassword: passwordSchema,
 confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
 })
 .refine((data) => data.newPassword === data.confirmPassword, {
 message: "Las contraseñas no coinciden",
 path: ["confirmPassword"],
 });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordForm() {
 const router = useRouter();
 const searchParams = useSearchParams();

 // El enlace enviado por correo incluye ambos como query params (ver
 // lib/auth/auth.ts -> sendResetPassword), así el backend puede aplicar
 // el tope de 2 cambios/7 días antes de consumir el token.
 const token = searchParams.get("token") ?? "";
 const email = searchParams.get("email") ?? "";
 const linkIsIncomplete = !token || !email;

 const [formError, setFormError] = useState<string | null>(null);
 const [isDone, setIsDone] = useState(false);

 const resetPasswordMutation = useResetPasswordMutation();

 const form = useForm<ResetPasswordFormValues>({
 resolver: zodResolver(resetPasswordFormSchema),
 defaultValues: {
 newPassword: "",
 confirmPassword: "",
 },
 });

 async function onSubmit(values: ResetPasswordFormValues) {
 setFormError(null);

 try {
 await resetPasswordMutation.mutateAsync({
 email,
 token,
 newPassword: values.newPassword,
 });

 setIsDone(true);

 setTimeout(() => {
 router.push("/login");
 }, 2500);
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

 if (linkIsIncomplete) {
 return (
 <AuthShell title="Enlace inválido">
 <Alert variant="destructive">
 <TriangleAlert className="h-4 w-4" />
 <AlertTitle>Enlace incompleto</AlertTitle>

 <AlertDescription>
 Este enlace de recuperación no es válido. Solicita uno nuevo.
 </AlertDescription>
 </Alert>

 <Link
 href="/forgot-password"
 className="mt-4 block text-center text-sm font-medium text-[#004B87] hover:underline"
 >
 Solicitar nuevo enlace
 </Link>
 </AuthShell>
 );
 }

 if (isDone) {
 return (
 <AuthShell title="Contraseña actualizada">
 <Alert>
 <CheckCircle2 className="h-4 w-4" />

 <AlertDescription>
 Tu contraseña se actualizó correctamente. Te redirigimos al inicio
 de sesión…
 </AlertDescription>
 </Alert>
 </AuthShell>
 );
 }

 const newPasswordError = form.formState.errors.newPassword;
 const confirmPasswordError = form.formState.errors.confirmPassword;

 return (
 <AuthShell
 title="Restablece tu contraseña"
 description={`Cuenta: ${email}`}
 >
 <form
 onSubmit={form.handleSubmit(onSubmit)}
 className="space-y-4"
 noValidate
 >
 {formError ? (
 <Alert variant="destructive">
 <TriangleAlert className="h-4 w-4" />

 <AlertTitle>No se pudo actualizar la contraseña</AlertTitle>

 <AlertDescription>{formError}</AlertDescription>
 </Alert>
 ) : null}

 <Field data-invalid={!!newPasswordError}>
 <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>

 <Input
 id="newPassword"
 type="password"
 autoComplete="new-password"
 aria-invalid={!!newPasswordError}
 {...form.register("newPassword")}
 />

 {newPasswordError ? <FieldError errors={[newPasswordError]} /> : null}
 </Field>

 <Field data-invalid={!!confirmPasswordError}>
 <FieldLabel htmlFor="confirmPassword">
 Confirma tu nueva contraseña
 </FieldLabel>

 <Input
 id="confirmPassword"
 type="password"
 autoComplete="new-password"
 aria-invalid={!!confirmPasswordError}
 {...form.register("confirmPassword")}
 />

 {confirmPasswordError ? (
 <FieldError errors={[confirmPasswordError]} />
 ) : null}
 </Field>

 <Button
 type="submit"
 className="w-full bg-[#004B87] hover:bg-[#003a68]"
 disabled={resetPasswordMutation.isPending}
 >
 {resetPasswordMutation.isPending ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : null}
 Actualizar contraseña
 </Button>
 </form>
 </AuthShell>
 );
}
