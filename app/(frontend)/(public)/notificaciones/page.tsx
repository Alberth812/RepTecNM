"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, FileText, MessageSquareText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  cargarNotificaciones, leerLeidas, marcarLeidas, type Notificacion,
} from "@/lib/notificaciones";

export default function NotificacionesPage() {
  const [notis, setNotis] = useState<Notificacion[]>([]);
  const [leidas, setLeidas] = useState<string[]>([]);

  useEffect(() => {
    setNotis(cargarNotificaciones());
    setLeidas(leerLeidas());
  }, []);

  const noLeidas = notis.filter((n) => !leidas.includes(n.id)).length;

  const marcarTodas = () => {
    const ids = notis.map((n) => n.id);
    marcarLeidas(ids);
    setLeidas(ids);
  };

  const iconoDe = (t: Notificacion["tipo"]) =>
    t === "retiro" ? Trash2 : t === "comentario" ? MessageSquareText : FileText;
  const colorDe = (t: Notificacion["tipo"]) =>
    t === "retiro"
      ? "bg-red-500/10 text-red-600"
      : t === "comentario"
        ? "bg-[#004B87]/10 text-[#004B87]"
        : "bg-amber-500/10 text-amber-600";

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="mt-2 text-muted-foreground">
            Comentarios del foro, retiros de publicación y avisos del sistema.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={noLeidas === 0} onClick={marcarTodas}>
          <CheckCheck className="mr-2 h-4 w-4" /> Marcar todas como leídas
        </Button>
      </div>

      <div className="grid gap-3">
        {notis.map((n) => {
          const Icono = iconoDe(n.tipo);
          const sinLeer = !leidas.includes(n.id);
          return (
            <article
              key={n.id}
              className={`flex gap-4 rounded-2xl border bg-card p-5 ${sinLeer ? "ring-1 ring-[#004B87]/40" : ""}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorDe(n.tipo)}`}>
                <Icono className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{n.documento}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.fecha}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.texto}</p>
              </div>
              {sinLeer && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#004B87]" />}
            </article>
          );
        })}
        {notis.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 opacity-50" />
            <p>Sin notificaciones por ahora.</p>
          </div>
        )}
      </div>
    </div>
  );
}
