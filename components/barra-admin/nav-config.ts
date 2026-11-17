import type { LucideIcon } from "lucide-react";
import {
  Home,
  Users,
  FileText,
  Settings,
  MessageSquare,
  LayoutDashboard,
  User,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Inicio", href: "/admin/inicio", icon: Home },
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Gestión",
    items: [
      { label: "Afiliados", href: "/admin/afiliados", icon: Users },
      { label: "Aprobaciones", href: "/admin/aprobaciones", icon: FileText },
      { label: "Publicaciones", href: "/admin/moderacion", icon: FileText },
      { label: "Avisos", href: "/admin/avisos", icon: MessageSquare },
      { label: "Configuración", href: "/admin/configuracion", icon: Settings },
    ],
  },
];

export const ACCOUNT_ITEM: NavItem = {
  label: "Cuenta",
  href: "/admin/cuenta",
  icon: User,
};
