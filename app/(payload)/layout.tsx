// app/(payload)/layout.tsx
import type { ServerFunctionClient } from "payload";
import "@payloadcms/next/css";
import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./contenido/importMap.js";
import "./custom.scss";

import { BarraAdmin } from "@/components/barra-admin/BarraAdmin";
import { BarraAdminContenido } from "@/components/barra-admin/BarraAdminContenido";
import { requireAdministrador, requireSession } from "@/lib/auth/session";
import { NoAutorizado } from "@/components/auth/no-autorizado";
import { ApiError } from "@/lib/errors";

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
  let componente: React.ReactNode;

  try {
    const session = await requireSession();

    if (session.user.role === "AFILIADO") {
      componente = (
        <NoAutorizado
          redirectHref="/afiliado/inicio"
          redirectLabel="Regresar al dashboard"
        />
      );
    } else {
      const { profile } = await requireAdministrador();

      if (profile.subtype === "GENERAL") {
        componente = <BarraAdmin>{children}</BarraAdmin>;
      } else {
        componente = <BarraAdminContenido>{children}</BarraAdminContenido>;
      }
    }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) {
        componente = <NoAutorizado redirectHref="/" />;
      } else {
        throw err;
      }
    } else {
      throw err;
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
