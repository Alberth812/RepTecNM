"use client";

import { AlertCircleIcon, ArrowLeftIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";

import { PublicacionDetalleContent } from "@/components/publicaciones/general/publicacion-detalle-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicacionDetalleQuery } from "@/lib/publicaciones/hooks/use-publicacion-detalle-query";
import { getApiErrorDetails, getApiErrorMessage } from "@/lib/api/errors-otro";

interface PublicacionDetallePageClientProps {
  id: string;
}

function DetalleSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border p-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function PublicacionDetallePageClient({
  id,
}: PublicacionDetallePageClientProps) {
  const detalleQuery = usePublicacionDetalleQuery(id);
  const detalles = detalleQuery.isError
    ? getApiErrorDetails(detalleQuery.error)
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href="/publicaciones" />}
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Volver a publicaciones
      </Button>

      {detalleQuery.isPending && <DetalleSkeleton />}

      {detalleQuery.isError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>No se pudo cargar la publicación</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{getApiErrorMessage(detalleQuery.error)}</span>
            {detalles.length > 0 && (
              <ul className="list-disc space-y-1 pl-4">
                {detalles.map((detalle, index) => (
                  <li key={index}>{detalle}</li>
                ))}
              </ul>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => detalleQuery.refetch()}
            >
              <RotateCcwIcon className="size-4" aria-hidden="true" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {detalleQuery.isSuccess && (
        <PublicacionDetalleContent publicacion={detalleQuery.data} />
      )}
    </div>
  );
}
