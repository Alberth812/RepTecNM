"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PencilLine,
  Search,
  Settings,
  Users,
  UserCheck,
} from "lucide-react";

import { cargarMensajes } from "@/lib/mensajes";
import { cargarNotificaciones, leerLeidas } from "@/lib/notificaciones";
import { BadgeEstado } from "@/components/public/badge-estado";
import { useRol, type Rol } from "@/lib/use-rol";

export async function contarMensajesNoLeidos(): Promise<number> {
  if (typeof window === "undefined") return 0;

  const rol = localStorage.getItem("rep-rol");
  if (rol !== "admin" && rol !== "afiliado") return 0;

  const mensajes = await cargarMensajes();

  //return mensajes.filter((m) => !m.leido && m.para.rol === rol).length;
  return mensajes.filter((m) => !m.leido).length;
}

export const MENU_AFILIADO = [
  { href: "/credencial", label: "Mi credencial", icon: BadgeCheck },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/catalogo", label: "Catálogo", icon: Search },
  { href: "/repositorio", label: "Repositorio", icon: FileText },
  { href: "/mensajeria", label: "Mensajería", icon: MessageSquareText },
  { href: "/seguimiento", label: "Seguimiento", icon: CalendarCheck },
  { href: "/ajustes", label: "Configuración", icon: Settings },
];

export const MENU_ADMIN = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/aprobaciones", label: "Aprobaciones", icon: UserCheck },
  { href: "/afiliados", label: "Afiliados", icon: Users },
  { href: "/credenciales", label: "Credenciales", icon: CreditCard },
  { href: "/institutos", label: "Institutos", icon: Building2 },
  { href: "/moderacion", label: "Moderación", icon: Flag },
  { href: "/reportes", label: "Reportes de docs", icon: Flag },
  { href: "/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/cms", label: "Editor de inicio", icon: PencilLine },
  { href: "/credencial", label: "Mi credencial", icon: BadgeCheck },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/catalogo", label: "Catálogo", icon: Search },
  { href: "/repositorio", label: "Repositorio", icon: FileText },
  { href: "/mensajeria", label: "Mensajería", icon: MessageSquareText },
  { href: "/seguimiento-admin", label: "Seguimiento", icon: CalendarCheck },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function SidebarMiembro({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const { nombre } = useRol();
  const [noLeidas, setNoLeidas] = useState(0);
  const [msgNoLeidas, setMsgNoLeidas] = useState(0);

  useEffect(() => {
    if (rol === "visitante") {
      setNoLeidas(0);
      setMsgNoLeidas(0);
      return;
    }

    let cancelado = false;

    async function cargarContadores() {
      if (rol === "afiliado") {
        const leidas = leerLeidas();
        const notificaciones = cargarNotificaciones();

        if (!cancelado) {
          setNoLeidas(
            notificaciones.filter((n) => !leidas.includes(n.id)).length,
          );
        }
      } else {
        setNoLeidas(0);
      }

      const mensajes = await contarMensajesNoLeidos();

      if (!cancelado) {
        setMsgNoLeidas(mensajes);
      }
    }

    void cargarContadores();

    return () => {
      cancelado = true;
    };
  }, [rol, pathname]);

  const nombreReal =
    nombre ||
    (rol === "admin"
      ? "Administración RepTecNM"
      : "María Fernanda López Herrera");
  const iniciales = nombreReal
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const items = (rol === "admin" ? MENU_ADMIN : MENU_AFILIADO).filter(
    (it) => it.label !== "Configuración",
  );

  const clase = (href: string) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-[#004B87] text-white shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  const salir = () => {
    localStorage.removeItem("rep-rol");
    localStorage.removeItem("rep-usuario");
    localStorage.removeItem("rep-tema");
    window.location.href = "/";
  };

  return (
    <aside className="sticky top-24 hidden min-w-0 lg:block">
      <div className="flex h-[calc(100dvh-7.5rem)] min-h-[480px] flex-col rounded-2xl border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-3 border-b px-2 pb-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#004B87] text-sm font-bold text-white">
            {iniciales}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{nombreReal}</p>
            {rol === "admin" ? (
              <span className="mt-0.5 inline-flex rounded-full bg-[#004B87]/10 px-2 py-0.5 text-[10px] font-semibold text-[#004B87]">
                ADMINISTRACIÓN
              </span>
            ) : (
              <BadgeEstado estado="ACTIVO" />
            )}
          </div>
        </div>

        <nav className="grid flex-1 content-start gap-0.5 overflow-y-auto pt-3">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {rol === "admin" ? "Administración" : "Mi espacio"}
          </p>
          {items.map((it) => (
            <Link
              key={it.href + it.label}
              href={it.href}
              className={clase(it.href)}
            >
              <it.icon className="h-4 w-4 shrink-0" /> {it.label}
              {it.label === "Notificaciones" && noLeidas > 0 && (
                <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {noLeidas}
                </span>
              )}
              {it.label === "Mensajería" && msgNoLeidas > 0 && (
                <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {msgNoLeidas}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-3 grid gap-2 border-t pt-3">
          <Link
            href={rol === "admin" ? "/configuracion" : "/ajustes"}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#004B87]/10 px-4 py-2.5 text-sm font-semibold text-[#004B87] transition-colors hover:bg-[#004B87]/20"
          >
            <Settings className="h-4 w-4" /> Configuración
          </Link>
          <button
            type="button"
            onClick={salir}
            className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
