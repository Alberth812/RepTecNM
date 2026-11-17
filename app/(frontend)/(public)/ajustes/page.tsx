"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CambiarContrasena } from "@/components/public/cambiar-contrasena";
import { SelectorTema } from "@/components/public/selector-tema";

const FONDOS = [
 { nombre: "Sin fondo", valor: "" },
 { nombre: "Azul institucional", valor: "linear-gradient(160deg, rgba(0,75,135,0.10), rgba(0,112,192,0.18))" },
 { nombre: "Verde bosque", valor: "linear-gradient(160deg, rgba(22,101,52,0.10), rgba(34,197,94,0.16))" },
 { nombre: "Ámbar suave", valor: "linear-gradient(160deg, rgba(180,140,80,0.10), rgba(245,158,11,0.16))" },
 { nombre: "Pizarra", valor: "linear-gradient(160deg, rgba(15,23,42,0.35), rgba(30,41,59,0.5))" },
];

export default function AjustesPage() {
 const [fondo, setFondo] = useState("");

 useEffect(() => {
 const v = localStorage.getItem("rep-fondo-chat") ?? "";
 setFondo(v.startsWith("url(") ? "" : v);
 }, []);

 const guardarFondo = (v: string) => {
 localStorage.setItem("rep-fondo-chat", v);
 setFondo(v);
 toast.success("Fondo del chat actualizado.");
 };

 return (
 <div className="mx-auto grid max-w-2xl gap-6 px-4 py-10">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
 <p className="mt-2 text-muted-foreground">Preferencias personales de tu cuenta.</p>
 </div>

 <div className="grid gap-4 rounded-2xl border bg-card p-6">
 <h2 className="font-semibold">Tema de la plataforma</h2>
 <p className="text-sm text-muted-foreground">
 Elige entre modo claro y oscuro; se aplica en tu área de trabajo y se recuerda en este dispositivo.
 </p>
 <SelectorTema />
 </div>

 <div className="grid gap-4 rounded-2xl border bg-card p-6">
 <h2 className="font-semibold">Color de fondo del chat de mensajería</h2>
 <p className="text-sm text-muted-foreground">
 Elige un tono para el área de mensajes; se aplica solo en tu navegador.
 </p>
 <div className="flex flex-wrap gap-2">
 {FONDOS.map((f) => (
 <button
 key={f.nombre}
 type="button"
 onClick={() => guardarFondo(f.valor)}
 className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
 fondo === f.valor
 ? "border-[#004B87] bg-[#004B87] text-white"
 : "border-border bg-background text-muted-foreground hover:bg-muted"
 }`}
 >
 {f.nombre}
 </button>
 ))}
 </div>
 <div
 className="h-24 rounded-xl border bg-background"
 style={{ backgroundImage: fondo || undefined, backgroundSize: "cover", backgroundPosition: "center" }}
 />
 </div>

 <CambiarContrasena />
 </div>
 );
}
