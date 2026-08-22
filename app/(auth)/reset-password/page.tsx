import { AuthCard } from "@/components/ui/primitives";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard eyebrow="Afiliados" title="Elige una nueva contraseña" subtitle="Ingresa el código que recibiste y tu nueva contraseña.">
      <ResetPasswordForm initialEmail={params.email ?? ""} />
    </AuthCard>
  );
}
