import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-primary">
            {/* CAMBIO: Logo profesional completo sin marcos ni texto duplicado.
        * La imagen /logo.png ya contiene el texto "REP-TecNM" integrado.
        * Se eliminaron las clases 'rounded', 'ring' y 'border' para que la imagen 
        * sin fondo se muestre de forma limpia y profesional, respetando su diseño original.
        * Se usa el componente Image de Next.js para optimización automática.
        */}
        <Image 
          src="/logo.png" 
          alt="REP-TecNM - Red de Egresados de Posgrado del Tecnológico Nacional de México" 
          width={180} 
          height={50} 
          className="h-auto w-auto object-contain" 
          priority 
        />
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-700 lg:flex">
            <Link href="/" className="hover:text-primary">Inicio</Link>
            <Link href="/#nosotros" className="hover:text-primary">Nosotros</Link>
            <Link href="/#que-hacemos" className="hover:text-primary">Servicios</Link>
            <Link href="/catalogo" className="hover:text-primary">Catálogo</Link>
            <Link href="/#afiliacion" className="hover:text-primary">Afiliación</Link>
            <Link href="/#contacto" className="hover:text-primary">Contacto</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/catalogo" aria-label="Buscar en el catálogo">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Iniciar sesión</Button>
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
