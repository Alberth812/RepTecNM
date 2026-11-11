// app/admin/layout.tsx

import type { ReactNode } from "react";

import { NoAutorizado } from "@/components/auth/no-autorizado";

import { BarraAdmin } from "@/components/barra-admin/BarraAdmin";
import { BarraAdminContenido } from "@/components/barra-admin/BarraAdminContenido";

import { getAdministradorPageAccess } from "@/lib/auth/session";

type Args = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Args) {
  const access = await getAdministradorPageAccess();

  if (!access.allowed) {
    return (
      <NoAutorizado
        redirectHref={access.redirectHref}
        redirectLabel={access.redirectLabel}
        description={access.description}
      />
    );
  }

  const { profile } = access.data;

  if (profile.subtype === "GENERAL") {
    return <BarraAdmin>{children}</BarraAdmin>;
  }

  return <BarraAdminContenido>{children}</BarraAdminContenido>;
}
