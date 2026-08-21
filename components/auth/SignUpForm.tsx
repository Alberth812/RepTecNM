"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  TextInput,
  PrimaryButton,
  Alert,
} from "@/components/ui/primitives";
import { PASSWORD_POLICY_HINT } from "@/lib/password-policy";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // RF-AUTH-005.b — correo ya registrado y verificado.
        setError(data.error ?? "Este correo no está disponible");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "No se pudo completar el registro.");
        return;
      }

      if (data.status === "PENDING_VERIFICATION") {
        // RF-AUTH-005.a — ya existe un registro sin verificar.
        setInfo(data.message);
        router.push(`/verify-email?id=${btoa(email)}`);
        return;
      }

      // RF-AUTH-001 — cuenta creada, código enviado automáticamente.
      router.push(`/verify-email?id=${btoa(email)}&justCreated=1`);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? <Alert kind="error">{error}</Alert> : null}
      {info ? <Alert kind="info">{info}</Alert> : null}

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

      <Field label="Contraseña" htmlFor="password" hint={PASSWORD_POLICY_HINT}>
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

      <PrimaryButton type="submit" loading={loading}>
        Crear cuenta
      </PrimaryButton>
    </form>
  );
}
