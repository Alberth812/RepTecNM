"use client";

import { useState } from "react";
import { BellRing, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cargarAvisos, guardarAvisos, type Aviso } from "@/lib/avisos";

const VACIO: Aviso = { id: "", titulo: "", texto: "", tono: "info", activo: true };

export function EditorAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>(cargarAvisos());
  const [form, setForm] = useState<Aviso>(VACIO);

  const persistir = (lista: Aviso[]) => {
    setAvisos(lista);
    guardarAvisos(lista);
  };

  const guardar = () => {
    if (form.titulo.trim().length < 3) {
      toast.error("El título debe tener al menos 3 caracteres.");
      return;
    }
    if (form.texto.trim().length < 10 || form.texto.trim().length > 300) {
      toast.error("El texto debe tener entre 10 y 300 caracteres.");
      return;
    }
    if (form.id) {
      persistir(avisos.map((a) => (a.id === form.id ? { ...form } : a)));
      toast.success("Aviso actualizado.");
    } else {
      persistir([{ ...form, id: `AV-${Date.now()}` }, ...avisos]);
      toast.success("Aviso publicado.");
    }
    setForm(VACIO);
  };

  const alternar = (id: string) =>
    persistir(avisos.map((a) => (a.id === id ? { ...a, activo: !a.activo } : a)));

  const eliminar = (id: string) => {
    persistir(avisos.filter((a) => a.id !== id));
    toast.success("Aviso eliminado.");
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-2xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <BellRing className="h-4 w-4 text-muted-foreground" />
          {form.id ? "Editar aviso" : "Nuevo aviso flotante"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <label className="grid gap-1 text-sm">
            Título
            <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} maxLength={80} />
          </label>
          <label className="grid gap-1 text-sm">
            Tono
            <Select value={form.tono} onValueChange={(v) => { if (v) setForm({ ...form, tono: v as Aviso["tono"] }); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informativo (azul)</SelectItem>
                <SelectItem value="exito">Positivo (verde)</SelectItem>
                <SelectItem value="alerta">Atención (ámbar)</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Texto del aviso
          <Textarea rows={3} value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} maxLength={300} />
          <span className="text-xs text-muted-foreground">{form.texto.length} / 300</span>
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.activo} onCheckedChange={(v) => setForm({ ...form, activo: v === true })} />
            Activo
          </label>
          <Button onClick={guardar} className="ml-auto">
            <Plus className="mr-2 h-4 w-4" /> {form.id ? "Guardar cambios" : "Publicar aviso"}
          </Button>
          {form.id && (
            <Button variant="outline" onClick={() => setForm(VACIO)}>Cancelar edición</Button>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        {avisos.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{a.titulo}</p>
              <p className="truncate text-sm text-muted-foreground">{a.texto}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              a.activo ? "bg-green-500/15 text-green-700" : "bg-muted text-muted-foreground"
            }`}>
              {a.activo ? "ACTIVO" : "PAUSADO"}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setForm(a)} aria-label="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => alternar(a.id)} aria-label="Activar o pausar">
              <BellRing className={`h-4 w-4 ${a.activo ? "text-[#004B87]" : "text-muted-foreground"}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => eliminar(a.id)}
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {avisos.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No hay avisos publicados.
          </p>
        )}
      </div>
    </div>
  );
}
