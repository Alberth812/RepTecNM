import { ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { PublicacionDetalleResponse } from "@/lib/validation/publicaciones";
import { AbrirPdfButton } from "@/components/publicaciones/general/abrir-pdf-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTipoPublicacionLabel } from "@/lib/publicaciones/tipo-labels";
import {
  formatFecha,
  formatFechaHora,
  formatTamanoArchivo,
} from "@/lib/publicaciones/format";

interface PublicacionDetalleContentProps {
  publicacion: PublicacionDetalleResponse;
}

function CampoMetadato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function PublicacionDetalleContent({
  publicacion,
}: PublicacionDetalleContentProps) {
  const autoresOrdenados = [...publicacion.autores].sort(
    (a, b) => a.orden - b.orden,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {getTipoPublicacionLabel(publicacion.tipo, publicacion.tipoOtro)}
            </Badge>
            <Badge variant="outline">{publicacion.estado}</Badge>
            <span className="text-sm text-muted-foreground">
              {publicacion.anioPublicacion}
            </span>
          </div>
          <CardTitle className="text-2xl">{publicacion.titulo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {publicacion.descripcion}
          </p>

          <Separator />

          <dl className="grid gap-4 sm:grid-cols-2">
            <CampoMetadato etiqueta="Autores">
              {autoresOrdenados.length > 0
                ? autoresOrdenados
                    .map((autor) => `${autor.nombres} ${autor.apellidos}`)
                    .join(", ")
                : "Sin autores registrados"}
            </CampoMetadato>

            {publicacion.revistaCongreso && (
              <CampoMetadato etiqueta="Revista / Congreso">
                {publicacion.revistaCongreso}
              </CampoMetadato>
            )}

            {publicacion.editorial && (
              <CampoMetadato etiqueta="Editorial">
                {publicacion.editorial}
              </CampoMetadato>
            )}

            {publicacion.doi && (
              <CampoMetadato etiqueta="DOI">
                <a
                  href={`https://doi.org/${publicacion.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  {publicacion.doi}
                  <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                </a>
              </CampoMetadato>
            )}

            {publicacion.isbn && (
              <CampoMetadato etiqueta="ISBN">{publicacion.isbn}</CampoMetadato>
            )}
            {publicacion.issn && (
              <CampoMetadato etiqueta="ISSN">{publicacion.issn}</CampoMetadato>
            )}

            {publicacion.url && (
              <CampoMetadato etiqueta="Enlace de acceso">
                <a
                  href={publicacion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 break-all text-primary underline-offset-4 hover:underline"
                >
                  {publicacion.url}
                  <ExternalLinkIcon
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </CampoMetadato>
            )}
          </dl>

          {publicacion.palabrasClave.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Palabras clave
              </p>
              <div className="flex flex-wrap gap-1.5">
                {publicacion.palabrasClave.map((palabra) => (
                  <Badge
                    key={palabra}
                    variant="outline"
                    className="font-normal"
                  >
                    {palabra}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-medium">{publicacion.archivo.originalName}</p>
              <p className="text-muted-foreground">
                {publicacion.archivo.contentType} ·{" "}
                {formatTamanoArchivo(publicacion.archivo.size)}
              </p>
            </div>
            <AbrirPdfButton publicacionId={publicacion.id} />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Publicado el {formatFecha(publicacion.createdAt)} · Última actualización
        el {formatFecha(publicacion.updatedAt)} · Descargo de responsabilidad v
        {publicacion.descargoVersion} aceptado el{" "}
        {formatFechaHora(publicacion.descargoAceptadoAt)}
      </p>
    </div>
  );
}
