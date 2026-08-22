import Link from "next/link";
import { AuthCard } from "@/components/ui/primitives";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const params = await searchParams;
  const initialInfo = params.verified === "1" ? "Tu correo fue verificado. Ya puedes iniciar sesión." : null;

  return (
    <AuthCard
      eyebrow="Afiliados"
      title="Inicia sesión"
      subtitle="Ingresa con tu correo y contraseña."
      footer={
        <p className="text-brand-500">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/sign-up" className="font-medium text-brand-700 hover:underline">
            Regístrate
          </Link>
        </p>
      }
    >
      <SignInForm initialInfo={initialInfo} />
    </AuthCard>
  );
}
