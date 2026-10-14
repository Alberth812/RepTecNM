"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Download, GraduationCap, HeartPulse, Lock, Save } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { BadgeEstado } from "@/components/public/badge-estado";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
 Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import { INSTITUTOS_BASE } from "@/lib/mock/institutos";
const INSTITUTOS = INSTITUTOS_BASE.filter((i) => i.activo).map((i) => i.nombre);
const TIPOS_SANGUINEOS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const FOLIO = "A1B2C3D4E5F6";
const NUMERO = "REP-2026-00001";

interface Perfil {
 nombre: string;
 posgrado: string;
 instituto: string;
 correo: string;
 telefono: string;
 tipoSanguineo: string;
 alergias: string;
 contactoNombre: string;
 contactoParentesco: string;
 contactoTelefono: string;
 emergenciaVisible: boolean;
}

const PERFIL_DEFAULT: Perfil = {
 nombre: "María Fernanda López Herrera",
 posgrado: "Maestría en Ciencias Computacionales",
 instituto: "Instituto Tecnológico de Celaya",
 correo: "mf.lopez@ejemplo.com",
 telefono: "55 1234 5678",
 tipoSanguineo: "O+",
 alergias: "Penicilina",
 contactoNombre: "Carlos López Herrera",
 contactoParentesco: "Hermano",
 contactoTelefono: "55 9876 5432",
 emergenciaVisible: true,
};

function iniciales(nombre: string) {
 return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
 return (
 <section className="rounded-2xl border bg-card p-6">
 <h2 className="mb-4 text-sm font-semibold">{titulo}</h2>
 <div className="grid gap-4 md:grid-cols-2">{children}</div>
 </section>
 );
}

export default function CredencialPage() {
 const [perfil, setPerfil] = useState<Perfil>(PERFIL_DEFAULT);
 const [origen, setOrigen] = useState("");
 const [dialogo, setDialogo] = useState(false);
 const [contrasena, setContrasena] = useState("");
 const [verEmergencia, setVerEmergencia] = useState(false);

 useEffect(() => {
 setOrigen(window.location.origin);
 try {
 const g = localStorage.getItem("rep-perfil");
 if (g) setPerfil({ ...PERFIL_DEFAULT, ...JSON.parse(g) });
 } catch {
 /* sin almacenamiento disponible */
 }
 }, []);

 const actualizar = (c: Partial<Perfil>) => setPerfil((p) => ({ ...p, ...c }));

 const guardar = () => {
 if (!perfil.nombre.trim()) { toast.error("El nombre es obligatorio."); return; }
 try {
 localStorage.setItem("rep-perfil", JSON.stringify(perfil));
 toast.success("Datos actualizados. Tu credencial se regeneró con la información vigente.");
 } catch {
 toast.info("Cambios aplicados solo en esta sesión: tu navegador bloquea el almacenamiento local.");
 }
 };

 const confirmar = () => {
 if (!contrasena.trim()) return;
 setVerEmergencia(true);
 setDialogo(false);
 setContrasena("");
 };

 return (
 <div className="mx-auto max-w-6xl px-4 py-10">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight">Mi espacio personal</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Administra tu información y genera tu credencial digital (RF-CRED-001).
 </p>
 </div>
 <BadgeEstado estado="ACTIVO" />
 </div>

 <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
 {/* Formulario editable */}
 <div className="space-y-6">
 <Seccion titulo="Datos profesionales">
 <div className="grid gap-2 md:col-span-2">
 <span className="text-sm font-medium">Nombre completo</span>
 <Input value={perfil.nombre} onChange={(e) => actualizar({ nombre: e.target.value })} />
 </div>
 <div className="grid gap-2 md:col-span-2">
 <span className="text-sm font-medium">Posgrado</span>
 <Input value={perfil.posgrado} onChange={(e) => actualizar({ posgrado: e.target.value })} />
 </div>
 <div className="grid gap-2 md:col-span-2">
 <span className="text-sm font-medium">Instituto TecNM</span>
 <Select value={perfil.instituto} onValueChange={(v) => { if (v) actualizar({ instituto: v }); }}>
 <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
 <SelectContent>
 {INSTITUTOS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </Seccion>

 <Seccion titulo="Contacto">
 <div className="grid gap-2">
 <span className="text-sm font-medium">Correo</span>
 <Input value={perfil.correo} onChange={(e) => actualizar({ correo: e.target.value })} />
 </div>
 <div className="grid gap-2">
 <span className="text-sm font-medium">Teléfono</span>
 <Input value={perfil.telefono} onChange={(e) => actualizar({ telefono: e.target.value })} />
 </div>
 </Seccion>

 <Seccion titulo="Información de emergencia">
 <div className="grid gap-2">
 <span className="text-sm font-medium">Tipo sanguíneo</span>
 <Select value={perfil.tipoSanguineo} onValueChange={(v) => { if (v) actualizar({ tipoSanguineo: v }); }}>
 <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
 <SelectContent>
 {TIPOS_SANGUINEOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="grid gap-2">
 <span className="text-sm font-medium">Alergias</span>
 <Input value={perfil.alergias} onChange={(e) => actualizar({ alergias: e.target.value })} />
 </div>
 <div className="grid gap-2">
 <span className="text-sm font-medium">Contacto de emergencia</span>
 <Input value={perfil.contactoNombre} onChange={(e) => actualizar({ contactoNombre: e.target.value })} />
 </div>
 <div className="grid gap-2">
 <span className="text-sm font-medium">Parentesco</span>
 <Input value={perfil.contactoParentesco} onChange={(e) => actualizar({ contactoParentesco: e.target.value })} />
 </div>
 <div className="grid gap-2">
 <span className="text-sm font-medium">Teléfono del contacto</span>
 <Input value={perfil.contactoTelefono} onChange={(e) => actualizar({ contactoTelefono: e.target.value })} />
 </div>
 <label className="flex items-center gap-2 self-center text-sm">
 <Checkbox
 checked={perfil.emergenciaVisible}
 onCheckedChange={(v) => actualizar({ emergenciaVisible: v === true })}
 />
 Mostrar en la verificación pública (RF-CRED-007)
 </label>
 </Seccion>

 <Button onClick={guardar} className="w-full md:w-auto">
 <Save className="mr-2 h-4 w-4" /> Guardar cambios
 </Button>
 </div>

 {/* Credencial en vivo */}
 <div>
 <div id="credencial-imprimible" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
 <div className="bg-gradient-to-r from-[#003366] via-[#004B87] to-[#0070C0] p-5 text-white">
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <img src="/logo.png" alt="REP-TecNM" className="h-10 w-10 rounded-lg bg-white object-cover object-[center_15%] p-0.5" />
 <div>
 <p className="font-serif text-lg font-bold leading-tight">REP TecNM</p>
 <p className="text-[10px] uppercase tracking-widest text-sky-100/90">Red de Egresados de Posgrado</p>
 </div>
 </div>
 <span className="rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">ACTIVO</span>
 </div>
 </div>

 <div className="p-5 text-slate-900">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="flex h-24 w-20 items-center justify-center rounded-xl border-2 border-[#004B87]/20 bg-slate-100 text-2xl font-bold text-[#004B87]">
 {iniciales(perfil.nombre || "S N")}
 </div>
 <div>
 <p className="font-semibold leading-tight text-slate-900">{perfil.nombre}</p>
 <p className="mt-1 font-mono text-sm font-bold text-[#004B87]">{NUMERO}</p>
 <p className="mt-1 text-xs text-slate-600">{perfil.posgrado}</p>
 <p className="text-xs text-slate-600">{perfil.instituto}</p>
 </div>
 </div>
 <div className="rounded-xl border border-slate-200 bg-white p-2">
 <QRCodeSVG value={`${origen}/verificar/${FOLIO}`} size={88} />
 </div>
 </div>

 <div className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-center">
 <span className="text-xs text-slate-600">Folio de verificación: </span>
 <span className="font-mono text-xs font-semibold tracking-wider text-slate-900">{FOLIO}</span>
 </div>

 <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-600">
 <span>Vigencia 2026 · Tecnológico Nacional de México</span>
 <span className="font-mono">reptecnm.mx/verificar</span>
 </div>

 {verEmergencia && (
 <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
 <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
 <HeartPulse className="h-4 w-4" /> En caso de emergencia
 </p>
 <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-red-900">
 <div><dt className="font-medium">Tipo sanguíneo</dt><dd>{perfil.tipoSanguineo}</dd></div>
 <div><dt className="font-medium">Alergias</dt><dd>{perfil.alergias}</dd></div>
 <div className="col-span-2">
 <dt className="font-medium">Contacto</dt>
 <dd>{perfil.contactoNombre} ({perfil.contactoParentesco}) · {perfil.contactoTelefono}</dd>
 </div>
 </dl>
 </div>
 )}
 </div>
 </div>

 <div className="mt-4 grid gap-2">
 <Button onClick={() => window.print()}>
 <Download className="mr-2 h-4 w-4" /> Descargar PDF (carnet / carta)
 </Button>
 <Button variant="outline" onClick={() => setDialogo(true)}>
 <Lock className="mr-2 h-4 w-4" /> Ver información de emergencia
 </Button>
 </div>
 <p className="mt-3 text-center text-xs text-muted-foreground">
 El código QR apunta a la página pública de verificación (RF-CRED-009).
 Al imprimir, elige "Guardar como PDF" y el tamaño de papel que necesites.
 </p>
 </div>
 </div>

 <Dialog open={dialogo} onOpenChange={setDialogo}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Confirmar identidad</DialogTitle>
 <DialogDescription>
 Por seguridad, introduce tu contraseña para mostrar los datos de emergencia (RF-CRED-006).
 </DialogDescription>
 </DialogHeader>
 <Input
 type="password"
 value={contrasena}
 onChange={(e) => setContrasena(e.target.value)}
 placeholder="Contraseña"
 />
 <DialogFooter>
 <Button variant="outline" onClick={() => setDialogo(false)}>Cancelar</Button>
 <Button onClick={confirmar} disabled={!contrasena.trim()}>Mostrar</Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
