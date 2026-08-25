// components/admin/solicitudes/archivo-preview.tsx
import { ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import type { ArchivoConUrl } from "@/lib/api/solicitudes";

export function ArchivoPreview({
  titulo,
  archivo,
}: {
  titulo: string;
  archivo: ArchivoConUrl;
}) {
  const esImagen = archivo.contentType.startsWith("image/");

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
      <div className="overflow-hidden rounded-lg border bg-muted/30">
        {esImagen ? (
          <a
            href={archivo.url}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={archivo.url}
              alt={titulo}
              className="h-48 w-full object-cover transition-opacity hover:opacity-90"
            />
          </a>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="h-10 w-10" />
            <span className="text-xs">{archivo.contentType}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t bg-background p-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              {archivo.originalName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(archivo.size)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<a href={archivo.url} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver
          </Button>
        </div>
      </div>
    </div>
  );
}
