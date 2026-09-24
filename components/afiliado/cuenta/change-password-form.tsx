"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { passwordSchema } from "@/lib/validation/password";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    issues?: Array<{
      path?: (string | number)[];
      message?: string;
    }>;
  };
};

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function clearErrors() {
    setFieldErrors({});
    setServerError(null);
    setSuccess(null);
  }

  function validateForm(): boolean {
    const errors: FieldErrors = {};

    if (!currentPassword) {
      errors.currentPassword = "Introduce tu contraseña actual";
    }

    const passwordResult = passwordSchema.safeParse(newPassword);

    if (!passwordResult.success) {
      errors.newPassword =
        passwordResult.error.issues[0]?.message ?? "La contraseña no es válida";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu nueva contraseña";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setServerError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data: ApiErrorResponse = await response.json();

      if (!response.ok) {
        const issues = data.error?.issues;

        if (issues?.length) {
          const errors: FieldErrors = {};

          for (const issue of issues) {
            const field = issue.path?.[0];

            if (
              field === "currentPassword" ||
              field === "newPassword" ||
              field === "confirmPassword"
            ) {
              errors[field] = issue.message ?? "Valor inválido";
            }
          }

          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            setServerError(
              data.error?.message ?? "No se pudo cambiar la contraseña.",
            );
          }
        } else {
          setServerError(
            data.error?.message ?? "No se pudo cambiar la contraseña.",
          );
        }

        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});
      setSuccess(
        data.error?.message ?? "Tu contraseña se actualizó correctamente.",
      );
    } catch {
      setServerError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>
          Introduce tu contraseña actual y elige una nueva contraseña segura.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {serverError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert role="status">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña actual</Label>

            <div className="relative">
              <Input
                id="current-password"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  clearErrors();
                }}
                aria-invalid={Boolean(fieldErrors.currentPassword)}
                aria-describedby={
                  fieldErrors.currentPassword
                    ? "current-password-error"
                    : undefined
                }
                autoComplete="current-password"
                disabled={isSubmitting}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword((visible) => !visible)}
                disabled={isSubmitting}
                aria-label={
                  showCurrentPassword
                    ? "Ocultar contraseña actual"
                    : "Mostrar contraseña actual"
                }
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {fieldErrors.currentPassword && (
              <p
                id="current-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>

            <div className="relative">
              <Input
                id="new-password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  clearErrors();
                }}
                aria-invalid={Boolean(fieldErrors.newPassword)}
                aria-describedby={
                  fieldErrors.newPassword
                    ? "new-password-error"
                    : "new-password-help"
                }
                autoComplete="new-password"
                disabled={isSubmitting}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((visible) => !visible)}
                disabled={isSubmitting}
                aria-label={
                  showNewPassword
                    ? "Ocultar nueva contraseña"
                    : "Mostrar nueva contraseña"
                }
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {!fieldErrors.newPassword && (
              <p
                id="new-password-help"
                className="text-xs text-muted-foreground"
              >
                Mínimo 8 caracteres, una mayúscula, un número y un símbolo.
              </p>
            )}

            {fieldErrors.newPassword && (
              <p
                id="new-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>

            <div className="relative">
              <Input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  clearErrors();
                }}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={
                  fieldErrors.confirmPassword
                    ? "confirm-password-error"
                    : undefined
                }
                autoComplete="new-password"
                disabled={isSubmitting}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                disabled={isSubmitting}
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación"
                    : "Mostrar confirmación"
                }
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {fieldErrors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {isSubmitting ? "Actualizando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
