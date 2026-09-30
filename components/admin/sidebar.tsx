"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, 
  LayoutDashboard, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Settings, 
  Paintbrush
, BadgeCheck, MessageSquareText , Flag, Users, Building2, BarChart3, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/aprobaciones", label: "Aprobaciones", icon: UserCheck },
  { href: "/afiliados", label: "Afiliados", icon: Users },
  { href: "/credenciales", label: "Credenciales", icon: CreditCard },
  { href: "/institutos", label: "Institutos", icon: Building2 },
  { href: "/moderacion", label: "Moderación", icon: Flag },
  { href: "/reportes", label: "Reportes de docs", icon: Flag },
  { href: "/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/catalogo", label: "Catálogo", icon: BookOpen },
  { href: "/repositorio", label: "Repositorio", icon: FileText },
  { href: "/seguimiento-admin", label: "Seguimiento", icon: GraduationCap },
  { href: "/credencial", label: "Mi credencial", icon: BadgeCheck },
  { href: "/mensajeria", label: "Mensajería", icon: MessageSquareText },
  { href: "/cms", label: "Editor de inicio", icon: Paintbrush },
];

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  const salir = () => {
    localStorage.removeItem("rep-rol");
    localStorage.removeItem("rep-usuario");
    window.location.href = "/";
  };

  return (
    <div className={cn("flex h-full flex-col bg-background border-r", isMobile && "border-none")}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Image
          src="/logo.png"
          alt="REP-TecNM - Red de Egresados de Posgrado del Tecnológico Nacional de México"
          width={150}
          height={40}
          className="h-auto w-auto object-contain"
        />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t">
        <Link
          href="/configuracion"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>
        <button
          type="button"
          onClick={salir}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}