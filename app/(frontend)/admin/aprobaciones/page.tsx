"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CheckCircle, XCircle, Eye, AlertTriangle, User, Mail, Phone, MapPin,
  Briefcase, GraduationCap, FileText, Image as ImageIcon, X, Loader2,
} from "lucide-react";

interface Solicitud {
  id: string;
  estado: string;
  observaciones: string | null;
  fechaSolicitud: string;
  folio: string | null;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  correo: string | null;
  fotografiaArchivoId: string | null;
  comprobanteArchivoId: string | null;
  datos: Record<string, unknown>;
}

function getBadgeVariant(estado: string): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDIENTE: "secondary",
    APROBADO: "default",
    RECHAZADO: "destructive",
    REQUIERE_CORRECCION: "outline",
  };
  return map[estado] || "secondary";
}

function formatear(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "-";
  if (Array.isArray(valor)) return valor.filter(Boolean).join(", ") || "-";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

function Campo({ label, value }: { label: string; value: unknown }) {
  const v = formatear(value);
  if (v === "-") return null;
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-dashed last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right break-words max-w-[60%]">{v}</span>
    </div>
  );
}

export default function AprobacionesPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState("PENDIENTE");
  const [detalle, setDetalle] = useState<Solicitud | null>(null);
  const [procesando, setProcesando] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["solicitudes", page, estado],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString() });
      if (estado) params.set("estado", estado);
      const res = await fetch(`/api/admin/solicitudes?${params}`);
      if (!res.ok) throw new Error("Error al cargar solicitudes");
      return res.json();
    },
  });

  const decidir = async (solicitudId: string, decision: string) => {
    let observaciones: string | undefined;
    if (decision === "REQUIERE_CORRECCION") {
      const texto = window.prompt("Describe las correcciones que debe hacer el afiliado:");
      if (texto === null) return;
      if (texto.trim().length === 0) {
        toast.error("Debes indicar las observaciones para requerir correcciones.");
        return;
      }
      observaciones = texto.trim();
    } else if (decision === "RECHAZADO") {
      const texto = window.prompt("Motivo del rechazo (opcional):");
      if (texto === null) return;
      observaciones = texto.trim() || undefined;
    }

    setProcesando(true);
    try {
      const res = await fetch(`/api/admin/solicitudes/${solicitudId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, observaciones }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "No se pudo procesar la solicitud.");
        return;
      }
      toast.success(json.message || "Solicitud atendida correctamente.");
      setDetalle(null);
      refetch();
    } catch {
      toast.error("Ocurrió un error al procesar la solicitud.");
    } finally {
      setProcesando(false);
    }
  };

  const nombreCompleto = detalle
    ? [detalle.nombres, detalle.apellidoPaterno, detalle.apellidoMaterno].filter(Boolean).join(" ")
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Aprobaciones</h1>
        <p className="text-sm text-muted-foreground">Gestiona las solicitudes de registro de afiliados.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Solicitudes</CardTitle>
          <select
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setPage(1); }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADO">Aprobados</option>
            <option value="RECHAZADO">Rechazados</option>
            <option value="REQUIERE_CORRECCION">Requieren corrección</option>
          </select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No hay solicitudes en este estado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((s: Solicitud) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">
                        {[s.nombres, s.apellidoPaterno, s.apellidoMaterno].filter(Boolean).join(" ")}
                      </p>
                      {s.folio && <p className="text-xs text-muted-foreground">{s.folio}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.correo}</TableCell>
                    <TableCell><Badge variant={getBadgeVariant(s.estado)}>{s.estado}</Badge></TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(s.fechaSolicitud).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setDetalle(s)}>
                        <Eye className="mr-1 h-4 w-4" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Página {data.pagination.page} de {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.totalPages}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {detalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setDetalle(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header SIN avatar, solo nombre y datos */}
            <div className="border-b bg-muted/30 p-6">
              <button
                className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setDetalle(null)}
              >
                <X className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold">{nombreCompleto}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {detalle.folio && <span className="font-mono text-xs">{detalle.folio}</span>}
                  <span>•</span>
                  <Badge variant={getBadgeVariant(detalle.estado)}>{detalle.estado}</Badge>
                  <span>•</span>
                  <span>{new Date(detalle.fechaSolicitud).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                {detalle.correo && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {detalle.correo}
                  </p>
                )}
              </div>
            </div>

            {/* Contenido scrollable */}
            <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <User className="h-4 w-4" /> Datos personales
                    </h3>
                    <div className="rounded-lg border bg-background p-3">
                      <Campo label="Nombre(s)" value={detalle.datos.nombres} />
                      <Campo label="Apellido paterno" value={detalle.datos.apellido_paterno} />
                      <Campo label="Apellido materno" value={detalle.datos.apellido_materno} />
                      <Campo label="Género" value={detalle.datos.genero} />
                      <Campo label="Tipo sanguíneo" value={detalle.datos.tipo_sanguineo} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Phone className="h-4 w-4" /> Contacto
                    </h3>
                    <div className="rounded-lg border bg-background p-3">
                      <Campo label="Correo electrónico" value={detalle.datos.correo_electronico} />
                      <Campo label="Teléfono celular" value={detalle.datos.telefono_celular} />
                      <Campo label="Teléfono casa" value={detalle.datos.telefono_casa} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <MapPin className="h-4 w-4" /> Ubicación
                    </h3>
                    <div className="rounded-lg border bg-background p-3">
                      <Campo label="Estado" value={detalle.datos.estado_residencia} />
                      <Campo label="Ciudad" value={detalle.datos.ciudad_residencia} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Briefcase className="h-4 w-4" /> Información profesional
                    </h3>
                    <div className="rounded-lg border bg-background p-3">
                      <Campo label="Perfil profesional" value={detalle.datos.perfil_profesional} />
                      <Campo label="Área de conocimiento" value={detalle.datos.area_conocimiento} />
                      <Campo label="Tipo de servicios" value={detalle.datos.tipo_servicios} />
                      <Campo label="Sectores" value={detalle.datos.sectores} />
                      <Campo label="Modalidad" value={detalle.datos.modalidad_servicios} />
                      <Campo label="Disponibilidad geográfica" value={detalle.datos.disponibilidad_geografica} />
                      <Campo label="Habilidades tecnológicas" value={detalle.datos.habilidades_tecnologicas} />
                      <Campo label="Autoriza publicación" value={detalle.datos.autoriza_publicacion} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <FileText className="h-4 w-4" /> Archivos adjuntos
                    </h3>
                    <div className="space-y-2 rounded-lg border bg-background p-3">
                      <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">Fotografía</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {detalle.fotografiaArchivoId ? "Cargada" : "Sin fotografía"}
                          </p>
                        </div>
                        {detalle.fotografiaArchivoId && (
                          <a
                            href={`/api/archivo/${detalle.fotografiaArchivoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Ver
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">Comprobante de membresía</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {detalle.comprobanteArchivoId ? "Cargado" : "Sin comprobante"}
                          </p>
                        </div>
                        {detalle.comprobanteArchivoId && (
                          <a
                            href={`/api/archivo/${detalle.comprobanteArchivoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Abrir
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {detalle.observaciones && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Observaciones previas
                    </h3>
                    <p className="rounded-lg border bg-muted/30 p-3 text-sm">{detalle.observaciones}</p>
                  </div>
                </>
              )}
            </div>

            {/* Footer con acciones */}
            {detalle.estado === "PENDIENTE" && (
              <div className="border-t bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setDetalle(null)} disabled={procesando}>Cancelar</Button>
                  <Button
                    variant="outline"
                    onClick={() => decidir(detalle.id, "RECHAZADO")}
                    disabled={procesando}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Rechazar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => decidir(detalle.id, "REQUIERE_CORRECCION")}
                    disabled={procesando}
                    className="text-amber-600 hover:bg-amber-50"
                  >
                    <AlertTriangle className="mr-1.5 h-4 w-4" /> Pedir corrección
                  </Button>
                  <Button
                    onClick={() => decidir(detalle.id, "APROBADO")}
                    disabled={procesando}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {procesando ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                    )}
                    Aprobar solicitud
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
