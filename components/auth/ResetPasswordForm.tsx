"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Field, TextInput, PrimaryButton, Alert } from "@/components/ui/primitives";
import { PASSWORD_POLICY_HINT } from "@/lib/password-policy";

export function ResetPasswordForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await authClient.emailOtp.resetPassword({ email, otp, password });
    setLoading(false);

    if (resetError) {
      setError(resetError.message ?? "No se pudo restablecer la contraseña. Verifica el código.");
      return;
    }

    router.push("/sign-in?passwordReset=1");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? <Alert kind="error">{error}</Alert> : null}

      <Field label="Correo electrónico" htmlFor="email">
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Código de verificación" htmlFor="otp" hint="El código de 6 dígitos que enviamos a tu correo.">
        <TextInput
          id="otp"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="text-center text-lg tracking-[0.5em]"
        />
      </Field>

      <Field label="Nueva contraseña" htmlFor="password" hint={PASSWORD_POLICY_HINT}>
        <TextInput
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        Restablecer contraseña
      </PrimaryButton>
    </form>
  );
}
