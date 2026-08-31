"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, UserCheck, UserMinus, UserX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { afiliadosIniciales, type Afiliado, type EstadoAfiliado } from "@/lib/mock/afiliados";

function mesesDesde(fecha: string): number {
  const d = new Date(fecha);
  const a = new Date();
  return (a.getFullYear() - d.getFullYear()) * 12 + (a.getMonth() - d.getMonth());
}

const ESTILO_ESTADO: Record<EstadoAfiliado, string> = {
  ACTIVO: "bg-green-100 text-green-800",
  INACTIVO: "bg-amber-100 text-amber-800",
  BAJA: "bg-red-100 text-red-800",
  PENDIENTE_APROBACION: "bg-sky-100 text-sky-800"};

export default function AfiliadosPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-muted-foreground">Cargando...</div>}>
      <AfiliadosPageInner />
    </Suspense>
  );
}

function AfiliadosPageInner() {
  const [afiliados, setAfiliados] = useState(afiliadosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [baja, setBaja] = useState<Afiliado | null>(null);
  const paramsUrl = useSearchParams();
  const qUrl = paramsUrl.get("q");

  useEffect(() => {
    if (qUrl) setBusqueda(qUrl);
  }, [qUrl]);

  const resultados = useMemo(() => {
    return afiliados.filter(
      (a) =>
        (filtroEstado === "" || a.estado === filtroEstado) &&
        a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [afiliados, busqueda, filtroEstado]);

  const cambiarEstado = (a: Afiliado, estado: EstadoAfiliado) => {
    setAfiliados((prev) => prev.map((x) => (x.id === a.id ? { ...x, estado } : x)));
    toast.success(`${a.nombre} ahora está en estado ${estado} (RF-MEMB).`);
  };

  const confirmarBaja = () => {
    if (!baja) return;
    setAfiliados((prev) => prev.map((x) => (x.id === baja.id ? { ...x, estado: "BAJA" } : x)));
    toast.success("Baja registrada. Pierde acceso, sus conversaciones se eliminan y sale del catálogo (RF-MEMB-009).");
    setBaja(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Administración de afiliados</h1>
          <p className="text-sm text-muted-foreground">
            Estados y transiciones de la membresía (RF-MEMB).
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre"
              className="w-56 pl-8"
            />
          </div>
          <Select value={filtroEstado || "todos"} onValueChange={(v) => { if (v) setFiltroEstado(v === "todos" ? "" : v); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Todos los estados" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="ACTIVO">ACTIVO</SelectItem>
              <SelectItem value="INACTIVO">INACTIVO</SelectItem>
              <SelectItem value="PENDIENTE_APROBACION">PENDIENTE</SelectItem>
              <SelectItem value="BAJA">BAJA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Afiliado</TableHead>
              <TableHead>Instituto y posgrado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Seguimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resultados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
            {resultados.map((a) => {
              const desactualizado = mesesDesde(a.ultimaActualizacion) > 12;
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <p className="font-medium">{a.nombre}</p>
                    <p className="text-xs text-muted-foreground">{a.id}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{a.instituto}</p>
                    <p className="text-xs text-muted-foreground">{a.posgrado}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={ESTILO_ESTADO[a.estado]}>
                      {a.estado === "PENDIENTE_APROBACION" ? "PENDIENTE" : a.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{a.ultimaActualizacion}</p>
                    {desactualizado && a.estado !== "BAJA" && (
                      <p className="text-[11px] font-medium text-amber-700">
                        Desactualizado (RF-SEG-005)
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {a.estado === "PENDIENTE_APROBACION" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info("Esta solicitud se resuelve en la bandeja de aprobaciones.")}
                      >
                        Ir a aprobaciones
                      </Button>
                    ) : a.estado === "BAJA" ? (
                      <span className="text-xs text-muted-foreground">Sin acciones</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {a.estado === "ACTIVO" ? (
                          <Button size="sm" variant="outline" onClick={() => cambiarEstado(a, "INACTIVO")}>
                            <UserX className="mr-2 h-4 w-4" /> Desactivar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => cambiarEstado(a, "ACTIVO")}>
                            <UserCheck className="mr-2 h-4 w-4" /> Activar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setBaja(a)}
                        >
                          <UserMinus className="mr-2 h-4 w-4" /> Baja
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!baja} onOpenChange={(open) => !open && setBaja(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar baja definitiva</DialogTitle>
            <DialogDescription>
              {baja?.nombre} perderá el acceso, sus conversaciones se eliminarán y su perfil
              saldrá del catálogo público (RF-MEMB-009). Esta acción no puede revertirse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBaja(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarBaja}>Confirmar baja</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
