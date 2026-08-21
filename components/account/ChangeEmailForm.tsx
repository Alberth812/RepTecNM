"use client";

import { useState } from "react";
import {
  Field,
  TextInput,
  PrimaryButton,
  SecondaryButton,
  Alert,
} from "@/components/ui/primitives";

type Step = "request" | "confirm";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [step, setStep] = useState<Step>("request");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRequest(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/account/change-email/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, currentPassword }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo iniciar el cambio de correo.");
      return;
    }

    setStep("confirm");
  }

  async function handleConfirm(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/account/change-email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, otp }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo confirmar el cambio de correo.");
      return;
    }

    setSuccess(
      "Tu correo de inicio de sesión se actualizó. Úsalo la próxima vez que inicies sesión.",
    );
    setStep("request");
    setNewEmail("");
    setCurrentPassword("");
    setOtp("");
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-brand-500">
        Correo actual:{" "}
        <span className="font-medium text-brand-900">{currentEmail}</span>
      </p>

      {error ? <Alert kind="error">{error}</Alert> : null}
      {success ? <Alert kind="success">{success}</Alert> : null}

      {step === "request" ? (
        <form onSubmit={handleRequest} className="flex flex-col gap-5">
          <Field label="Nuevo correo electrónico" htmlFor="newEmail">
            <TextInput
              id="newEmail"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Field>
          <Field
            label="Contraseña actual"
            htmlFor="currentPassword"
            hint="Confirma que eres tú antes de continuar."
          >
            <TextInput
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <PrimaryButton type="submit" loading={loading}>
            Enviar código al nuevo correo
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="flex flex-col gap-5">
          <Field
            label="Código de verificación"
            htmlFor="otp"
            hint={`Enviamos un código de 6 dígitos a ${newEmail}.`}
          >
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
          <div className="flex gap-3">
            <SecondaryButton type="button" onClick={() => setStep("request")}>
              Volver
            </SecondaryButton>
            <PrimaryButton type="submit" loading={loading}>
              Confirmar
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}
