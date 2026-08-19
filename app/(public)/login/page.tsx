"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [ver, setVer] = useState(false);
  const [recAbierto, setRecAbierto] = useState(false);
  const [correoRec, setCorreoRec] = useState("");
  const [recEnviado, setRecEnviado] = useState(false);
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera(espera - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const enviarRecuperacion = () => {
    if (!/^\S+@\S+\.\S+$/.test(correoRec.trim())) {
      toast.error("Ingresa un correo válido.");
      return;
    }
    setRecEnviado(true);
    setEspera(120);
    toast.success("Enlace de recuperación enviado (simulado en el prototipo).");
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-100px)] items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#004B87]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/60 bg-background/80 p-8 shadow-2xl shadow-[#004B87]/10 backdrop-blur-xl md:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004B87] to-[#0070C0] shadow-lg shadow-[#004B87]/30">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Bienvenido de nuevo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accede a tu perfil, credencial y mensajería de la Red de Egresados.
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.info("Disponible al conectar el backend (Incremento 1, RF-AUTH).");
          }}
        >
          <div className="grid gap-2">
            <label htmlFor="correo" className="text-sm font-medium">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="correo" type="email" required placeholder="tucorreo@ejemplo.com" className="bg-background pl-9" />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => { setRecAbierto(true); setRecEnviado(false); setCorreoRec(""); }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={ver ? "text" : "password"}
                required
                placeholder="••••••••"
                className="bg-background pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setVer(!ver)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-2 w-full bg-gradient-to-r from-[#004B87] to-[#0070C0] hover:from-[#003562] hover:to-[#004B87]"
          >
            Iniciar sesión
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">¿Primera vez aquí?</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Link href="/registro" className="block">
          <Button variant="outline" className="w-full">Crear cuenta de afiliado</Button>
        </Link>

        <Dialog open={recAbierto} onOpenChange={setRecAbierto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recuperar contraseña</DialogTitle>
              <DialogDescription>
                Te enviaremos un enlace para restablecerla (RF-AUTH-011).
              </DialogDescription>
            </DialogHeader>
            {recEnviado ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                Si el correo existe en nuestra base, recibirá el enlace en unos minutos.
                Revisa también la carpeta de spam.
              </div>
            ) : (
              <Input
                type="email"
                value={correoRec}
                onChange={(e) => setCorreoRec(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
              />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecAbierto(false)}>Cerrar</Button>
              {recEnviado ? (
                <Button disabled={espera > 0} onClick={enviarRecuperacion}>
                  {espera > 0 ? `Reenviar en ${espera} s` : "Reenviar enlace"}
                </Button>
              ) : (
                <Button onClick={enviarRecuperacion}>Enviar enlace</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          Entorno de demostración. En producción, la autenticación usa tokens JWT
          y sesiones con expiración a 30 días (RNF-001 y RF-AUTH-009).
        </p>
      </div>
    </div>
  );
}
