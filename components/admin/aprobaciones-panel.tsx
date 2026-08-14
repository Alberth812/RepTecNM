"use client";

import { useState, type ReactNode } from "react";
import {
  CheckCircle2, PencilLine, XCircle, FileText, Image as ImageIcon,
  UserRound, GraduationCap, Paperclip, Lock, Eye, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { solicitudesIniciales, type Solicitud } from "@/lib/mock/aprobaciones";
import { cn } from "@/lib/utils";

type Accion = "aprobar" | "corregir" | "rechazar";

const LIMITES = {
  corregir: { min: 25, max: 1500 },
  rechazar: { min: 25, max: 500 },
} as const;

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function Seccion({ icon: Icon, titulo, children }: {
  icon: LucideIcon;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-muted/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}

function Campo({ etiqueta, valor, className }: {
  etiqueta: string;
  valor: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {etiqueta}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{valor}</dd>
    </div>
  );
}

function Archivo({ icon: Icon, nombre, detalle }: {
  icon: LucideIcon;
  nombre: string;
  detalle: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background p-3">
      <div className="rounded-md bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{nombre}</p>
        <p className="text-xs text-muted-foreground">{detalle}</p>
      </div>
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        <Eye className="h-4 w-4" /> Ver
      </Button>
    </div>
  );
}

export function AprobacionesPanel() {
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [seleccionada, setSeleccionada] = useState<Solicitud | null>(null);
  const [viendoAnterior, setViendoAnterior] = useState(false);
  const [accion, setAccion] = useState<Accion | null>(null);
  const [motivo, setMotivo] = useState("");

  const limite = accion && accion !== "aprobar" ? LIMITES[accion] : null;
  const motivoValido = limite
    ? motivo.trim().length >= limite.min && motivo.trim().length <= limite.max
    : true;

  const datos =
    seleccionada && viendoAnterior && seleccionada.versionAnterior
      ? { ...seleccionada, ...seleccionada.versionAnterior }
      : seleccionada;

  const cerrarDetalle = () => {
    setSeleccionada(null);
    setViendoAnterior(false);
  };

  const resolver = () => {
    if (!seleccionada || !accion || !motivoValido) return;

    setSolicitudes((prev) => prev.filter((s) => s.id !== seleccionada.id));

    if (accion === "aprobar") {
      toast.success(
        `Solicitud de ${seleccionada.nombre} aprobada. Estado ACTIVO y credencial generada (RF-CRED-001).`
      );
    } else if (accion === "corregir") {
      toast.success("Corrección solicitada. El afiliado fue notificado por correo (RF-MEMB-010).");
    } else {
      toast.success("Solicitud rechazada. Borrado automático programado en 7 días (RF-MEMB-003).");
    }

    setAccion(null);
    setMotivo("");
    cerrarDetalle();
  };

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Solicitante</TableHead>
              <TableHead>Instituto</TableHead>
              <TableHead>Posgrado</TableHead>
              <TableHead>Enviada</TableHead>
              <TableHead>Versión</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay solicitudes pendientes de aprobación.
                </TableCell>
              </TableRow>
            )}
            {solicitudes.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.nombre}</div>
                  <div className="text-xs text-muted-foreground">{s.correo}</div>
                </TableCell>
                <TableCell>{s.instituto}</TableCell>
                <TableCell>{s.posgrado}</TableCell>
                <TableCell>{s.fechaEnvio}</TableCell>
                <TableCell>
                  <Badge variant={s.versionActual > 1 ? "secondary" : "outline"}>
                    v{s.versionActual}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSeleccionada(s)}>
                    Revisar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!seleccionada} onOpenChange={(open) => !open && cerrarDetalle()}>
        <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
          {datos && seleccionada && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border">
                    <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                      {iniciales(datos.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <SheetTitle>{datos.nombre}</SheetTitle>
                    <SheetDescription className="mt-1">
                      {seleccionada.id} · Enviada el {datos.fechaEnvio}
                    </SheetDescription>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                        v{seleccionada.versionActual}
                      </Badge>
                      <Badge variant="outline">{datos.areaConocimiento}</Badge>
                      <Badge variant="outline">{datos.estadoResidencia}</Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {seleccionada.versionActual > 1 && (
                <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setViendoAnterior(false)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      !viendoAnterior
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Versión actual (v{seleccionada.versionActual})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViendoAnterior(true)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      viendoAnterior
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Versión anterior (v{seleccionada.versionActual - 1})
                  </button>
                </div>
              )}

              {viendoAnterior && seleccionada.observacionesAnteriores && (
                <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-amber-800">
                    Observaciones emitidas en la revisión previa
                  </p>
                  <p className="mt-1 text-amber-900">{seleccionada.observacionesAnteriores}</p>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <Seccion icon={UserRound} titulo="Datos generales">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Campo etiqueta="Correo" valor={datos.correo} />
                    <Campo etiqueta="Teléfono" valor={datos.telefono} />
                    <Campo etiqueta="Estado de residencia" valor={datos.estadoResidencia} />
                    <Campo etiqueta="Área de conocimiento" valor={datos.areaConocimiento} />
                    <Campo etiqueta="Ocupación actual" valor={datos.ocupacion} />
                    <div>
                      <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <Lock className="h-3 w-3" /> Confidencial
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium">
                        {datos.edad} años · {datos.genero}
                      </dd>
                    </div>
                  </dl>
                </Seccion>

                <Seccion icon={GraduationCap} titulo="Formación académica">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Campo etiqueta="Posgrado" valor={datos.posgrado} className="col-span-2" />
                    <Campo etiqueta="Instituto TecNM" valor={datos.instituto} />
                    <Campo etiqueta="Año de graduación" valor={String(datos.anioGraduacion)} />
                  </dl>
                </Seccion>

                <Seccion icon={Paperclip} titulo="Documentación">
                  <div className="grid gap-2">
                    <Archivo icon={FileText} nombre="Comprobante de pago" detalle="PDF · 1.2 MB" />
                    <Archivo icon={ImageIcon} nombre="Fotografía 3:4 (354 × 472 px)" detalle="JPG · 480 KB" />
                  </div>
                </Seccion>
              </div>

              <div className="sticky bottom-0 -mx-6 mt-8 border-t bg-background/95 p-6 backdrop-blur">
                <div className="grid gap-2">
                  <Button onClick={() => setAccion("aprobar")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar afiliación
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setAccion("corregir")}>
                      <PencilLine className="mr-2 h-4 w-4" /> Corrección
                    </Button>
                    <Button
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setAccion("rechazar")}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={accion !== null} onOpenChange={(open) => !open && setAccion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accion === "aprobar" && "Confirmar aprobación"}
              {accion === "corregir" && "Solicitar corrección"}
              {accion === "rechazar" && "Rechazar solicitud"}
            </DialogTitle>
            <DialogDescription>
              {accion === "aprobar" &&
                "El estado cambiará a ACTIVO, se asignará número de afiliado y se generará la credencial digital."}
              {accion === "corregir" &&
                "El estado cambiará a REQUIERE_CORRECCION. Las observaciones son obligatorias y se notificarán al afiliado."}
              {accion === "rechazar" &&
                "El estado cambiará a RECHAZADO y se programará el borrado automático de la cuenta en 7 días."}
            </DialogDescription>
          </DialogHeader>

          {limite ? (
            <div className="grid gap-2">
              <Textarea
                rows={5}
                maxLength={limite.max}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={
                  accion === "corregir"
                    ? "Describe los puntos que el afiliado debe corregir..."
                    : "Indica el motivo del rechazo..."
                }
              />
              <p className="text-xs text-muted-foreground">
                {motivo.trim().length} / {limite.max} caracteres (mínimo {limite.min}).
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAccion(null)}>
              Cancelar
            </Button>
            <Button
              variant={accion === "rechazar" ? "destructive" : "default"}
              disabled={!motivoValido}
              onClick={resolver}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}