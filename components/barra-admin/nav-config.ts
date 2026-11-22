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

/**
 * Fuente única de verdad para los links del sidebar.
 * Cada grupo tiene un título opcional (si no lo lleva, no se renderiza nada
 * arriba de sus items, como en el grupo de "Inicio").
 *
 * Para agregar/quitar/mover un link, solo edita este arreglo: BarraAdmin.tsx
 * no necesita tocarse.
 */

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Inicio", href: "/admin/inicio", icon: Home },
      {
        label: "Solicitudes",
        href: "/admin/solicitudes",
        icon: FileText,
      },
      {
        label: "Repositorio",
        href: "/publicaciones",
        icon: FileText,
      },
      {
        label: "Instituciones",
        href: "/admin/instituciones",
        icon: FileText,
      },
      {
        label: "Administradores",
        href: "/admin/admins",
        icon: FileText,
      },
    ],
  },
  {
    title: "Gestión",
    items: [
      {
        label: "Solicitudes de Afiliación",
        href: "/admin/solicitudes",
        icon: Users,
        badge: true,
      },
      { label: "Tickets de Soporte", href: "/admin/soporte", icon: Ticket },
      { label: "Credenciales", href: "/admin/credenciales", icon: CreditCard },
    ],
  },
  {
    title: "Comunicación",
    items: [{ label: "Avisos", href: "/admin/avisos", icon: Megaphone }],
  },
  {
    title: "Catálogo",
    items: [
      {
        label: "Catálogo Profesional",
        href: "/admin/catalogo",
        icon: BookOpen,
      },
    ],
  },
  {
    items: [
      { label: "Dashboard", href: "/admin/estadisticas", icon: FileText },
    ],
  },
];

export const ACCOUNT_ITEM: NavItem = {
  label: "Cuenta",
  href: "/admin/cuenta",
  icon: User,
};
