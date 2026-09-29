"use client";

import type { MouseEvent } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PublicacionesPaginationProps {
  page: number;
  totalPages: number;
  /** Recibe únicamente el nuevo número de página; el resto de criterios los conserva el llamador. */
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/** Calcula qué números de página mostrar, con "…" para los saltos grandes. */
function calcularPaginasVisibles(
  page: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  const paginas = new Set<number>([1, totalPages]);
  for (let delta = -1; delta <= 1; delta += 1) {
    const candidata = page + delta;
    if (candidata > 1 && candidata < totalPages) paginas.add(candidata);
  }

  const ordenadas = Array.from(paginas).sort((a, b) => a - b);
  const resultado: Array<number | "ellipsis"> = [];

  ordenadas.forEach((numero, index) => {
    if (index > 0 && numero - ordenadas[index - 1] > 1) {
      resultado.push("ellipsis");
    }
    resultado.push(numero);
  });

  return resultado;
}

export function PublicacionesPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PublicacionesPaginationProps) {
  if (totalPages <= 1) return null;

  const paginasVisibles = calcularPaginasVisibles(page, totalPages);
  const enPrimeraPagina = page <= 1;
  const enUltimaPagina = page >= totalPages;

  function irA(destino: number) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (disabled || destino === page || destino < 1 || destino > totalPages)
        return;
      onPageChange(destino);
    };
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={irA(page - 1)}
            aria-disabled={enPrimeraPagina || disabled}
            tabIndex={enPrimeraPagina || disabled ? -1 : undefined}
            className={cn(
              (enPrimeraPagina || disabled) && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>

        {paginasVisibles.map((entrada, index) =>
          entrada === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entrada}>
              <PaginationLink
                href="#"
                isActive={entrada === page}
                onClick={irA(entrada)}
                aria-disabled={disabled}
                className={cn(disabled && "pointer-events-none opacity-50")}
              >
                {entrada}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={irA(page + 1)}
            aria-disabled={enUltimaPagina || disabled}
            tabIndex={enUltimaPagina || disabled ? -1 : undefined}
            className={cn(
              (enUltimaPagina || disabled) && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
