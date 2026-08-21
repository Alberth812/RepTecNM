"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Field,
  LinkButton,
  PrimaryButton,
  TextInput,
} from "@/components/ui/primitives";

export function VerifyEmailForm({
  email,
  justCreated,
}: {
  email: string;
  justCreated: boolean;
}) {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    justCreated
      ? "Creamos tu cuenta y enviamos un código de 6 dígitos a tu correo."
      : null,
  );

  const [cooldown, setCooldown] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  function startCooldown(seconds: number) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCooldown(seconds);

    intervalRef.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const response = await fetch("/api/verificar-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message ??
            "El código es inválido o expiró. Solicita uno nuevo.",
        );
        return;
      }

      router.push("/sign-in?verified=1");
    } catch {
      setError("No se pudo verificar el correo. Intenta nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resending || cooldown > 0) {
      return;
    }

    setError(null);
    setInfo(null);
    setResending(true);

    try {
      const response = await fetch("/api/reenviar-verificacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const result = await response.json();

      console.log(response);

      if (response.status === 429) {
        const retryAfterSeconds =
          Number(result.retryAfterSeconds) ||
          Number(response.headers.get("Retry-After")) ||
          0;

        if (retryAfterSeconds > 0) {
          startCooldown(retryAfterSeconds);
        }

        setError(
          result.message ??
            `Debes esperar ${retryAfterSeconds}s antes de solicitar otro código.`,
        );

        return;
      }

      if (!response.ok) {
        setError(
          result.message ?? "No se pudo reenviar el código. Intenta más tarde.",
        );
        return;
      }

      setInfo(
        result.message ??
          "Te enviamos un nuevo código. El anterior ya no es válido.",
      );

      if (result.cooldownSeconds > 0) {
        startCooldown(result.cooldownSeconds);
      }
    } catch {
      setError("No se pudo reenviar el código. Intenta nuevamente más tarde.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? <Alert kind="error">{error}</Alert> : null}
      {info ? <Alert kind="success">{info}</Alert> : null}

      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <Field
          label="Código de verificación"
          htmlFor="otp"
          hint="Ingresa el código de 6 dígitos que enviamos a tu correo."
        >
          <TextInput
            id="otp"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="text-center text-lg tracking-[0.5em]"
          />
        </Field>

        <PrimaryButton
          type="submit"
          loading={loading}
          disabled={otp.length !== 6}
        >
          Verificar correo
        </PrimaryButton>
      </form>

      <div className="text-center">
        <LinkButton
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
        >
          {cooldown > 0
            ? `Reenviar código (espera ${cooldown}s)`
            : resending
              ? "Enviando…"
              : "Reenviar código"}
        </LinkButton>
      </div>
    </div>
  );
}
