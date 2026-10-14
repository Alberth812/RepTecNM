"use client";

import { useEffect, useState } from "react";
import { Lock, LockOpen, PenLine } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { USUARIOS_DEMO } from "@/lib/mock/usuarios";

export function TitularAsociacion() {
 const [abierto, setAbierto] = useState(false);
 const [clave, setClave] = useState("");
 const [nombre, setNombre] = useState("");
 const [firma, setFirma] = useState("");

 useEffect(() => {
 setNombre(localStorage.getItem("rep-titular-nombre") ?? "Dra. Elena Ruiz");
 setFirma(localStorage.getItem("rep-titular-firma") ?? "");
 }, []);

 const desbloquear = () => {
 const admin = USUARIOS_DEMO.find((u) => u.rol === "admin");
 if (!admin || clave !== admin.contrasena) {
 toast.error("Contraseña incorrecta.");
 return;
 }
 setAbierto(true);
 setClave("");
 };

 const subirFirma = (f: File) => {
 if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) {
 toast.error("Usa PNG (ideal con fondo transparente), JPG o WebP.");
 return;
 }
 if (f.size > 1000000) {
 toast.error("La firma no debe pesar más de 1 MB.");
 return;
 }
 const r = new FileReader();
 r.onload = () => setFirma(String(r.result));
 r.readAsDataURL(f);
 };

 const guardar = () => {
 if (!nombre.trim()) {
 toast.error("El nombre del titular es obligatorio.");
 return;
 }
 localStorage.setItem("rep-titular-nombre", nombre.trim());
 localStorage.setItem("rep-titular-firma", firma);
 toast.success("Titular y firma actualizados en las credenciales.");
 };

 return (
 <div className="grid gap-4 rounded-2xl border bg-card p-6">
 <div className="flex items-center justify-between">
 <h2 className="flex items-center gap-2 font-semibold">
 <PenLine className="h-4 w-4 text-muted-foreground" /> Titular de la asociación
 </h2>
 {!abierto && (
 <span className="flex items-center gap-1 text-xs text-muted-foreground">
 <Lock className="h-3 w-3" /> Protegido con contraseña
 </span>
 )}
 </div>
 <p className="text-sm text-muted-foreground">
 Nombre y firma de la presidencia que aparecen en el reverso de las credenciales impresas.
 </p>

 {!abierto ? (
 <div className="flex gap-2">
 <Input
 type="password"
 placeholder="Contraseña de administración"
 value={clave}
 onChange={(e) => setClave(e.target.value)}
 />
 <Button onClick={desbloquear}>
 <LockOpen className="mr-2 h-4 w-4" /> Desbloquear
 </Button>
 </div>
 ) : (
 <div className="grid gap-3">
 <label className="grid gap-1 text-sm">
 Nombre del titular
 <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
 </label>
 <div className="flex flex-wrap items-center gap-4">
 <div className="flex h-16 w-40 items-center justify-center rounded-lg border border-dashed bg-background">
 {firma ? (
 <img src={firma} alt="Firma" className="max-h-14 object-contain" />
 ) : (
 <span className="text-xs text-muted-foreground">Sin firma cargada</span>
 )}
 </div>
 <label className="cursor-pointer rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
 Subir firma
 <input
 type="file"
 accept="image/png,image/jpeg,image/webp"
 className="hidden"
 onChange={(e) => { const f = e.target.files?.[0]; if (f) subirFirma(f); }}
 />
 </label>
 {firma && (
 <button
 type="button"
 className="text-xs font-medium text-destructive hover:underline"
 onClick={() => setFirma("")}
 >
 Quitar firma
 </button>
 )}
 </div>
 <Button className="justify-self-start" onClick={guardar}>Guardar titular y firma</Button>
 </div>
 )}
 </div>
 );
}
