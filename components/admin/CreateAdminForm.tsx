"use client";

import { useState } from "react";
import { Field, TextInput, PrimaryButton, Alert } from "@/components/ui/primitives";
import { PASSWORD_POLICY_HINT } from "@/lib/password-policy";

export function CreateAdminForm({ onCreated }: { onCreated: () => void }) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subtype, setSubtype] = useState<"GENERAL" | "CONTENIDO">("CONTENIDO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreCompleto, email, password, subtype }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la cuenta de administrador.");
      return;
    }

    setSuccess(`Cuenta creada para ${email}.`);
    setNombreCompleto("");
    setEmail("");
    setPassword("");
    setSubtype("CONTENIDO");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? <Alert kind="error">{error}</Alert> : null}
      {success ? <Alert kind="success">{success}</Alert> : null}

      <Field label="Nombre completo" htmlFor="nombreCompleto">
        <TextInput
          id="nombreCompleto"
          required
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
        />
      </Field>

      <Field label="Correo electrónico" htmlFor="admin-email">
        <TextInput
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Contraseña" htmlFor="admin-password" hint={PASSWORD_POLICY_HINT}>
        <TextInput
          id="admin-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field label="Subtipo" htmlFor="subtype">
        <select
          id="subtype"
          value={subtype}
          onChange={(e) => setSubtype(e.target.value as "GENERAL" | "CONTENIDO")}
          className="w-full rounded-lg border border-brand-100 bg-white px-3.5 py-2.5 text-brand-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="CONTENIDO">Contenido</option>
          <option value="GENERAL">General</option>
        </select>
      </Field>

      <PrimaryButton type="submit" loading={loading}>
        Crear administrador
      </PrimaryButton>
    </form>
  );
}
