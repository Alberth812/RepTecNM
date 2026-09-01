"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  BadgeCheck,
  Building2,
  Flag,
  FileText,
  BarChart3,
  BookOpen,
  MessageSquareText,
  GraduationCap,
  Paintbrush,
  Settings,
  LogOut,
} from "lucide-react";
import { useRol } from "@/lib/use-rol";

const menuPrincipal = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/aprobaciones", label: "Aprobaciones", icon: UserCheck },
  { href: "/publicar-blog", label: "Publicar Blog", icon: BookOpen },
  { href: "/cms", label: "Editor de inicio", icon: Paintbrush },
];

const menuGestion = [
  { href: "/afiliados", label: "Afiliados", icon: Users },
  { href: "/credencial", label: "Credenciales", icon: BadgeCheck },
  { href: "/institutos", label: "Institutos", icon: Building2 },
  { href: "/moderacion", label: "Moderación", icon: Flag },
];

const menuSistema = [
  { href: "/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function SidebarAdmin() {
  const pathname = usePathname();
  const { rol, nombre, cerrarSesion } = useRol();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="REP-TecNM" className="h-8 w-auto" />
        </div>
      </div>

      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{nombre || "Administrador"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {rol === "admin" ? "Administrador" : "Afiliado"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
            Principal
          </h3>
          <nav className="space-y-1">
            {menuPrincipal.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
            Gestión
          </h3>
          <nav className="space-y-1">
            {menuGestion.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
            Sistema
          </h3>
          <nav className="space-y-1">
            {menuSistema.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-4">
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
