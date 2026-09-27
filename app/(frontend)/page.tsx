import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

import { BarraSesionInicio } from "@/components/auth/barra-session-inicio";
import HomePage from "@/components/home/home-page";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <img
              src="/logo.png"
              alt="REP-TecNM"
              className="h-9 w-9 rounded-lg object-cover object-[center_15%] ring-1 ring-border"
            />
            <span className="text-xl font-bold tracking-tight">
              REP-<span className="font-light">TecNM</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-700 lg:flex">
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <Link href="/#nosotros" className="hover:text-primary">
              Nosotros
            </Link>
            <Link href="/#que-hacemos" className="hover:text-primary">
              Servicios
            </Link>
            <Link href="/#afiliacion" className="hover:text-primary">
              Afiliación
            </Link>
            <Link href="/#contacto" className="hover:text-primary">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/*<MenuMovilMiembro />*/}
            <Link href="#" aria-label="Buscar en el catálogo">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            <BarraSesionInicio />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <HomePage />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Red de Egresados de Posgrado del TecNM © 2026
      </footer>
    </div>
  );
}
