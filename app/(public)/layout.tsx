import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ThemeSwitcher } from "@/components/public/theme-switcher";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-zinc-900 text-zinc-300">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-[11px]">
          <p className="truncate italic">Investigación con propósito, conocimiento con impacto.</p>
          <nav className="flex shrink-0 items-center gap-4">
            <Link href="/catalogo" className="hidden font-semibold tracking-wide hover:text-white sm:block">CATÁLOGO</Link>
            <Link href="/repositorio" className="hidden font-semibold tracking-wide hover:text-white sm:block">REPOSITORIO</Link>
            <Link href="/mensajeria" className="hidden font-semibold tracking-wide hover:text-white md:block">MENSAJERÍA</Link>
            <Link href="/seguimiento" className="hidden font-semibold tracking-wide hover:text-white md:block">SEGUIMIENTO</Link>
            <Link href="/#contacto" className="font-semibold tracking-wide hover:text-white">CONTACTO</Link>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              
            </a>
          </nav>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight">
              REP-<span className="font-light">TecNM</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-700 lg:flex">
            <Link href="/" className="hover:text-primary">Inicio</Link>
            <Link href="/#nosotros" className="hover:text-primary">Nosotros</Link>
            <Link href="/#que-hacemos" className="hover:text-primary">Servicios</Link>
            <Link href="/registro" className="hover:text-primary">Afiliación</Link>
            <Link href="/repositorio" className="hover:text-primary">Vinculación</Link>
            <Link href="/#contacto" className="hover:text-primary">Contacto</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/catalogo" aria-label="Buscar en el catálogo">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeSwitcher />
            <Link href="/dashboard" className="hidden sm:block">
              <Button variant="outline" size="sm">Volver al panel</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Iniciar sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Red de Egresados de Posgrado del TecNM © 2026
      </footer>
    </div>
  );
}
