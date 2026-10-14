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
 label: "Credencial Digital",
 href: "/afiliado/credencial",
 icon: CreditCard,
 },
 {
 label: "Centro de Soporte",
 href: "/afiliado/soporte",
 icon: LifeBuoy,
 },
 ],
 },
];

export const ACCOUNT_ITEM: NavItem = {
 label: "Cuenta",
 href: "/afiliado/cuenta",
 icon: User,
};
