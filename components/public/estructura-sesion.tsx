"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { CascoAdmin } from "@/components/admin/casco-admin";
import { SidebarMiembro } from "./sidebar-miembro";
import { useRol } from "@/lib/use-rol";

const RUTAS_CON_MENU = ["/credencial", "/catalogo", "/repositorio", "/mensajeria", "/seguimiento"];

export function EstructuraSesion({ children }: { children: ReactNode }) {
  const { rol } = useRol();
  const pathname = usePathname();

  if (rol === "admin") return <CascoAdmin>{children}</CascoAdmin>;

  const conMenu = rol === "afiliado" && RUTAS_CON_MENU.some((r) => pathname.startsWith(r));
  if (!conMenu) return <>{children}</>;

  return (
    <div className="mx-auto grid w-full max-w-[1600px] items-start gap-6 px-4 py-6 lg:grid-cols-[230px_1fr]">
      <SidebarMiembro rol={rol} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
