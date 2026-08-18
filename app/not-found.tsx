"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

const MENSAJES = [
  "Parece que buscabas algo... pero ¿qué será? Esta ruta no existe en nuestro repositorio.",
  "Error 404: esta página se tituló y no nos dejó el certificado.",
  "Revisamos todo el catálogo y esta página no aparece ni con búsqueda por relevancia.",
  "Esta página solicitó una sabática y no está registrada en el sistema.",
  "Ni con QR ni con folio: este destino no está verificado en la red.",
  "Estamos trabajando en ello. Mientras tanto, el catálogo sigue abierto para ti.",
];

export default function NotFoundPage() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    setIndice(Math.floor(Math.random() * MENSAJES.length));
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative">
        <p className="font-serif text-[7rem] font-bold leading-none text-[#004B87]/15 md:text-[9rem]">
          404
        </p>
        <GraduationCap className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-[#004B87]" />
      </div>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">{MENSAJES[indice]}</p>
      <button
        onClick={() => setIndice((i) => (i + 1) % MENSAJES.length)}
        className="mt-3 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RefreshCw className="h-3 w-3" /> Dame otra frase
      </button>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
        <Link href="/catalogo">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" /> Explorar catálogo
          </Button>
        </Link>
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Si el problema persiste, contacta al administrador de la plataforma.
      </p>
    </div>
  );
}
