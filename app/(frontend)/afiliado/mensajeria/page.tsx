"use client";

import { useEffect, useState } from "react";
import { Inbox, Mail, Phone } from "lucide-react";

import { AvisoDemo } from "@/components/public/aviso-demo";
import { Button } from "@/components/ui/button";
import { cargarMensajes, marcarLeido, type Mensaje } from "@/lib/mensajes";
import { useRol } from "@/lib/use-rol";

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MensajeriaPage() {
  const { rol } = useRol();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [pestana, setPestana] = useState<"recibidos" | "enviados">("recibidos");
  const [abierto, setAbierto] = useState<Mensaje | null>(null);

  useEffect(() => setMensajes(cargarMensajes()), []);

  const correoPropio = rol === "admin" ? "admin@reptecnm.mx" : "mf.lopez@ejemplo.com";
  const recibidos = mensajes.filter((m) => m.para.rol === rol);
  const enviados = mensajes.filter((m) => m.de.correo === correoPropio);
  const lista = pestana === "recibidos" ? recibidos : enviados;

  const abrir = (m: Mensaje) => {
    setAbierto(m);
    if (!m.leido) {
      marcarLeido(m.id);
      setMensajes(cargarMensajes());
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8">
      <AvisoDemo />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensajería</h1>
          <p className="mt-2 text-muted-foreground">
            Buzón de contacto: recibes mensajes con los datos del remitente y respondes por el medio que prefieras.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["recibidos", "enviados"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setPestana(p); setAbierto(null); }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              pestana === p
                ? "border-[#004B87] bg-[#004B87] text-white"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="grid min-w-0 content-start gap-2 rounded-2xl border bg-card p-3">
          {lista.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => abrir(m)}
              className={`block w-full min-w-0 rounded-xl border p-3 text-left transition-colors ${
                abierto?.id === m.id
                  ? "border-[#004B87] bg-[#004B87]/10"
                  : "border-transparent hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold">
                  {pestana === "recibidos" ? m.de.nombre : `Para: ${m.para.nombre}`}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{fechaCorta(m.fecha)}</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{m.asunto}</p>
              <div className="mt-1 flex items-center gap-2">
                {!m.leido && pestana === "recibidos" && (
                  <span className="h-2 w-2 rounded-full bg-[#004B87]" />
                )}
                <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{m.cuerpo}</p>
              </div>
            </button>
          ))}
          {lista.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 opacity-50" />
              <p>{pestana === "recibidos" ? "Sin mensajes recibidos." : "Aún no envías mensajes."}</p>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border bg-card p-6">
          {abierto ? (
            <div className="grid gap-4">
              <div>
                <h2 className="text-xl font-semibold">{abierto.asunto}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pestana === "recibidos" ? `De: ${abierto.de.nombre}` : `Para: ${abierto.para.nombre}`} · {fechaCorta(abierto.fecha)}
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                <p className="whitespace-pre-wrap leading-relaxed">{abierto.cuerpo}</p>
              </div>
              {pestana === "recibidos" && (
                <div className="grid gap-3">
                  <p className="text-sm font-semibold">Datos de contacto del remitente</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={`mailto:${abierto.de.correo}`}>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" /> {abierto.de.correo}
                      </Button>
                    </a>
                    <a href={`tel:${abierto.de.telefono.replace(/\s/g, "")}`}>
                      <Button variant="outline" size="sm">
                        <Phone className="mr-2 h-4 w-4" /> {abierto.de.telefono}
                      </Button>
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Responde por el medio que prefieras; la plataforma no almacena tu respuesta (RF-MSG-002).
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 opacity-40" />
              <p>Selecciona un mensaje para leerlo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
