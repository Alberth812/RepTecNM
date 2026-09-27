import type { LucideIcon } from "lucide-react";
import {
  Home,
  FileText,
  Megaphone,
  Image as ImageIcon,
  Globe,
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
    ],
  },
  {
    title: "Contenido",
    items: [
      {
        label: "Publicaciones",
        href: "/contenido/collections/posts",
        icon: FileText,
      },
      {
        label: "Avisos",
        href: "/contenido/collections/avisos",
        icon: Megaphone,
      },
      {
        label: "Media",
        href: "/contenido/collections/media",
        icon: ImageIcon,
      },
      {
        label: "Página de inicio",
        href: "/contenido/globals/home",
        icon: Globe,
      },
    ],
  },
];

// Item fijo al fondo del sidebar (arriba del botón de cerrar sesión).
export const ACCOUNT_ITEM: NavItem = {
  label: "Cuenta",
  href: "/admin/cuenta",
  icon: User,
};
