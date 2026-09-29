"use client";

import { FileTextIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePublicacionDocumentoMutation } from "@/lib/publicaciones/hooks/use-publicacion-documento-mutation";
import { getApiErrorMessage } from "@/lib/api/errors-otro";

interface AbrirPdfButtonProps {
  publicacionId: string;
}

/**
 * No solicita la URL firmada al montar: solo al hacer click. Mientras se
 * resuelve, se deshabilita para evitar solicitudes simultáneas. Al tener
 * éxito, abre el PDF en una pestaña nueva; si falla, muestra `error.message`.
 */
export function AbrirPdfButton({ publicacionId }: AbrirPdfButtonProps) {
  const documentoMutation = usePublicacionDocumentoMutation();

  function handleClick() {
    if (documentoMutation.isPending) return;

    documentoMutation.mutate(publicacionId, {
      onSuccess: (documento) => {
        window.open(documento.url, "_blank", "noopener,noreferrer");
      },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        disabled={documentoMutation.isPending}
        className="w-fit"
      >
        {documentoMutation.isPending ? (
          <>
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            Abriendo PDF…
          </>
        ) : (
          <>
            <FileTextIcon className="size-4" aria-hidden="true" />
            Abrir PDF
          </>
        )}
      </Button>
      {documentoMutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(documentoMutation.error)}
        </p>
      )}
    </div>
  );
}
