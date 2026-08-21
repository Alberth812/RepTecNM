"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Field,
  TextInput,
  PrimaryButton,
  LinkButton,
  Alert,
} from "@/components/ui/primitives";

export function SignInForm({ initialInfo }: { initialInfo?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info] = useState<string | null>(initialInfo ?? null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      // Cubre, entre otros, el caso RF-AUTH-001: cuenta con correo sin
      // verificar no puede iniciar sesión bajo ninguna circunstancia.

      const errorMessage = signInError.message;

      if (signInError.status === 403) {
        setError(
          "Por favor, verifica tu correo electrónico. Te hemos enviado un enlace de confirmación.",
        );
        return;
      }

      if (!errorMessage) {
        setError("No pudimos iniciar tu sesión. Verifica tus datos.");
      } else if (errorMessage === "Invalid email or password") {
        setError("El correo electrónico o la contraseña son incorrectos.");
      } else if (errorMessage === "User not found") {
        setError("No se encontró ningún usuario con estos datos.");
      } else {
        setError(
          "Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.",
        );
      }
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? <Alert kind="error">{error}</Alert> : null}
      {info ? <Alert kind="success">{info}</Alert> : null}

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

      <Field label="Contraseña" htmlFor="password">
        <TextInput
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <div className="-mt-2 text-right">
        <LinkButton
          type="button"
          onClick={() => router.push("/forgot-password")}
        >
          ¿Olvidaste tu contraseña?
        </LinkButton>
      </div>

      <PrimaryButton type="submit" loading={loading}>
        Iniciar sesión
      </PrimaryButton>
    </form>
  );
}
