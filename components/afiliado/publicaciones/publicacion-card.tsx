// components/afiliado/publicaciones/publicacion-card.tsx
"use client";

import { CalendarDays, FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import type { PublicacionListItemResponse } from "@/lib/validation/publicaciones";

const TIPO_LABELS: Record<string, string> = {
 ARTICULO: "Artículo",
 TESIS: "Tesis",
 LIBRO: "Libro",
 MEMORIA_CONGRESO: "Memoria de congreso",
 PRESENTACION: "Presentación",
 ENSAYO: "Ensayo",
 REPORTE_TECNICO: "Reporte técnico",
 OTRO: "Otro",
};

function formatearAutores(
 autores: PublicacionListItemResponse["autores"],
): string {
 return [...autores]
 .sort((a, b) => a.orden - b.orden)
 .map((autor) => `${autor.nombres} ${autor.apellidos}`)
 .join(", ");
}

function formatearFecha(fecha: string | Date): string {
 const date = typeof fecha === "string" ? new Date(fecha) : fecha;
 return new Intl.DateTimeFormat("es-MX", {
 year: "numeric",
 month: "short",
 day: "numeric",
 }).format(date);
}

interface PublicacionCardProps {
 publicacion: PublicacionListItemResponse;
 onEliminar: (id: string) => void;
 eliminando: boolean;
}

export function PublicacionCard({
 publicacion,
 onEliminar,
 eliminando,
}: PublicacionCardProps) {
 const [dialogoAbierto, setDialogoAbierto] = useState(false);

 const tipoLabel =
 publicacion.tipo === "OTRO" && publicacion.tipoOtro
 ? publicacion.tipoOtro
 : (TIPO_LABELS[publicacion.tipo] ?? publicacion.tipo);

 return (
 <Card className="flex flex-col">
 <CardHeader className="gap-2">
 <div className="flex flex-wrap items-center gap-2">
 <Badge variant="secondary">{tipoLabel}</Badge>
 <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
 <CalendarDays className="h-3.5 w-3.5" />
 {publicacion.anioPublicacion}
 </span>
 </div>
 <CardTitle className="line-clamp-2 text-lg leading-snug">
 {publicacion.titulo}
 </CardTitle>
 </CardHeader>

 <CardContent className="flex-1 space-y-3">
 <p className="line-clamp-3 text-sm text-muted-foreground">
 {publicacion.descripcion}
 </p>

 {publicacion.autores.length > 0 && (
 <p className="text-sm">
 <span className="font-medium">Autores: </span>
 <span className="text-muted-foreground">
 {formatearAutores(publicacion.autores)}
 </span>
 </p>
 )}

 {publicacion.palabrasClave.length > 0 && (
 <div className="flex flex-wrap gap-1">
 {publicacion.palabrasClave.map((palabra) => (
 <Badge key={palabra} variant="outline" className="font-normal">
 {palabra}
 </Badge>
 ))}
 </div>
 )}

 <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <FileText className="h-3.5 w-3.5 shrink-0" />
 <span className="truncate">{publicacion.archivo.originalName}</span>
 </p>

 <p className="text-xs text-muted-foreground">
 Actualizado el {formatearFecha(publicacion.updatedAt)}
 </p>
 </CardContent>

 <CardFooter className="flex justify-end gap-2 border-t pt-4">
 <Button
 variant="outline"
 size="sm"
 nativeButton={false}
 render={
 <Link href={`/afiliado/publicaciones/${publicacion.id}/editar`} />
 }
 >
 <Pencil className="h-4 w-4" />
 Editar
 </Button>

 <AlertDialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
 <AlertDialogTrigger
 render={
 <Button variant="destructive" size="sm" disabled={eliminando} />
 }
 >
 <Trash2 className="h-4 w-4" />
 {eliminando ? "Eliminando…" : "Eliminar"}
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>¿Eliminar esta publicación?</AlertDialogTitle>
 <AlertDialogDescription>
 Se eliminará permanentemente “{publicacion.titulo}” junto con su
 documento PDF asociado. Esta acción no se puede deshacer.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Cancelar</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => onEliminar(publicacion.id)}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 Sí, eliminar
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </CardFooter>
 </Card>
 );
}
