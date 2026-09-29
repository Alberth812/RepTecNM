import { FileTextIcon } from "lucide-react";
import Link from "next/link";

import type { PublicacionBusquedaItem } from "@/lib/validation/publicaciones-busqueda";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTipoPublicacionLabel } from "@/lib/publicaciones/tipo-labels";
import { formatTamanoArchivo } from "@/lib/publicaciones/format";

const MAX_AUTORES_VISIBLES = 3;
const MAX_PALABRAS_CLAVE_VISIBLES = 4;

function formatAutores(autores: PublicacionBusquedaItem["autores"]): string {
  const ordenados = [...autores].sort((a, b) => a.orden - b.orden);
  const nombres = ordenados.map(
    (autor) => `${autor.nombres} ${autor.apellidos}`,
  );

  if (nombres.length === 0) return "Sin autores registrados";
  if (nombres.length <= MAX_AUTORES_VISIBLES) return nombres.join(", ");

  const visibles = nombres.slice(0, MAX_AUTORES_VISIBLES).join(", ");
  const restantes = nombres.length - MAX_AUTORES_VISIBLES;
  return `${visibles} y ${restantes} más`;
}

interface PublicacionCardProps {
  publicacion: PublicacionBusquedaItem;
}

/** Resumen clicable de una publicación. Al hacer click navega a la vista de detalle. */
export function PublicacionCard({ publicacion }: PublicacionCardProps) {
  const palabrasVisibles = publicacion.palabrasClave.slice(
    0,
    MAX_PALABRAS_CLAVE_VISIBLES,
  );
  const palabrasRestantes =
    publicacion.palabrasClave.length - palabrasVisibles.length;
  const lineaSecundaria = publicacion.revistaCongreso ?? publicacion.editorial;

  return (
    <Link
      href={`/publicaciones/${publicacion.id}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/40">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {getTipoPublicacionLabel(publicacion.tipo, publicacion.tipoOtro)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {publicacion.anioPublicacion}
            </span>
          </div>
          <CardTitle className="line-clamp-2">{publicacion.titulo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {publicacion.descripcion}
          </p>
          <p className="text-sm">
            <span className="font-medium">Autores:</span>{" "}
            {formatAutores(publicacion.autores)}
          </p>
          {lineaSecundaria && (
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {lineaSecundaria}
            </p>
          )}
          {palabrasVisibles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {palabrasVisibles.map((palabra) => (
                <Badge key={palabra} variant="outline" className="font-normal">
                  {palabra}
                </Badge>
              ))}
              {palabrasRestantes > 0 && (
                <Badge variant="outline" className="font-normal">
                  +{palabrasRestantes}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <FileTextIcon className="mr-1.5 size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{publicacion.archivo.originalName}</span>
          <span className="ml-2 shrink-0">
            ({formatTamanoArchivo(publicacion.archivo.size)})
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
