// app/(payload)/layout.tsx
import type { ServerFunctionClient } from "payload";
import "@payloadcms/next/css";
import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./contenido/importMap.js";
import "./custom.scss";
import { BarraAdmin } from "@/components/barra-admin/BarraAdmin.js";

type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    <BarraAdmin>{children}</BarraAdmin>
  </RootLayout>
);

export default Layout;
