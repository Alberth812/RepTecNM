import { redirect } from "next/navigation";

export default function AdminMensajeriaRedirect() {
  // Redirigir al inicio del panel de admin, ya que esta sección no existe para este rol
  redirect("/admin/inicio");
}
