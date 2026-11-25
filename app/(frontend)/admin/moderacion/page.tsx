"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Eye, AlertTriangle } from "lucide-react";

export default function ModeracionPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["publicaciones", page, estado],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (estado) params.set("estado", estado);
      const res = await fetch(`/api/admin/publicaciones?${params}`);
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const handleEliminar = async (id: string, titulo: string) => {
    if (!confirm(`¿Eliminar la publicación "${titulo}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch("/api/admin/publicaciones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) refetch();
    else alert("Error al eliminar");
  };

  const getBadge = (e: string) => {
    const c: Record<string, string> = { PUBLICADA: "bg-green-100 text-green-800", BORRADOR: "bg-gray-100 text-gray-800", PENDIENTE: "bg-yellow-100 text-yellow-800", RECHAZADA: "bg-red-100 text-red-800" };
    return c[e] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Moderación</h1>
        <p className="text-sm text-muted-foreground">Revisa y gestiona las publicaciones de la comunidad</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Publicaciones</CardTitle>
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }} className="rounded-md border px-3 py-1 text-sm">
            <option value="">Todos</option>
            <option value="PUBLICADA">Publicadas</option>
            <option value="BORRADOR">Borradores</option>
            <option value="PENDIENTE">Pendientes</option>
          </select>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="py-8 text-center">Cargando...</p> : data?.data?.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay publicaciones</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.titulo}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.resumen}</p>
                    </TableCell>
                    <TableCell>
                      <p>{p.autorNombre || "Desconocido"}</p>
                      <p className="text-xs text-muted-foreground">{p.autorEmail}</p>
                    </TableCell>
                    <TableCell><Badge className={getBadge(p.estado)}>{p.estado}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(`/publicaciones/${p.id}`, "_blank")}>
                          <Eye className="mr-1 h-4 w-4" /> Ver
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleEliminar(p.id, p.titulo)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" /> Criterios de Moderación</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Contenido que viole derechos de autor (plagio).</p>
          <p>• Información falsa, engañosa o discriminatoria.</p>
          <p>• Spam o datos personales sensibles sin consentimiento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
