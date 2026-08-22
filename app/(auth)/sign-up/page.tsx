import Link from "next/link";
import { AuthCard } from "@/components/ui/primitives";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthCard
      eyebrow="Afiliados"
      title="Crea tu cuenta"
      subtitle="Regístrate con tu correo electrónico para comenzar tu proceso de afiliación."
      footer={
        <p className="text-brand-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/sign-in" className="font-medium text-brand-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
