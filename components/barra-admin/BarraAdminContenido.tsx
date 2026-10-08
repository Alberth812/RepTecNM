"use client";

import { Loader2, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import "./barra-admin.css";
import { ACCOUNT_ITEM, NAV_GROUPS, type NavItem } from "./nav-config-contenido";

const STORAGE_KEY = "barra-admin:collapsed";
// Debe coincidir con el breakpoint usado en barra-admin.css
const MOBILE_QUERY = "(max-width: 768px)";

type BarraAdminContenidoProps = {
  children: ReactNode;
};

export function BarraAdminContenido({ children }: BarraAdminContenidoProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  // Evita animar el ancho/posición la primera vez que se lee el valor guardado.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;

    try {
      if (isMobile) {
        // En mobile siempre inicia cerrado (solo se ve el botón flotante),
        // sin importar lo que haya quedado guardado desde escritorio.
        setCollapsed(true);
      } else {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) setCollapsed(stored === "true");
      }
    } catch {
      // localStorage no disponible (SSR, modo privado, etc.) -> se ignora.
    }

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
        // Si falla el guardado, el sidebar sigue funcionando en memoria.
      }
      return next;
    });
  }, []);

  // Cierra el sidebar al navegar, pero solo en mobile: en desktop es
  // persistente y no debe colapsarse solo por dar clic en un link.
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
      {/* Fondo oscuro detrás del sidebar cuando está abierto en mobile */}
      <div
        className="ba-backdrop"
        onClick={toggleCollapsed}
        aria-hidden="true"
      />

      {/* Botón flotante: solo visible en mobile cuando el sidebar está cerrado */}
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const { error } = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });

      if (error) {
        console.error("Logout failed:", error);
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="ba-link ba-logout"
      title={collapsed ? "Cerrar sesión" : undefined}
    >
      {isLoggingOut ? (
        <Loader2 size={18} className="ba-icon ba-icon--spin" />
      ) : (
        <LogOut size={18} className="ba-icon" />
      )}

      {!collapsed && (
        <span className="ba-label">
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </span>
      )}
    </button>
  );
}
