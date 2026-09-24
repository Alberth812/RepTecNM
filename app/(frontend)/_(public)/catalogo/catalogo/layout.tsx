import { getCurrentSession } from "@/lib/auth/session";
import { PublicLayout } from "@/components/public/public-layout";
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";
import { BarraAdmin } from "@/components/barra-admin/BarraAdmin";

export default async function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    // Visitante: layout público
    return <PublicLayout>{children}</PublicLayout>;
  }

  const esAdmin = session.user.rol === "ADMINISTRADOR";
  const esAfiliado = session.user.rol === "AFILIADO";

  if (esAdmin) {
    return <BarraAdmin>{children}</BarraAdmin>;
  }

  if (esAfiliado) {
    return <BarraAfiliado>{children}</BarraAfiliado>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
