// @/components/admin/afiliados/afiliado-foto.tsx
"use client";

import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AfiliadoFotoProps {
  url: string | null;
  nombreCompleto: string;
  className?: string;
}

/**
 * La fotografía del afiliado siempre se muestra con relación de aspecto 3:4.
 * La URL firmada ya llega resuelta desde el endpoint de detalle; este
 * componente no genera ni solicita URLs por su cuenta.
 */
export function AfiliadoFoto({
  url,
  nombreCompleto,
  className,
}: AfiliadoFotoProps) {
  return (
    <div
      className={cn(
        "aspect-[3/4] w-40 overflow-hidden rounded-md border bg-muted",
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL firmada externa (S3), no un asset estático del sitio
        <img
          src={url}
          alt={`Fotografía de ${nombreCompleto || "el afiliado"}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="size-6" aria-hidden="true" />
          <span className="px-2 text-center text-xs">Sin fotografía</span>
        </div>
      )}
    </div>
  );
}
