"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INSTITUTOS_BASE } from "@/lib/mock/institutos";

export default function InstitutosPage() {
  const [lista, setLista] = useState(INSTITUTOS_BASE);
  const [nuevo, setNuevo] = useState("");

  const agregar = () => {
    const n = nuevo.trim();
    if (!n) return;
    if (lista.some((i) => i.nombre.toLowerCase() === n.toLowerCase())) {
      toast.error("Ese instituto ya está registrado.");
      return;
    }
    setLista((p) => [...p, { nombre: n, activo: true }]);
    setNuevo("");
    toast.success("Instituto agregado al catálogo de opciones.");
  };

  const alternar = (nombre: string) => {
    setLista((p) => p.map((i) => (i.nombre === nombre ? { ...i, activo: !i.activo } : i)));
  };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Institutos TecNM</h1>
        <p className="text-sm text-muted-foreground">
          Opciones disponibles en registro, credencial y formularios. Los deshabilitados
          dejan de ofrecerse sin borrar el historial.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Nombre del instituto"
          onKeyDown={(e) => { if (e.key === "Enter") agregar(); }}
        />
        <Button onClick={agregar}>
          <Plus className="mr-2 h-4 w-4" /> Agregar
        </Button>
      </div>

      <div className="divide-y rounded-lg border bg-card">
        {lista.map((i) => (
          <div key={i.nombre} className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{i.nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={i.activo ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}>
                {i.activo ? "Activo" : "Deshabilitado"}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => alternar(i.nombre)}>
                {i.activo ? "Deshabilitar" : "Habilitar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
