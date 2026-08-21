"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck, BarChart3, Building2, CalendarCheck, FileText, Flag,
  LayoutDashboard, MessageSquareText, PencilLine, Search, Users, UserCheck,
} from "lucide-react";

import { type Rol } from "@/lib/use-rol";

const MENU_AFILIADO = [
  { href: "/credencial", label: "Mi credencial", icon: BadgeCheck },
  { href: "/catalogo", label: "Catálogo", icon: Search },
  { href: "/repositorio", label: "Repositorio", icon: FileText },
  { href: "/mensajeria", label: "Mensajería", icon: MessageSquareText },
  { href: "/seguimiento", label: "Seguimiento", icon: CalendarCheck },
];

const MENU_ADMIN = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/aprobaciones", label: "Aprobaciones", icon: UserCheck },
  { href: "/afiliados", label: "Afiliados", icon: Users },
  { href: "/institutos", label: "Institutos", icon: Building2 },
  { href: "/moderacion", label: "Moderación", icon: Flag },
  { href: "/reportes", label: "Reportes de docs", icon: Flag },
  { href: "/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/cms", label: "Editor de inicio", icon: PencilLine },
  { href: "/credencial", label: "Mi credencial", icon: BadgeCheck },
  { href: "/catalogo", label: "Catálogo", icon: Search },
  { href: "/repositorio", label: "Repositorio", icon: FileText },
  { href: "/mensajeria", label: "Mensajería", icon: MessageSquareText },
  { href: "/seguimiento-admin", label: "Seguimiento", icon: CalendarCheck },
];

export function SidebarMiembro({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const items = rol === "admin" ? MENU_ADMIN : MENU_AFILIADO;
  const clase = (href: string) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-[#004B87] text-white shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <aside className="sticky top-16 hidden max-h-[calc(100dvh-4rem)] overflow-auto py-8 lg:block">
      <nav className="grid gap-0.5 pr-2">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {rol === "admin" ? "Administración" : "Mi espacio"}
        </p>
        {items.map((it) => (
          <Link key={it.href + it.label} href={it.href} className={clase(it.href)}>
            <it.icon className="h-4 w-4 shrink-0" /> {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
