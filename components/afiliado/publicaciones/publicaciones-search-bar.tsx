// components/afiliado/publicaciones/publicaciones-search-bar.tsx
"use client";

import { Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_LONGITUD_Q = 200;

interface PublicacionesSearchBarProps {
  /** Búsqueda actualmente aplicada (la que ya se envió al servidor). */
  valorActual: string;
  onBuscar: (termino: string) => void;
  onLimpiar: () => void;
  deshabilitado?: boolean;
}

export function PublicacionesSearchBar({
  valorActual,
  onBuscar,
  onLimpiar,
  deshabilitado = false,
}: PublicacionesSearchBarProps) {
  // Estado local del input: no dispara ninguna consulta mientras se escribe.
  const [inputValue, setInputValue] = useState(valorActual);

  // Si la búsqueda activa cambia desde afuera (p. ej. "Limpiar"), sincroniza el input.
  useEffect(() => {
    setInputValue(valorActual);
  }, [valorActual]);

  const hayFiltroActivo = valorActual.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onBuscar(inputValue.trim());
  };

  const handleLimpiar = () => {
    setInputValue("");
    onLimpiar();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Buscar por título, descripción, autor o palabra clave…"
          className="pl-8"
          maxLength={MAX_LONGITUD_Q}
          disabled={deshabilitado}
          aria-label="Buscar en mis publicaciones"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={deshabilitado}>
          Buscar
        </Button>
        {hayFiltroActivo && (
          <Button
            type="button"
            variant="outline"
            onClick={handleLimpiar}
            disabled={deshabilitado}
          >
            <X className="h-4 w-4" />
            Limpiar búsqueda
          </Button>
        )}
      </div>
    </form>
  );
}
