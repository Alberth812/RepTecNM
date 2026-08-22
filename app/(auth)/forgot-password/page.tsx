import { AuthCard } from "@/components/ui/primitives";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Afiliados"
      title="Recupera tu contraseña"
      subtitle="Ingresa tu correo y te enviaremos instrucciones si existe una cuenta asociada."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
