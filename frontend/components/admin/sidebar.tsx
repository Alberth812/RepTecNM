"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, UserCheck, BookOpen, Paintbrush, Settings, LogOut,
  Users, BadgeCheck, Building2, Flag, CalendarCheck, BarChart3
} from "lucide-react";
import { toast } from "sonner";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  estado: "operativo" | "desarrollo";
};

const menuPrincipal: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, estado: "desarrollo" },
  { href: "/aprobaciones", label: "Aprobaciones", icon: UserCheck, estado: "desarrollo" },
  { href: "/publicar-blog", label: "Publicar Blog", icon: BookOpen, estado: "operativo" },
  { href: "/cms", label: "Editor de inicio", icon: Paintbrush, estado: "operativo" },
];

const menuGestion: MenuItem[] = [
  { href: "/afiliados", label: "Afiliados", icon: Users, estado: "desarrollo" },
  { href: "/credenciales", label: "Credenciales", icon: BadgeCheck, estado: "desarrollo" },
  { href: "/institutos", label: "Institutos", icon: Building2, estado: "desarrollo" },
  { href: "/moderacion", label: "Moderación", icon: Flag, estado: "desarrollo" },
  { href: "/seguimiento-admin", label: "Seguimiento", icon: CalendarCheck, estado: "desarrollo" },
];

const menuSistema: MenuItem[] = [
  { href: "/analitica", label: "Analítica", icon: BarChart3, estado: "desarrollo" },
  { href: "/configuracion", label: "Configuración", icon: Settings, estado: "desarrollo" },
];

export function Sidebar() {
  const pathname = usePathname();

  const salir = async () => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      const res = await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
      });

      if (res.ok) {
        toast.success("Sesión cerrada correctamente");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error de conexión al cerrar sesión");
    } finally {
      localStorage.removeItem("rep-rol");
      localStorage.removeItem("rep-usuario");
      localStorage.removeItem("rep-tema");
      window.location.href = "/";
    }
  };

  const renderGrupo = (titulo: string, items: MenuItem[]) => (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {titulo}
      </p>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-[#004B87] text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.estado === "desarrollo" && (
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                }`}
              >
                beta
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <img
          src="/logo.png"
          alt="REP-TecNM"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {renderGrupo("Principal", menuPrincipal)}
          {renderGrupo("Gestión", menuGestion)}
          {renderGrupo("Sistema", menuSistema)}
        </div>
      </nav>

      {/* Pie */}
      <div className="border-t p-4">
        <button
          type="button"
          onClick={salir}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
