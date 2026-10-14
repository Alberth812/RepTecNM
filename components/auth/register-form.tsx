"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
 const router = useRouter();
 const [formError, setFormError] = useState<string | null>(null);
 const registerMutation = useRegisterMutation();

 const form = useForm<RegisterValues>({
 resolver: zodResolver(registerSchema),
 defaultValues: {
 name: "",
 email: "",
 password: "",
 },
 });

 async function onSubmit(values: RegisterValues) {
 setFormError(null);

 try {
 const result = await registerMutation.mutateAsync(values);

 router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
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
 title="Crea tu cuenta"
 description="Regístrate como afiliado en unos segundos"
 footer={
 <>
 ¿Ya tienes cuenta?{" "}
 <Link
 href="/login"
 className="font-medium text-[#004B87] hover:underline"
 >
 Inicia sesión
 </Link>
 </>
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
 <AlertTitle>No se pudo completar el registro</AlertTitle>
 <AlertDescription>{formError}</AlertDescription>
 </Alert>
 ) : null}

 <Controller
 control={form.control}
 name="name"
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>Nombre completo</FieldLabel>

 <Input
 {...field}
 id={field.name}
 placeholder="Juana Pérez"
 autoComplete="name"
 aria-invalid={fieldState.invalid}
 />

 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
 </Field>
 )}
 />

 <Controller
 control={form.control}
 name="email"
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>Correo electrónico</FieldLabel>

 <Input
 {...field}
 id={field.name}
 type="email"
 placeholder="tucorreo@ejemplo.com"
 autoComplete="email"
 aria-invalid={fieldState.invalid}
 />

 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
 </Field>
 )}
 />

 <Controller
 control={form.control}
 name="password"
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>

 <Input
 {...field}
 id={field.name}
 type="password"
 placeholder="••••••••"
 autoComplete="new-password"
 aria-invalid={fieldState.invalid}
 />

 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
 </Field>
 )}
 />

 <Button
 type="submit"
 className="w-full bg-[#004B87] hover:bg-[#003a68]"
 disabled={registerMutation.isPending}
 >
 {registerMutation.isPending ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : null}
 Crear cuenta
 </Button>
 </form>
 </AuthShell>
 );
}
