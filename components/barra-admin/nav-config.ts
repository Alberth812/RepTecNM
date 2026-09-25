import type { LucideIcon } from "lucide-react";
import { FileText, Home, MessageSquare, LifeBuoy, Settings, CreditCard, User } from "lucide-react";

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
    items: [{ label: "Inicio", href: "/admin/inicio", icon: Home }],
  },
  {
    title: "Gestión",
    items: [
      { label: "Solicitudes", href: "/admin/solicitudes", icon: FileText },
      { label: "Tickets de Soporte", href: "/admin/soporte", icon: LifeBuoy },
      { label: "Credenciales", href: "/admin/credenciales", icon: CreditCard },
    ],
  },
  {
    title: "Comunicación",
    items: [
      { label: "Avisos", href: "/admin/avisos", icon: MessageSquare },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configuración", href: "/admin/configuracion", icon: Settings },
    ],
  },
];

export const ACCOUNT_ITEM: NavItem = {
  label: "Cuenta",
  href: "/account",
  icon: User,
};
