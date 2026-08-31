"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, UserCheck, Users, BadgeCheck, Building2, Flag, FileText,
  BarChart3, BookOpen, MessageSquareText, GraduationCap, Paintbrush, Settings, LogOut
} from "lucide-react";
import { toast } from "sonner";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/aprobaciones", label: "Aprobaciones", icon: UserCheck },
  { href: "/afiliados", label: "Afiliados", icon: Users },
  { href: "/credenciales", label: "Credenciales", icon: BadgeCheck },
  { href: "/institutos", label: "Institutos", icon: Building2 },
  { href: "/moderacion", label: "Moderación", icon: Flag },
  { href: "/reportes", label: "Reportes de docs", icon: FileText },
  { href: "/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/catalogo", label: "Catálogo", icon: BookOpen },
  { href: "/repositorio", label: "Repositorio", icon: FileText },
  { href: "/seguimiento", label: "Seguimiento", icon: MessageSquareText },
  { href: "/credencial", label: "Mi credencial", icon: GraduationCap },
  { href: "/mensajeria", label: "Mensajería", icon: MessageSquareText },
  { href: "/cms", label: "Editor de inicio", icon: Paintbrush },
  { href: "/publicar-blog", label: "Publicar Blog", icon: BookOpen },
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

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo completo sin enlace */}
      <div className="flex h-16 items-center px-6 border-b">
        <img
          src="/logo.png"
          alt="REP-TecNM"
          className="h-8 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t p-4">
        <Link
          href="/configuracion"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>
        <button
          type="button"
          onClick={salir}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
