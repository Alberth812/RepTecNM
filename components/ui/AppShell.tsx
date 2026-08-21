import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function AppShell({
  activeNav,
  links,
  children,
}: {
  activeNav?: string;
  links: { href: string; label: string; key: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-sand-100">
      <header className="border-b border-sand-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">Afiliados</p>
            <nav className="mt-1 flex gap-4">
              {links.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={
                    "text-sm font-medium " +
                    (activeNav === link.key ? "text-brand-700" : "text-brand-500 hover:text-brand-700")
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
