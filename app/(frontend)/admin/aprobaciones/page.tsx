"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";

export default function AprobacionesPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["solicitudes", page, estado],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (estado) params.set("estado", estado);
      const res = await fetch(`/api/admin/solicitudes?${params}`);
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const getBadge = (e: string) => {
    const c: Record<string, string> = { PENDIENTE: "bg-yellow-100 text-yellow-800", APROBADO: "bg-green-100 text-green-800", RECHAZADO: "bg-red-100 text-red-800" };
    return c[e] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Aprobaciones</h1>
        <p className="text-sm text-muted-foreground">Gestiona las solicitudes de registro de afiliados</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Solicitudes</CardTitle>
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }} className="rounded-md border px-3 py-1 text-sm">
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADO">Aprobados</option>
            <option value="RECHAZADO">Rechazados</option>
          </select>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="py-8 text-center">Cargando...</p> : data?.data?.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay solicitudes</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.nombres} {s.apellidoPaterno} {s.apellidoMaterno}</p>
                      <p className="text-xs text-muted-foreground">{s.folio}</p>
                    </TableCell>
                    <TableCell>{s.correo}</TableCell>
                    <TableCell><Badge className={getBadge(s.estado)}>{s.estado}</Badge></TableCell>
                    <TableCell>{new Date(s.fechaSolicitud).toLocaleDateString("es-MX")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
