"use client";

import { useState } from "react";
import { MessageSquareText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import { COMENTARIOS_INICIALES, type Comentario } from "@/lib/mock/comentarios";
import { documentosIniciales } from "@/lib/mock/repositorio";

interface Fila extends Comentario {
  key: string;
  docId: string;
  docTitulo: string;
}

export default function ModeracionPage() {
  const [filas, setFilas] = useState<Fila[]>(() =>
    Object.entries(COMENTARIOS_INICIALES).flatMap(([docId, lista]) =>
      lista.map((c, i) => ({
        ...c,
        docId,
        key: `${docId}-${i}`,
        docTitulo: documentosIniciales.find((d) => d.id === docId)?.titulo ?? docId}))
    )
  );

  const eliminar = (f: Fila) => {
    setFilas((prev) => prev.filter((x) => x.key !== f.key));
    toast.success("Comentario retirado del foro público.");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Moderación del foro</h1>
        <p className="text-sm text-muted-foreground">
          Comentarios publicados en el repositorio, sujetos a revisión del Administrador General.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Comentario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay comentarios publicados.
                </TableCell>
              </TableRow>
            )}
            {filas.map((f) => (
              <TableRow key={f.key}>
                <TableCell className="max-w-xs">
                  <p className="truncate font-medium">{f.docTitulo}</p>
                </TableCell>
                <TableCell>{f.autor}</TableCell>
                <TableCell className="max-w-md">
                  <p className="truncate text-sm">{f.texto}</p>
                </TableCell>
                <TableCell className="text-xs">{f.fecha}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => eliminar(f)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Retirar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquareText className="h-4 w-4" />
        Retirar un comentario lo elimina de la vista pública del repositorio de inmediato.
      </p>
    </div>
  );
}
