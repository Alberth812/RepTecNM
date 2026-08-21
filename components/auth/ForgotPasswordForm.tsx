"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput, PrimaryButton, Alert } from "@/components/ui/primitives";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/password/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({ message: null }));

    setLoading(false);
    // La respuesta es siempre el mismo mensaje genérico, exista o no la
    // cuenta (RF-AUTH-011): no hay rama de error que distinguir aquí.
    setMessage(
      data.message ??
        "Si existe una cuenta asociada a este correo, se enviará un correo electrónico para recuperar la contraseña.",
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {message ? <Alert kind="success">{message}</Alert> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

        <PrimaryButton type="submit" loading={loading}>
          Enviar instrucciones
        </PrimaryButton>
      </form>

      <p className="text-center text-sm text-brand-500">
        ¿Ya tienes un código?{" "}
        <Link
          href={`/reset-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="font-medium text-brand-700 hover:underline"
        >
          Ingresarlo aquí
        </Link>
      </p>
    </div>
  );
}
