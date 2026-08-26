"use client";

import { useState } from "react";
import { KeyRound, MailQuestion } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { USUARIOS_DEMO } from "@/lib/mock/usuarios";
import { useRol } from "@/lib/use-rol";

export function CambiarContrasena() {
  const { nombre } = useRol();
  const [modo, setModo] = useState<"conoce" | "olvido">("conoce");
  const [paso, setPaso] = useState<1 | 2>(1);
  const [actual, setActual] = useState("");
  const [codigoGenerado, setCodigoGenerado] = useState("");
  const [codigoInput, setCodigoInput] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const claseOpcion = (activo: boolean) =>
    `flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
      activo
        ? "border-[#004B87] bg-[#004B87] text-white shadow-sm"
        : "border-border bg-background text-muted-foreground hover:bg-muted"
    }`;

  const cambiarModo = (m: "conoce" | "olvido") => {
    setModo(m);
    setPaso(1);
    setActual("");
    setCodigoInput("");
    setCodigoGenerado("");
    setNueva("");
    setConfirmar("");
  };

  const verificarActual = () => {
    const u = USUARIOS_DEMO.find((x) => x.nombre === (nombre ?? ""));
    if (!u) {
      toast.error("No se pudo identificar tu cuenta de demostración.");
      return;
    }
    if (actual !== u.contrasena) {
      toast.error("La contraseña actual no es correcta.");
      return;
    }
    setPaso(2);
  };

  const enviarCodigo = () => {
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    setCodigoGenerado(codigo);
    toast.success(`Código enviado a tu correo y teléfono afiliados. En la demo, tu código es ${codigo}.`);
  };

  const verificarCodigo = () => {
    if (!codigoGenerado) {
      toast.error("Primero solicita el código de verificación.");
      return;
    }
    if (codigoInput.trim() !== codigoGenerado) {
      toast.error("El código no coincide.");
      return;
    }
    setPaso(2);
  };

  const guardar = () => {
    if (nueva.length < 8 || !/[A-Z]/.test(nueva) || !/\d/.test(nueva)) {
      toast.error("La nueva contraseña debe tener 8+ caracteres, una mayúscula y un número.");
      return;
    }
    if (nueva !== confirmar) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setActual("");
    setCodigoInput("");
    setNueva("");
    setConfirmar("");
    setCodigoGenerado("");
    setPaso(1);
    toast.success("Contraseña actualizada correctamente (simulado; en producción RF-AUTH-010).");
  };

  return (
    <div className="grid gap-4 rounded-2xl border bg-card p-6">
      <h2 className="font-semibold">Cambiar contraseña</h2>

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => cambiarModo("conoce")} className={claseOpcion(modo === "conoce")}>
          <KeyRound className="h-4 w-4" /> Conozco mi contraseña
        </button>
        <button type="button" onClick={() => cambiarModo("olvido")} className={claseOpcion(modo === "olvido")}>
          <MailQuestion className="h-4 w-4" /> Olvidé mi contraseña
        </button>
      </div>

      {paso === 1 && modo === "conoce" && (
        <div className="grid gap-2">
          <label className="grid gap-1 text-sm">
            Contraseña actual
            <Input type="password" value={actual} onChange={(e) => setActual(e.target.value)} />
          </label>
          <Button className="justify-self-start" onClick={verificarActual}>Verificar</Button>
        </div>
      )}

      {paso === 1 && modo === "olvido" && (
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Enviaremos un código de verificación a tu correo y teléfono afiliados.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Código de 6 dígitos"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <Button variant="outline" onClick={enviarCodigo}>Enviar código</Button>
          </div>
          <Button className="justify-self-start" onClick={verificarCodigo}>Verificar código</Button>
        </div>
      )}

      {paso === 2 && (
        <div className="grid gap-3 border-t pt-4">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Identidad verificada. Ahora define tu nueva contraseña.
          </p>
          <label className="grid gap-1 text-sm">
            Nueva contraseña
            <Input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Repetir nueva contraseña
            <Input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
          </label>
          <Button className="justify-self-start" onClick={guardar}>Cambiar contraseña</Button>
        </div>
      )}
    </div>
  );
}
