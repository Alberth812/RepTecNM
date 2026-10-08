// app/(frontend)/afiliado/layout.tsx
import { NoAutorizado } from "@/components/auth/no-autorizado";
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";
import { requireAfiliado, requireSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";

type Args = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Args) => {
  try {
    const { session, afiliado } = await requireAfiliado();

    if (session.user.role === "ADMIN") {
      <NoAutorizado
        redirectHref="/admin/afiliado"
        redirectLabel="Regresar al dashboard"
      />;
    }
    //
    return <>{children}</>;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) {
        return <NoAutorizado redirectHref="/" />;
      }
    }
  }

  return <BarraAfiliado>{children}</BarraAfiliado>;
};

export default Layout;
