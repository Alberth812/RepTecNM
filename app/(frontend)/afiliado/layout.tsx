import type { ReactNode } from "react";
import { NoAutorizado } from "@/components/auth/no-autorizado";
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";
import { getAfiliadoPageAccess } from "@/lib/auth/session";

type Args = {
  children: ReactNode;
};

export default async function AfiliadoLayout({ children }: Args) {
  // Verificamos que sea un afiliado, pero SIN restringir por estado de membresía aquí.
  // Esto evita bucles de redirección. Las páginas internas (ej. dashboard) 
  // se encargarán de requerir el estado "ACTIVO" si es necesario.
  const access = await getAfiliadoPageAccess();

  if (!access.allowed) {
    return (
      <NoAutorizado
        redirectHref={access.redirectHref}
        redirectLabel={access.redirectLabel}
        description={access.description}
      />
    );
  }

  return <BarraAfiliado>{children}</BarraAfiliado>;
}
