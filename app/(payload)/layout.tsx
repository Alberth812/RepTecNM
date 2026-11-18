
import type { ServerFunctionClient } from "payload";
import "@payloadcms/next/css";
import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./contenido/importMap.js";
import "./custom.scss";

import { BarraAdmin } from "@/components/barra-admin/BarraAdmin";
import { BarraAdminContenido } from "@/components/barra-admin/BarraAdminContenido";
import { NoAutorizado } from "@/components/auth/no-autorizado";

import { getAdministradorPageAccess } from "@/lib/auth/session";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = async ({ children }: Args) => {
  const access = await getAdministradorPageAccess();

  let componente: React.ReactNode;

  if (!access.allowed) {
    componente = (
      <NoAutorizado
        redirectHref={access.redirectHref}
        redirectLabel={access.redirectLabel}
        description={access.description}
      />
    );
  } else {
    const { profile } = access.data;

    if (profile.subtype === "GENERAL") {
      componente = <BarraAdmin>{children}</BarraAdmin>;
    } else {
      componente = <BarraAdminContenido>{children}</BarraAdminContenido>;
    }
  }

  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {componente}
    </RootLayout>
  );
};

export default Layout;
