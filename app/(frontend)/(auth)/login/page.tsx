import { LoginForm } from "@/components/auth/login-form";
import { getLoginConfig } from "@/payload/globals/get-login-config";

export default async function LoginPage() {
  // Obtenemos solo la configuración del login
  const { imagenFondoUrl } = await getLoginConfig();
  
  return <LoginForm loginImage={imagenFondoUrl} />;
}
