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

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: "Inicio", href: "/afiliado/inicio", icon: Home }],
  },
  {
    title: "Mi Perfil",
    items: [
      { label: "Seguimiento", href: "/afiliado/seguimiento", icon: FileText },
      { label: "Credencial Digital", href: "/afiliado/credencial", icon: CreditCard },
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
  href: "/account",
  icon: User,
};
