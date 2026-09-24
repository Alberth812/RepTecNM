import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/afiliado/cuenta/change-password-form";
import { requireSession } from "@/lib/auth/session";

export default async function Page() {
  try {
    await requireSession();
  } catch {
    redirect("/login");
  }

  return <ChangePasswordForm />;
}
