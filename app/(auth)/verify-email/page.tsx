import { AuthCard } from "@/components/ui/primitives";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; justCreated?: string }>;
}) {
  const params = await searchParams;
  const email = params.id ? atob(params.id) : "";

  return (
    <AuthCard
      eyebrow="Afiliados"
      title="Verifica tu correo"
      subtitle={
        email
          ? `Enviamos un código a ${email}.`
          : "Ingresa el código que recibiste por correo."
      }
    >
      <VerifyEmailForm email={email} justCreated={params.justCreated === "1"} />
    </AuthCard>
  );
}
