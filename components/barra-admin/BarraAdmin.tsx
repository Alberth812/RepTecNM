"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useLogoutMutation } from "@/lib/hooks/use-auth";
import { NAV_GROUPS, ACCOUNT_ITEM, type NavItem } from "./nav-config";
import "./barra-admin.css";

const STORAGE_KEY = "barra-admin:collapsed";
const MOBILE_QUERY = "(max-width: 768px)";

type BarraAdminProps = {
  children: ReactNode;
};

export function BarraAdmin({ children }: BarraAdminProps) {
  const pathname = usePathname();

  // Se obtiene el localStorage antes del primer render
  // para evitar el salto visual. Por defecto es `false` (abierto).
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const isMobile = window.matchMedia(MOBILE_QUERY).matches;
      if (isMobile) return true;

      const stored = window.localStorage.getItem(STORAGE_KEY);
      // Si hay un valor guardado lo usamos, de lo contrario por defecto es abierto (false)
      return stored !== null ? stored === "true" : false;
    } catch {
      return false;
    }
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Marcamos como listo para habilitar las transiciones CSS
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Bloquea el scroll del fondo mientras el drawer está abierto en mobile.
  useEffect(() => {
    if (!ready) return;
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    document.body.style.overflow = isMobile && !collapsed ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [collapsed, ready]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // no-op
      }
      return next;
    });
  }, []);

  const closeOnMobileNavigate = useCallback(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setCollapsed(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // no-op
      }
    }
  }, []);

  const shellClassName = [
    "ba-shell",
    collapsed && "ba-shell--collapsed",
    !ready && "ba-shell--no-transition",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName}>
      <div
        className="ba-backdrop"
        onClick={toggleCollapsed}
        aria-hidden="true"
      />

      <button
        type="button"
        className="ba-mobile-toggle"
        onClick={toggleCollapsed}
        aria-label="Abrir barra lateral"
      >
        <PanelLeftOpen size={20} />
      </button>

      <aside className="ba-sidebar" aria-label="Navegación principal">
        <div className="ba-header">
          {!collapsed && <span className="ba-logo">REP TecNM</span>}
          <button
            type="button"
            className="ba-toggle"
            onClick={toggleCollapsed}
            aria-label={
              collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
            }
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
        </div>

        <nav className="ba-nav">
          {NAV_GROUPS.map((group, i) => (
            <div className="ba-group" key={group.title ?? `grupo-${i}`}>
              {group.title && !collapsed && (
                <p className="ba-group-title">{group.title}</p>
              )}
              <ul className="ba-list">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.href + item.label}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    onNavigate={closeOnMobileNavigate}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="ba-footer">
          <ul className="ba-list">
            <SidebarLink
              item={ACCOUNT_ITEM}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={closeOnMobileNavigate}
            />
          </ul>
          <LogoutButton collapsed={collapsed} />
        </div>
      </aside>

      <main className="ba-content">{children}</main>
    </div>
  );
}

type SidebarLinkProps = {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
};

function SidebarLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: SidebarLinkProps) {
  const Icon = item.icon;
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={"ba-link" + (isActive ? " ba-link--active" : "")}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={18} className="ba-icon" />
        {!collapsed && <span className="ba-label">{item.label}</span>}
      </Link>
    </li>
  );
}

type LogoutButtonProps = {
  collapsed: boolean;
};

function LogoutButton({ collapsed }: LogoutButtonProps) {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="ba-link ba-logout"
      title={collapsed ? "Cerrar sesión" : undefined}
    >
      {logoutMutation.isPending ? (
        <Loader2 size={18} className="ba-icon ba-icon--spin" />
      ) : (
        <LogOut size={18} className="ba-icon" />
      )}
      {!collapsed && <span className="ba-label">Cerrar sesión</span>}
    </button>
  );
}
