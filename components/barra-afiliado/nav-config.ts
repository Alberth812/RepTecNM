import type { LucideIcon } from "lucide-react";
import { FileText, Home, User, BookOpen, Mail, LifeBuoy, CreditCard } from "lucide-react";

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
 * Para agregar/quitar/mover un link, solo edita este arreglo: BarraAfiliado.tsx
 * no necesita tocarse.
 */

//

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Inicio", href: "/afiliado/inicio", icon: Home },
      { label: "Seguimiento", href: "/afiliado/seguimiento", icon: Home },
    ],
  },
  {
    title: "Mi Perfil",
    items: [
      { label: "Seguimiento", href: "/afiliado/seguimiento", icon: FileText },
      { label: "Credencial Digital", href: "/afiliado/credencial", icon: CreditCard },
      {
        label: "Mis publicaciones",
        href: "/afiliado/publicaciones",
        icon: FileText,
      },
      {
        label: "Repositorio",
        href: "/repositorio",
        icon: BookOpen,
      },
        href: "/publicaciones",
        icon: FileText,
      },

    ],
  },
  {
    title: "Comunidad",
    items: [
      { label: "Catálogo", href: "/afiliado/catalogo", icon: BookOpen },
      { label: "Mensajería", href: "/afiliado/mensajeria", icon: Mail },
    ],
  },
  {
    title: "Soporte",
    items: [{ label: "Centro de Soporte", href: "/afiliado/soporte", icon: LifeBuoy }],
  },
];

export const ACCOUNT_ITEM: NavItem = {
  label: "Cuenta",
  href: "/afiliado/cuenta",
  icon: User,
};
