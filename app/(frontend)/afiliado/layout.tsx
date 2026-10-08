// app/(frontend)/afiliado/layout.tsx
import { NoAutorizado } from "@/components/auth/no-autorizado";
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";
import { requireAfiliado, requireSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import { redirect } from "next/navigation";

type Args = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Args) => {
  try {
    // Usamos requireSession

    const session = await requireSession();

    if (session.user.role === "ADMIN") {
      <NoAutorizado
        redirectHref="/admin/afiliado"
        redirectLabel="Regresar al dashboard"
      />;
    } else {
      // Entonces es afiliado
      const { afiliado } = await requireAfiliado();
      if (afiliado.membershipStatus === "ACTIVO") {
        return <BarraAfiliado>{children}</BarraAfiliado>;
      } else if(afiliado.membershipStatus === "NO_INICIADA"
        || afiliado.membershipStatus === "PENDIENTE_APROBACION"
        || afiliado.membershipStatus === "REQUIERE_CORRECCION"
      ) {
        redirect("/registro");
      } 
      else {
        return (
          <NoAutorizado
            redirectHref="/"
            redirectLabel="Regresar a inicio"
            description="No tienes permisos para acceder a esta página ya que no estás activo"
          />
        );
      }
    }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) {
        return <NoAutorizado redirectHref="/" />;
      } else throw err;
    } else throw err;
  }
};

export default Layout;
