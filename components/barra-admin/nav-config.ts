import type { LucideIcon } from "lucide-react";
import {
  Home,
  FileText,
  Users,
  Ticket,
  CreditCard,
  Megaphone,
  BookOpen,
  User,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Inicio", href: "/admin/inicio", icon: Home },
      { label: "Repositorio", href: "/publicaciones", icon: FileText },
    ],
  },
  {
    title: "Gestión",
    items: [
      { 
        label: "Solicitudes de Afiliación", 
        href: "/admin/solicitudes", 
        icon: Users,
        badge: true 
      },
      { label: "Tickets de Soporte", href: "/admin/soporte", icon: Ticket },
      { label: "Credenciales", href: "/admin/credenciales", icon: CreditCard },
    ],
  },
  {
    title: "Comunicación",
    items: [
      { label: "Avisos", href: "/admin/avisos", icon: Megaphone },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { label: "Catálogo Profesional", href: "/admin/catalogo", icon: BookOpen },
    ],
  },
];

export const ACCOUNT_ITEM: NavItem = {
  label: "Cuenta",
  href: "/admin/cuenta",
  icon: User,
};
