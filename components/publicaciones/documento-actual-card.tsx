// components/publicaciones/documento-actual-card.tsx
"use client";

import { FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDocumentoUrl } from "@/lib/publicaciones/hooks/use-documento-url";
import { formatBytes } from "@/lib/utils";
import type { PublicacionArchivoResponse } from "@/lib/validation/publicaciones";

export interface DocumentoActualCardProps {
  publicacionId: string;
  archivo: PublicacionArchivoResponse;
}

/**
 * Muestra el PDF ya asociado a la publicación (no editable desde aquí: el
 * servidor rechaza cualquier intento de sustituirlo vía PATCH). "Abrir PDF"
 * pide una URL firmada bajo demanda y la abre en una pestaña nueva.
 *
 * La pestaña se abre de forma síncrona al hacer clic (con `about:blank`) y
 * se navega a la URL firmada cuando la petición resuelve; así se evita que
 * el bloqueador de pop-ups del navegador la descarte por no ser resultado
 * directo de un gesto del usuario.
 */
export function DocumentoActualCard({
  publicacionId,
  archivo,
}: DocumentoActualCardProps) {
  const documentoMutation = useDocumentoUrl(publicacionId);

  function handleAbrir() {
    const ventana = window.open("", "_blank", "noopener,noreferrer");

    documentoMutation.mutate(undefined, {
      onSuccess: (documento) => {
        if (ventana) {
          ventana.location.href = documento.url;
        } else {
          toast.error("Habilita las ventanas emergentes para abrir el PDF.");
        }
      },
      onError: () => {
        ventana?.close();
        toast.error("No se pudo generar el enlace del documento.");
      },
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-input p-3">
      <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium"
          title={archivo.originalName}
        >
          {archivo.originalName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(archivo.size)}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAbrir}
        disabled={documentoMutation.isPending}
      >
        {documentoMutation.isPending ? "Generando enlace…" : "Abrir PDF"}
      </Button>
    </div>
  );
}
