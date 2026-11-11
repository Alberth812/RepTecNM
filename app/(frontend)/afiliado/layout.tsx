// app/(frontend)/afiliado/layout.tsx

import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { NoAutorizado } from "@/components/auth/no-autorizado";
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";

import { getAfiliadoPageAccess } from "@/lib/auth/session";

import { REGISTRATION_STATUSES } from "@/lib/auth/auth-types";

type Args = {
  children: ReactNode;
};

export default async function AfiliadoLayout({ children }: Args) {
  const access = await getAfiliadoPageAccess(["ACTIVO"]);

  if (!access.allowed) {
    /*
     * Si es afiliado, pero todavía no ha terminado
     * el proceso de registro, enviarlo a /registro.
     */
    if (
      access.reason === "MEMBERSHIP_STATUS" &&
      access.membershipStatus &&
      REGISTRATION_STATUSES.some((status) => status === access.membershipStatus)
    ) {
      redirect("/registro");
    }

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
