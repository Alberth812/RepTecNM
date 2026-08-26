"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { enviarMensaje } from "@/lib/mensajes";

export function FormularioMensaje({
  destinatario,
  onEnviado,
}: {
  destinatario: { rol: "admin" | "afiliado"; nombre: string };
  onEnviado?: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");

  const enviar = () => {
    if (nombre.trim().length < 2 || nombre.trim().length > 150) {
      toast.error("Escribe tu nombre completo.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      toast.error("Ingresa un correo electrónico válido.");
      return;
    }
    const tel = telefono.replace(/\D/g, "");
    if (tel.length < 7 || tel.length > 15) {
      toast.error("Ingresa un teléfono de contacto válido.");
      return;
    }
    if (asunto.trim().length < 5 || asunto.trim().length > 150) {
      toast.error("El asunto debe tener entre 5 y 150 caracteres.");
      return;
    }
    if (cuerpo.trim().length < 20 || cuerpo.trim().length > 2000) {
      toast.error("El mensaje debe tener entre 20 y 2000 caracteres.");
      return;
    }
    enviarMensaje({
      para: destinatario,
      de: { nombre: nombre.trim(), correo: correo.trim(), telefono },
      asunto: asunto.trim(),
      cuerpo: cuerpo.trim(),
    });
    toast.success(`Mensaje enviado a ${destinatario.nombre}. Podrá responderte por el correo o teléfono que dejaste.`);
    setNombre("");
    setCorreo("");
    setTelefono("");
    setAsunto("");
    setCuerpo("");
    onEnviado?.();
  };

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">
        Para: <span className="font-semibold text-foreground">{destinatario.nombre}</span>
      </p>
      <label className="grid gap-1 text-sm">
        Tu nombre completo
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={150} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Tu correo electrónico
          <Input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          Tu teléfono de contacto
          <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="55 0000 0000" />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        Asunto
        <Input value={asunto} onChange={(e) => setAsunto(e.target.value)} maxLength={150} />
      </label>
      <label className="grid gap-1 text-sm">
        Mensaje
        <Textarea rows={5} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} maxLength={2000} />
        <span className="text-xs text-muted-foreground">{cuerpo.length} / 2000</span>
      </label>
      <Button onClick={enviar} className="justify-self-end">Enviar mensaje</Button>
      <p className="text-xs text-muted-foreground">
        El destinatario verá tus datos de contacto y te responderá por el medio que prefiera (RF-MSG-002).
      </p>
    </div>
  );
}
