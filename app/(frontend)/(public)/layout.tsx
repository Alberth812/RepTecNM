import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { BarraSesion } from "@/components/public/barra-sesion";
import { LogoResponsivo } from "@/components/public/logo-responsivo";
import { MenuMovilMiembro } from "@/components/public/menu-movil-miembro";
import { MenuMovilPublico } from "@/components/public/menu-movil-publico";
import { GuardiaPublica } from "@/components/public/guardia-publica";
import { SoloNoAdmin } from "@/components/public/solo-no-admin";
import { SoloVisitante } from "@/components/public/solo-visitante";
import { FranjaSuperior } from "@/components/public/franja-superior";
import { AvisosFlotantes } from "@/components/public/avisos-flotantes";
import { EstructuraSesion } from "@/components/public/estructura-sesion";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <FranjaSuperior>
        <div className="bg-zinc-900 text-zinc-300">
          <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-[11px]">
            <p className="truncate italic">
              Investigación con propósito, conocimiento con impacto.
            </p>
            <nav className="flex shrink-0 items-center gap-4">
              <Link
                href="/catalogo"
                className="hidden font-semibold tracking-wide hover:text-white sm:block"
              >
                CATÁLOGO
              </Link>
              <Link
                href="/repositorio"
                className="hidden font-semibold tracking-wide hover:text-white sm:block"
              >
                REPOSITORIO
              </Link>
              <Link
                href="/mensajeria"
                className="hidden font-semibold tracking-wide hover:text-white md:block"
              >
                MENSAJERÍA
              </Link>
              <Link
                href="/seguimiento"
                className="hidden font-semibold tracking-wide hover:text-white md:block"
              >
                SEGUIMIENTO
              </Link>
              <Link
                href="/#contacto"
                className="font-semibold tracking-wide hover:text-white"
              >
                CONTACTO
              </Link>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              ></a>
            </nav>
          </div>
        </div>
      </FranjaSuperior>

      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
          <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
            <Link href="/" className="flex items-center">
            {/* 
              CAMBIO: Logo profesional REP-TecNM
              - Imagen sin fondo (PNG transparente)
              - Sin marco ni bordes para preservar el diseño
              - Sin texto duplicado (la imagen ya incluye el texto)
              - Altura 32px (h-8) para proporción correcta en header
            */}
            <img
              src="/logo.png"
              alt="REP-TecNM - Red de Egresados de Posgrado del Tecnológico Nacional de México"
              className="h-8 w-auto object-contain"
            />
          </Link>

                        <nav className="hidden lg:flex flex-wrap items-center gap-5 text-sm font-medium text-zinc-700">
                            <Link href="/" className="hover:text-primary">
                              Inicio
                            </Link>
                            <Link href="/#nosotros" className="hover:text-primary">
                              Nosotros
                            </Link>
                            <Link href="/#que-hacemos" className="hover:text-primary">
                              Servicios
                            </Link>
                            <Link href="/catalogo" className="hover:text-primary">
                              Catálogo
                            </Link>
                            <Link href="/#afiliacion" className="hover:text-primary">
                              Afiliación
                            </Link>
                            <Link href="/#contacto" className="hover:text-primary">
                              Contacto
                            </Link>
                          </nav>

            <div className="flex items-center gap-2">
              <MenuMovilPublico />
              <MenuMovilMiembro />
              <Link href="/catalogo" aria-label="Buscar en el catálogo">
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>
              <BarraSesion />
            </div>
          </div>
        </header>

      <AvisosFlotantes />

      <main className="flex-1">
        <GuardiaPublica>
          <EstructuraSesion>{children}</EstructuraSesion>
        </GuardiaPublica>
      </main>

      <SoloNoAdmin>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          Red de Egresados de Posgrado del TecNM © 2026
        </footer>
      </SoloNoAdmin>
    </div>
  );
}
