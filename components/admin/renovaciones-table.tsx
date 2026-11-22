// @/components/admin/renovaciones-table.tsx
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface FilaRenovacion {
  renovacionId: string;
  solicitadoAt: string;
  afiliado: {
    id: string;
    folio: string | null;
    email: string;
    nombreCompleto: string;
    fechaInicioMembresia: string | null;
    fechaExpiracion: string | null;
    membershipStatus: string;
  };
}

interface RespuestaLista {
  data: FilaRenovacion[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

async function obtenerPendientes(
  params: URLSearchParams,
): Promise<RespuestaLista> {
  const res = await fetch(`/api/admin/renovaciones?${params.toString()}`);
  if (!res.ok) throw new Error("No se pudo cargar la lista de renovaciones.");
  return res.json();
}

export function RenovacionesTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");

  const params = useMemo(() => {
    const p = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      orderDir,
    });
    if (q.trim()) p.set("q", q.trim());
    return p;
  }, [page, q, orderDir]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-renovaciones", params.toString()],
    queryFn: () => obtenerPendientes(params),
  });

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-renovaciones"] });

  const verComprobante = async (renovacionId: string) => {
    const res = await fetch(
      `/api/admin/renovaciones/${renovacionId}/comprobante-url`,
    );
    if (!res.ok) return;
    const { url } = await res.json();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const aprobar = useMutation({
    mutationFn: async (renovacionId: string) => {
      const res = await fetch(
        `/api/admin/renovaciones/${renovacionId}/aprobar`,
        { method: "POST" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo aprobar.");
      }
    },
    onSettled: invalidar,
  });

  const rechazar = useMutation({
    mutationFn: async ({
      renovacionId,
      observaciones,
    }: {
      renovacionId: string;
      observaciones: string;
    }) => {
      const res = await fetch(
        `/api/admin/renovaciones/${renovacionId}/rechazar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ observaciones }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo rechazar.");
      }
    },
    onSettled: invalidar,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por folio, nombre, apellidos o email..."
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          onClick={() => setOrderDir((d) => (d === "desc" ? "asc" : "desc"))}
        >
          Fecha de solicitud:{" "}
          {orderDir === "desc"
            ? "más recientes primero"
            : "más antiguas primero"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folio</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Inicio membresía</TableHead>
            <TableHead>Expira</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Solicitado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8}>Cargando...</TableCell>
            </TableRow>
          )}
          {!isLoading && data?.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>No hay renovaciones pendientes.</TableCell>
            </TableRow>
          )}
          {data?.data.map((fila) => (
            <RenovacionFila
              key={fila.renovacionId}
              fila={fila}
              onVerComprobante={() => verComprobante(fila.renovacionId)}
              onAprobar={() => aprobar.mutate(fila.renovacionId)}
              onRechazar={(obs) =>
                rechazar.mutate({
                  renovacionId: fila.renovacionId,
                  observaciones: obs,
                })
              }
              aprobando={aprobar.isPending}
              rechazando={rechazar.isPending}
            />
          ))}
        </TableBody>
      </Table>

      {data && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {data.pagination.page} de {data.pagination.totalPages} (
            {data.pagination.total} en total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RenovacionFila({
  fila,
  onVerComprobante,
  onAprobar,
  onRechazar,
  aprobando,
  rechazando,
}: {
  fila: FilaRenovacion;
  onVerComprobante: () => void;
  onAprobar: () => void;
  onRechazar: (observaciones: string) => void;
  aprobando: boolean;
  rechazando: boolean;
}) {
  const [observaciones, setObservaciones] = useState("");
  const [dialogAbierto, setDialogAbierto] = useState(false);

  return (
    <TableRow>
      <TableCell>{fila.afiliado.folio ?? "—"}</TableCell>
      <TableCell>{fila.afiliado.nombreCompleto}</TableCell>
      <TableCell>{fila.afiliado.email}</TableCell>
      <TableCell>
        {fila.afiliado.fechaInicioMembresia
          ? new Date(fila.afiliado.fechaInicioMembresia).toLocaleDateString()
          : "—"}
      </TableCell>
      <TableCell>
        {fila.afiliado.fechaExpiracion
          ? new Date(fila.afiliado.fechaExpiracion).toLocaleDateString()
          : "—"}
      </TableCell>
      <TableCell>
        <Badge
          variant={
            fila.afiliado.membershipStatus === "ACTIVO"
              ? "default"
              : "secondary"
          }
        >
          {fila.afiliado.membershipStatus}
        </Badge>
      </TableCell>
      <TableCell>{new Date(fila.solicitadoAt).toLocaleString()}</TableCell>
      <TableCell className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onVerComprobante}>
          Ver comprobante
        </Button>
        <Button size="sm" onClick={onAprobar} disabled={aprobando}>
          Aprobar
        </Button>
        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogTrigger /*asChild*/>
            <Button size="sm" variant="destructive">
              Rechazar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar comprobante</DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor={`obs-${fila.renovacionId}`}>
                Observaciones (opcional)
              </Label>
              <Textarea
                id={`obs-${fila.renovacionId}`}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={rechazando}
                onClick={() => {
                  onRechazar(observaciones);
                  setDialogAbierto(false);
                  setObservaciones("");
                }}
              >
                Confirmar rechazo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
