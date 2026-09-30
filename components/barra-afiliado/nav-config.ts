import type { LucideIcon } from "lucide-react";
import { FileText, Home, User, BookOpen, Mail, LifeBuoy } from "lucide-react";

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
 * Cada grupo tiene un título opcional.
 * Para agregar/quitar/mover un link, solo edita este arreglo.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Inicio", href: "/afiliado/inicio", icon: Home }
    ],
  },
  {
    items: [
      {
        label: "Seguimiento",
        href: "/afiliado/seguimiento",
        icon: FileText,
      },
      {
        label: "Mensajería",
        href: "/afiliado/mensajeria",
        icon: Mail,
      },
      {
        label: "Catálogo Profesional",
        href: "/afiliado/catalogo",
        icon: BookOpen,
      },
      {
        label: "Mis Publicaciones",
        href: "/afiliado/publicaciones",
        icon: FileText,
      },
      {
        label: "Centro de Soporte",
        href: "/afiliado/soporte",
        icon: LifeBuoy,
      },
    ],
  },
];

// Item fijo al fondo del sidebar (arriba del botón de cerrar sesión).
export const ACCOUNT_ITEM: NavItem = {
  label: "Cuenta",
  href: "/afiliado/cuenta",
  icon: User,
};
