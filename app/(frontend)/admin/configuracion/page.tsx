"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CambiarContrasena } from "@/components/public/cambiar-contrasena";

export default function ConfiguracionPage() {
  const [nombre, setNombre] = useState("Administración RepTecNM");
  const [correo, setCorreo] = useState("admin@reptecnm.mx");
  const [foto, setFoto] = useState("");

  useEffect(() => setFoto(localStorage.getItem("rep-avatar") ?? ""), []);

  const subirFoto = (f: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Formato no permitido. Usa JPG, PNG o WebP.");
      return;
    }
    if (f.size > 1500000) {
      toast.error("Imagen demasiado pesada (máx. 1.5 MB).");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      localStorage.setItem("rep-avatar", url);
      setFoto(url);
      toast.success("Foto de perfil actualizada.");
    };
    r.readAsDataURL(f);
  };

  return (
    <div className="grid max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Preferencias de la cuenta de administración.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Foto de perfil</h2>
        <p className="text-sm text-muted-foreground">
          La administración no es una sola persona: usa el logo de la asociación o la foto de quien gestiona la cuenta.
        </p>
        <div className="flex items-center gap-4">
          {foto ? (
            <img
              src={foto}
              alt="Foto de perfil"
              className="h-14 w-14 rounded-full border object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#004B87] text-sm font-bold text-white">
              AG
            </div>
          )}
          <label className="cursor-pointer rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
            Subir foto
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) subirFoto(f);
              }}
            />
          </label>
          {foto && (
            <button
              type="button"
              className="text-xs font-medium text-destructive hover:underline"
              onClick={() => {
                localStorage.removeItem("rep-avatar");
                setFoto("");
                toast.success("Foto retirada; se muestran las iniciales.");
              }}
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Perfil</h2>
        <label className="grid gap-1 text-sm">
          Nombre visible
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          Correo
          <Input value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </label>
        <Button
          className="justify-self-start"
          onClick={() => toast.success("Cambios guardados (simulado en el prototipo).")}
        >
          Guardar cambios
        </Button>
      </div>

      <CambiarContrasena />
    </div>
  );
}