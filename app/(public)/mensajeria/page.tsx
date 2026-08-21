"use client";
import { AvisoDemo } from "@/components/public/aviso-demo";
import { useRol } from "@/lib/use-rol";

import { useRef, useState, useEffect } from "react";
import {
  Paperclip, Send, Search, Ban, CircleX, FileText, Image as ImageIcon,
  MessageSquare, Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { conversacionesIniciales, type Conversacion, type Mensaje } from "@/lib/mock/mensajeria";

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function iconoAdjunto(tipo: string) {
  return tipo.toLowerCase().includes("pdf") ? FileText : ImageIcon;
}

export default function MensajeriaPage() {
  const [convs, setConvs] = useState<Conversacion[]>(conversacionesIniciales);
  const [activaId, setActivaId] = useState<string | null>(conversacionesIniciales[0]?.id ?? null);
  const [filtro, setFiltro] = useState("");
  const [nuevoMsj, setNuevoMsj] = useState("");
  const [adjunto, setAdjunto] = useState<{ nombre: string; tipo: string; tamano: string } | null>(null);
  const [bloqueando, setBloqueando] = useState<Conversacion | null>(null);
  const { rol } = useRol();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activa = convs.find((c) => c.id === activaId) ?? null;

  const convsFiltradas = convs
    .filter((c) => c.nombre.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) => {
      if (a.noLeidos > 0 && b.noLeidos === 0) return -1;
      if (a.noLeidos === 0 && b.noLeidos > 0) return 1;
      return 0;
    });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activaId, activa?.mensajes.length]);

  const abrirConversacion = (c: Conversacion) => {
    setActivaId(c.id);
    if (c.noLeidos > 0) {
      setConvs((prev) => prev.map((x) => x.id === c.id ? {
        ...x,
        noLeidos: 0,
        mensajes: x.mensajes.map((m) => m.remitente === "otro" ? { ...m, leido: true } : m),
      } : x));
    }
  };

  const enviarMensaje = () => {
    if (!activa) return;
    if (!nuevoMsj.trim() && !adjunto) return;
    if (activa.bloqueado) { toast.error("No puedes enviar mensajes a este usuario."); return; }

    const nuevo: Mensaje = {
      id: `m-${Date.now()}`,
      remitente: "yo",
      contenido: nuevoMsj.trim(),
      adjunto: adjunto ?? undefined,
      hora: "Ahora",
      leido: true,
    };

    setConvs((prev) => prev.map((c) => c.id === activa.id ? {
      ...c,
      mensajes: [...c.mensajes, nuevo],
      ultimoMensaje: nuevoMsj.trim() || `Adjunto: ${adjunto?.nombre}`,
      ultimaHora: "Ahora",
    } : c));

    setNuevoMsj("");
    setAdjunto(null);
  };

  const seleccionarAdjunto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const tiposValidos = ["application/pdf", "image/jpeg", "image/png"];
    if (!tiposValidos.includes(f.type)) { toast.error("Solo se aceptan PDF, JPG o PNG (RF-MSG-005)."); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("El archivo excede 5 MB."); return; }
    setAdjunto({ nombre: f.name, tipo: f.type, tamano: `${(f.size / 1024 / 1024).toFixed(1)} MB` });
    toast.success("Archivo listo para enviar.");
  };

  const confirmarBloqueo = () => {
    if (!bloqueando) return;
    setConvs((prev) => prev.map((c) => c.id === bloqueando.id ? { ...c, bloqueado: !c.bloqueado } : c));
    toast.success(bloqueando.bloqueado ? "Usuario desbloqueado." : "Usuario bloqueado. No podrán intercambiar mensajes (RF-MSG-007).");
    setBloqueando(null);
  };

  const totalNoLeidos = convs.reduce((acc, c) => acc + c.noLeidos, 0);

  return (
    <div className={`mx-auto flex w-full max-w-6xl flex-col px-4 py-4 ${rol === "visitante" ? "h-[calc(100dvh-100px)]" : "h-[calc(100dvh-170px)]"}`}>
      <AvisoDemo />

      <div className="flex shrink-0 items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Mensajería</h1>
          {totalNoLeidos > 0 && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {totalNoLeidos} sin leer
            </Badge>
          )}
        </div>
      </div>

      <p className="pb-4 text-sm text-muted-foreground">
        Mensajería interna entre profesionales afiliados de la red.
      </p>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm max-md:grid-rows-[220px_minmax(0,1fr)] md:grid-cols-[320px_1fr]">
        {/* Lista de conversaciones */}
        <div className="flex min-h-0 flex-col border-r">
          <div className="shrink-0 border-b p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar conversación"
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="scroll-glass flex-1 min-h-0 overflow-y-auto">
            <div className="p-2">
              {convsFiltradas.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
                  <Inbox className="h-8 w-8 opacity-50" />
                  <p>Sin conversaciones</p>
                </div>
              )}
              {convsFiltradas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => abrirConversacion(c)}
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                    c.id === activaId ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0 border">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {iniciales(c.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {c.nombre}
                        {c.bloqueado && <Ban className="ml-1 inline h-3 w-3 text-destructive" />}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">{c.ultimaHora}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.ultimoMensaje}</p>
                    <p className="truncate text-[11px] text-muted-foreground/70">{c.institucion}</p>
                  </div>
                  {c.noLeidos > 0 && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      {c.noLeidos}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex min-h-0 flex-col">
          {activa ? (
            <>
              <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {iniciales(activa.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{activa.nombre}</p>
                    <p className="text-xs text-muted-foreground">{activa.institucion}</p>
                  </div>
                </div>
                <Button
                  variant={activa.bloqueado ? "destructive" : "ghost"}
                  size="sm"
                  onClick={() => setBloqueando(activa)}
                >
                  {activa.bloqueado ? <CircleX className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                  {activa.bloqueado ? "Desbloquear" : "Bloquear"}
                </Button>
              </div>

              <div className="scroll-glass flex-1 min-h-0 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-3 p-5">
                  {activa.mensajes.map((m) => (
                    <div key={m.id} className={`flex ${m.remitente === "yo" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        m.remitente === "yo"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        {m.contenido && <p className="text-sm leading-snug">{m.contenido}</p>}
                        {m.adjunto && (
                          <div className={`mt-1 flex items-center gap-2 rounded-lg border p-2 text-xs ${
                            m.remitente === "yo" ? "border-white/30 bg-card/10" : "border-border bg-background"
                          }`}>
                            {(() => {
                              const Icon = iconoAdjunto(m.adjunto.tipo);
                              return <Icon className="h-4 w-4 shrink-0" />;
                            })()}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{m.adjunto.nombre}</p>
                              <p className="text-muted-foreground">{m.adjunto.tipo.includes("/") ? m.adjunto.tipo.split("/")[1].toUpperCase() : m.adjunto.tipo} · {m.adjunto.tamano}</p>
                            </div>
                          </div>
                        )}
                        <p className={`mt-1 text-[10px] ${
                          m.remitente === "yo" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {m.hora}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 border-t p-3">
                {adjunto && (
                  <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted/50 p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate font-medium">{adjunto.nombre}</span>
                      <span className="text-muted-foreground">· {adjunto.tamano}</span>
                    </div>
                    <button onClick={() => setAdjunto(null)} className="text-muted-foreground hover:text-foreground">×</button>
                  </div>
                )}
                {activa.bloqueado ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-muted py-3 text-xs text-muted-foreground">
                    <Ban className="h-3 w-3" /> Has bloqueado a este usuario.
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <label className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted">
                      <Paperclip className="h-4 w-4" />
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={seleccionarAdjunto} />
                    </label>
                    <Input
                      value={nuevoMsj}
                      onChange={(e) => setNuevoMsj(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); } }}
                      placeholder="Escribe un mensaje..."
                      className="h-9"
                    />
                    <Button size="icon" className="h-9 w-9 shrink-0" disabled={!nuevoMsj.trim() && !adjunto} onClick={enviarMensaje}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-40" />
              <p className="text-sm">Selecciona una conversación para comenzar</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!bloqueando} onOpenChange={(open) => !open && setBloqueando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bloqueando?.bloqueado ? "Desbloquear usuario" : "Bloquear usuario"}</DialogTitle>
            <DialogDescription>
              {bloqueando?.bloqueado
                ? `Podrás volver a intercambiar mensajes con ${bloqueando.nombre}.`
                : `Ninguno de los dos podrá enviar mensajes al otro. El historial existente permanecerá visible (RF-MSG-007).`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBloqueando(null)}>Cancelar</Button>
            <Button variant={bloqueando?.bloqueado ? "default" : "destructive"} onClick={confirmarBloqueo}>
              {bloqueando?.bloqueado ? "Desbloquear" : "Bloquear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
