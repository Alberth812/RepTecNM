"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Field, TextInput, PrimaryButton, Alert } from "@/components/ui/primitives";
import { PASSWORD_POLICY_HINT } from "@/lib/password-policy";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });
    setLoading(false);

    if (changeError) {
      setError(changeError.message ?? "No se pudo actualizar la contraseña.");
      return;
    }

    setSuccess("Tu contraseña se actualizó correctamente.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? <Alert kind="error">{error}</Alert> : null}
      {success ? <Alert kind="success">{success}</Alert> : null}

      <Field label="Contraseña actual" htmlFor="currentPassword">
        <TextInput
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </Field>

      <Field label="Nueva contraseña" htmlFor="newPassword" hint={PASSWORD_POLICY_HINT}>
        <TextInput
          id="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Field>

      <Field label="Confirma la nueva contraseña" htmlFor="confirmPassword">
        <TextInput
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Field>

      <PrimaryButton type="submit" loading={loading}>
        Actualizar contraseña
      </PrimaryButton>
    </form>
  );
}
