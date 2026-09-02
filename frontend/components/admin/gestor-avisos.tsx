"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Aviso {
  id?: number;
  titulo: string;
  contenido: string;
  tipo: string;
  imagen?: string | null;
  imagen_url?: string | null;
  activo: boolean;
  fecha_activacion?: string;
  fecha_expiracion?: string;
  segmentacion_area?: string;
  segmentacion_estado?: string;
}

export function GestorAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Aviso | null>(null);
  const [nuevo, setNuevo] = useState(false);

  useEffect(() => {
    cargarAvisos();
  }, []);

  const cargarAvisos = async () => {
    try {
      const res = await fetch("/api/cms/avisos/", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAvisos(data);
      }
    } catch (error) {
      console.error("Error cargando avisos:", error);
    } finally {
      setCargando(false);
    }
  };

  const guardarAviso = async (aviso: Aviso) => {
    const formData = new FormData();
    formData.append("titulo", aviso.titulo);
    formData.append("contenido", aviso.contenido);
    formData.append("tipo", aviso.tipo);
    formData.append("activo", String(aviso.activo));
    if (aviso.fecha_activacion) formData.append("fecha_activacion", aviso.fecha_activacion);
    if (aviso.fecha_expiracion) formData.append("fecha_expiracion", aviso.fecha_expiracion);
    if (aviso.segmentacion_area) formData.append("segmentacion_area", aviso.segmentacion_area);
    if (aviso.segmentacion_estado) formData.append("segmentacion_estado", aviso.segmentacion_estado);

    const url = aviso.id ? `/api/cms/avisos/${aviso.id}/` : "/api/cms/avisos/";
    const method = aviso.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        toast.success(aviso.id ? "Aviso actualizado" : "Aviso creado");
        setNuevo(false);
        setEditando(null);
        cargarAvisos();
      } else {
        const err = await res.text();
        toast.error(`Error: ${err}`);
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const eliminarAviso = async (id: number) => {
    if (!confirm("¿Eliminar este aviso?")) return;
    try {
      const res = await fetch(`/api/cms/avisos/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Aviso eliminado");
        cargarAvisos();
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  if (cargando) return <div className="text-sm text-muted-foreground">Cargando avisos...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestión de Avisos</h3>
        <Button onClick={() => { setNuevo(true); setEditando(null); }} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Aviso
        </Button>
      </div>

      {(nuevo || editando) && (
        <FormularioAviso
          aviso={editando || { titulo: "", contenido: "", tipo: "info", activo: true }}
          onGuardar={guardarAviso}
          onCancel={() => { setNuevo(false); setEditando(null); }}
        />
      )}

      <div className="space-y-2">
        {avisos.map((aviso) => (
          <Card key={aviso.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{aviso.titulo}</h4>
                    <Badge variant={aviso.activo ? "default" : "secondary"}>
                      {aviso.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="outline">{aviso.tipo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{aviso.contenido}</p>
                  {aviso.fecha_expiracion && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expira: {new Date(aviso.fecha_expiracion).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditando(aviso); setNuevo(false); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => eliminarAviso(aviso.id!)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FormularioAviso({ aviso, onGuardar, onCancel }: {
  aviso: Aviso;
  onGuardar: (aviso: Aviso) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Aviso>(aviso);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{aviso.id ? "Editar Aviso" : "Nuevo Aviso"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Título</Label>
          <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Contenido</Label>
          <Textarea value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} rows={4} />
        </div>
        <div className="grid gap-2">
          <Label>Tipo</Label>
          <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Informativo</SelectItem>
              <SelectItem value="warning">Advertencia</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="success">Éxito</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="importante">Importante</SelectItem>
              <SelectItem value="convocatoria">Convocatoria</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Fecha de activación</Label>
            <Input type="datetime-local" value={form.fecha_activacion?.slice(0, 16) || ""} onChange={(e) => setForm({ ...form, fecha_activacion: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Fecha de expiración</Label>
            <Input type="datetime-local" value={form.fecha_expiracion?.slice(0, 16) || ""} onChange={(e) => setForm({ ...form, fecha_expiracion: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="activo" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
          <Label htmlFor="activo">Activo</Label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={() => onGuardar(form)}>Guardar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
