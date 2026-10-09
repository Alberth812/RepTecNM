// app/admin/layout.tsx
import { NoAutorizado } from "@/components/auth/no-autorizado";
import { BarraAdmin } from "@/components/barra-admin/BarraAdmin";
import { BarraAdminContenido } from "@/components/barra-admin/BarraAdminContenido";
import { requireAdministrador, requireSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";

type Args = { children: React.ReactNode };

const Layout = async ({ children }: Args) => {
  try {
    // Usamos requireSession
    const session = await requireSession();

    if (session.user.role === "AFILIADO") {
      <NoAutorizado
        redirectHref="/afiliado/inicio"
        redirectLabel="Regresar al dashboard"
      />;
    } else {
      // Entonces es admin
      const { profile } = await requireAdministrador();
      if (profile.subtype === "GENERAL") {
        return <BarraAdmin>{children}</BarraAdmin>;
      } else {
        return <BarraAdminContenido>{children}</BarraAdminContenido>;
      }
    }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403 || err.status === 401) {
        return <NoAutorizado redirectHref="/" />;
      } else throw err;
    } else throw err;
  }
};

export default Layout;
