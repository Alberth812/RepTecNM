"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { passwordSchema } from "@/lib/validation/password";
import { Button } from "@/components/ui/button";
import {
 Field,
 FieldDescription,
 FieldError,
 FieldGroup,
 FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
 Alert,
 AlertDescription,
} from "@/components/ui/alert";

const changePasswordSchema = z
 .object({
 currentPassword: z
 .string()
 .min(1, "Debes proporcionar tu contraseña actual."),
 newPassword: passwordSchema,
 confirmPassword: z
 .string()
 .min(1, "Debes confirmar tu nueva contraseña."),
 })
 .refine((data) => data.newPassword === data.confirmPassword, {
 message: "Las contraseñas no coinciden.",
 path: ["confirmPassword"],
 });

type ChangePasswordFormValues = z.infer<
 typeof changePasswordSchema
>;

type ApiError = {
 code?: string;
 message?: string;
};

function PasswordInput({
 field,
 placeholder,
 disabled,
 autoComplete,
 invalid,
}: {
 field: {
 name: string;
 value: string;
 onChange: (...event: unknown[]) => void;
 onBlur: () => void;
 ref: (element: HTMLInputElement | null) => void;
 };
 placeholder?: string;
 disabled?: boolean;
 autoComplete?: string;
 invalid?: boolean;
}) {
 const [visible, setVisible] = useState(false);

 return (
 <div className="relative">
 <Input
 {...field}
 ref={field.ref}
 id={field.name}
 type={visible ? "text" : "password"}
 placeholder={placeholder}
 autoComplete={autoComplete}
 disabled={disabled}
 aria-invalid={invalid}
 className="pr-10"
 />

 <button
 type="button"
 tabIndex={-1}
 onClick={() => setVisible((value) => !value)}
 disabled={disabled}
 aria-label={
 visible
 ? "Ocultar contraseña"
 : "Mostrar contraseña"
 }
 className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {visible ? (
 <EyeOff className="size-4" />
 ) : (
 <Eye className="size-4" />
 )}
 </button>
 </div>
 );
}

export function ChangePasswordForm() {
 const router = useRouter();

 const [serverError, setServerError] = useState<string | null>(
 null,
 );

 const form = useForm<ChangePasswordFormValues>({
 resolver: zodResolver(changePasswordSchema),
 defaultValues: {
 currentPassword: "",
 newPassword: "",
 confirmPassword: "",
 },
 });

 const isSubmitting = form.formState.isSubmitting;

 async function onSubmit(values: ChangePasswordFormValues) {
 setServerError(null);

 try {
 const response = await fetch("/api/password/change", {
 method: "PATCH",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 currentPassword: values.currentPassword,
 newPassword: values.newPassword,
 }),
 });

 const data = (await response.json().catch(() => null)) as
 | ApiError
 | null;

 if (!response.ok) {
 const message =
 data?.message ??
 "No se pudo actualizar la contraseña.";

 setServerError(message);
 toast.error(message);

 switch (data?.code) {
 case "INVALID_PASSWORD":
 form.setError("currentPassword", {
 type: "server",
 message:
 "La contraseña actual es incorrecta.",
 });
 break;

 case "CREDENTIAL_ACCOUNT_NOT_FOUND":
 form.setError("currentPassword", {
 type: "server",
 message:
 "Esta cuenta no tiene una contraseña configurada.",
 });
 break;

 case "SESSION_EXPIRED":
 form.setError("root.server", {
 type: "server",
 message,
 });
 break;
 }

 return;
 }

 toast.success(
 data?.message ??
 "Contraseña actualizada correctamente.",
 );

 form.reset();

 router.push("/afiliado/cuenta");
 router.refresh();
 } catch {
 const message =
 "No se pudo conectar con el servidor. Inténtalo nuevamente.";

 setServerError(message);
 toast.error(message);
 }
 }

 return (
 <form
 onSubmit={form.handleSubmit(onSubmit)}
 className="space-y-6"
 noValidate
 >
 {serverError && (
 <Alert variant="destructive">
 <AlertDescription>
 {serverError}
 </AlertDescription>
 </Alert>
 )}

 <FieldGroup>
 <Controller
 name="currentPassword"
 control={form.control}
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>
 Contraseña actual
 </FieldLabel>

 <PasswordInput
 field={field}
 placeholder="Ingresa tu contraseña actual"
 disabled={isSubmitting}
 autoComplete="current-password"
 invalid={fieldState.invalid}
 />

 {fieldState.invalid && (
 <FieldError errors={[fieldState.error]} />
 )}
 </Field>
 )}
 />

 <Controller
 name="newPassword"
 control={form.control}
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>
 Nueva contraseña
 </FieldLabel>

 <PasswordInput
 field={field}
 placeholder="Ingresa tu nueva contraseña"
 disabled={isSubmitting}
 autoComplete="new-password"
 invalid={fieldState.invalid}
 />

 <FieldDescription>
 Debe tener al menos 8 caracteres, una
 mayúscula, un número y un símbolo.
 </FieldDescription>

 {fieldState.invalid && (
 <FieldError errors={[fieldState.error]} />
 )}
 </Field>
 )}
 />

 <Controller
 name="confirmPassword"
 control={form.control}
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>
 Confirmar nueva contraseña
 </FieldLabel>

 <PasswordInput
 field={field}
 placeholder="Repite tu nueva contraseña"
 disabled={isSubmitting}
 autoComplete="new-password"
 invalid={fieldState.invalid}
 />

 {fieldState.invalid && (
 <FieldError errors={[fieldState.error]} />
 )}
 </Field>
 )}
 />
 </FieldGroup>

 <Button
 type="submit"
 disabled={isSubmitting}
 className="w-full"
 >
 {isSubmitting && (
 <Loader2 className="mr-2 size-4 animate-spin" />
 )}

 {isSubmitting
 ? "Actualizando..."
 : "Cambiar contraseña"}
 </Button>
 </form>
 );
}
