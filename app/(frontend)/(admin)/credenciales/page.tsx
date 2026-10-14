"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CalendarRange, Printer, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Persona = {
 id: string;
 nombre: string;
 numero: string;
 folio: string;
 rol: "afiliado" | "admin";
 posgrado: string;
 instituto: string;
 ingreso: string;
 vigencia: string;
 tipoSanguineo: string;
 alergias: string;
 contactoNombre: string;
 contactoParentesco: string;
 contactoTelefono: string;
};

const ROSTER_INICIAL: Persona[] = [
 { id: "p1", nombre: "María Fernanda López Herrera", numero: "REP-2026-00001", folio: "A1B2C3D4E5F6", rol: "afiliado", posgrado: "Maestría en Ciencias Computacionales", instituto: "Instituto Tecnológico de Celaya", ingreso: "2026-01-15", vigencia: "2026", tipoSanguineo: "O+", alergias: "Penicilina", contactoNombre: "Carlos López Herrera", contactoParentesco: "Hermano", contactoTelefono: "55 9876 5432" },
 { id: "p2", nombre: "Jorge Alberto Ramírez Soto", numero: "REP-2026-00002", folio: "B2C3D4E5F6A7", rol: "afiliado", posgrado: "Doctorado en Ciencias de la Ingeniería", instituto: "Instituto Tecnológico de Mérida", ingreso: "2026-02-01", vigencia: "2026", tipoSanguineo: "A+", alergias: "Ninguna", contactoNombre: "Lucía Ramírez", contactoParentesco: "Esposa", contactoTelefono: "99 8877 6655" },
 { id: "p3", nombre: "Ana Cecilia Torres Miranda", numero: "REP-2026-00003", folio: "C3D4E5F6A7B8", rol: "afiliado", posgrado: "Maestría en Administración", instituto: "Instituto Tecnológico de Tijuana", ingreso: "2026-03-10", vigencia: "2026", tipoSanguineo: "B+", alergias: "Ninguna", contactoNombre: "Marco Torres", contactoParentesco: "Padre", contactoTelefono: "66 4433 2211" },
 { id: "p4", nombre: "Gabriela Sánchez Moreno", numero: "REP-2026-00004", folio: "D4E5F6A7B8C9", rol: "afiliado", posgrado: "Doctorado en Biotecnología", instituto: "Instituto Tecnológico de Querétaro", ingreso: "2025-11-20", vigencia: "2026", tipoSanguineo: "AB-", alergias: "Aspirina", contactoNombre: "Rosa Moreno", contactoParentesco: "Madre", contactoTelefono: "44 2211 3344" },
 { id: "p5", nombre: "Ricardo Pérez Castillo", numero: "REP-2026-00005", folio: "E5F6A7B8C9D0", rol: "afiliado", posgrado: "Maestría en Finanzas", instituto: "Instituto Tecnológico de Nuevo León", ingreso: "2025-08-05", vigencia: "2026", tipoSanguineo: "O-", alergias: "Ninguna", contactoNombre: "Elena Castillo", contactoParentesco: "Cónyuge", contactoTelefono: "81 5566 7788" },
 { id: "p6", nombre: "Administración RepTecNM", numero: "REP-2026-ADMIN1", folio: "F6A7B8C9D0E1", rol: "admin", posgrado: "Dirección de la Red", instituto: "Coordinación General TecNM", ingreso: "2026-01-01", vigencia: "2027", tipoSanguineo: "—", alergias: "—", contactoNombre: "Secretaría Técnica", contactoParentesco: "Oficina", contactoTelefono: "55 1122 3344" },
];

function iniciales(nombre: string) {
 return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function sufijo(numero: string) {
 const n = Number(numero.split("-").pop());
 return Number.isFinite(n) ? n : -1;
}

function Ondas() {
 return (
 <svg viewBox="0 0 430 270" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
 <path d="M0 205 C 90 175, 170 240, 260 208 S 400 178, 430 202 V270 H0 Z" fill="#0070C0" opacity="0.08" />
 <path d="M0 228 C 100 198, 180 254, 280 226 S 410 204, 430 226 V270 H0 Z" fill="#004B87" opacity="0.10" />
 <path d="M0 250 C 110 226, 190 266, 300 246 S 420 228, 430 248 V270 H0 Z" fill="#003366" opacity="0.12" />
 </svg>
 );
}

function Anverso({ p }: { p: Persona }) {
 return (
 <div className="lado-card relative aspect-[856/540] w-full max-w-[430px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
 <Ondas />
 <div className="relative flex items-center justify-between bg-gradient-to-r from-[#003366] via-[#004B87] to-[#0070C0] px-4 py-2 text-white">
 <div className="flex items-center gap-2">
 <img src="/logo.png" alt="REP-TecNM" className="h-7 w-7 rounded bg-white object-cover object-[center_15%] p-0.5" />
 <div>
 <p className="text-xs font-bold leading-tight">REP TecNM</p>
 <p className="text-[8px] uppercase tracking-widest text-sky-100/90">Red de Egresados de Posgrado</p>
 </div>
 </div>
 <p className="font-mono text-[9px] tracking-wider text-sky-100">{p.numero}</p>
 </div>
 <div className="h-1 bg-amber-400" />
 <div className="relative flex gap-3 px-4 pt-3 text-slate-900">
 <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-amber-400 bg-slate-100 text-xl font-bold text-[#004B87]">
 {iniciales(p.nombre)}
 </div>
 <div className="min-w-0">
 <p className="truncate text-sm font-bold">{p.nombre}</p>
 <p className="mt-1 text-[10px] text-slate-600">{p.posgrado}</p>
 <p className="text-[10px] text-slate-600">{p.instituto}</p>
 <p className="mt-1 text-[10px] text-slate-600">Ingreso: {p.ingreso}</p>
 <p className="text-[10px] font-semibold text-[#004B87]">Vigencia: {p.vigencia}</p>
 </div>
 </div>
 <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-amber-400 bg-[#003366] px-4 py-1 text-[8px] text-sky-100">
 <span>Tecnológico Nacional de México</span>
 <span>reptecnm.mx/verificar</span>
 </div>
 </div>
 );
}

function Reverso({ p, titular }: { p: Persona; titular: { nombre: string; firma: string } }) {
 return (
 <div className="lado-card relative aspect-[856/540] w-full max-w-[430px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
 <Ondas />
 <div className="relative bg-[#003366] px-4 py-2 text-white">
 <p className="text-[10px] font-bold uppercase tracking-widest">Información de emergencia</p>
 </div>
 <div className="h-1 bg-amber-400" />
 <div className="relative flex gap-4 px-4 pt-3 text-slate-900">
 <div className="grid flex-1 content-start gap-1 text-[10px]">
 <p><span className="font-bold">Tipo sanguíneo:</span> {p.tipoSanguineo}</p>
 <p><span className="font-bold">Alergias:</span> {p.alergias}</p>
 <p><span className="font-bold">Contacto:</span> {p.contactoNombre} ({p.contactoParentesco})</p>
 <p><span className="font-bold">Teléfono:</span> {p.contactoTelefono}</p>
 <p className="mt-1 text-[8px] text-slate-500">
 Si encuentras esta credencial, entrégala en cualquier campus TecNM o llama al contacto indicado.
 </p>
 </div>
 <div className="grid justify-items-center gap-1">
 <div className="rounded-lg border border-amber-400 bg-white p-1.5">
 <QRCodeSVG value={`https://reptecnm.mx/verificar/${p.folio}`} size={72} />
 </div>
 <p className="font-mono text-[8px] font-semibold tracking-wider text-slate-700">{p.folio}</p>
 </div>
 </div>

 <div className="relative mt-1 grid justify-items-center px-4">
 {titular.firma ? (
 <img src={titular.firma} alt="Firma de la presidencia" className="h-9 object-contain" />
 ) : (
 <div className="h-9" />
 )}
 <div className="h-px w-44 bg-slate-400" />
 <p className="text-[9px] font-semibold text-slate-800">{titular.nombre}</p>
 <p className="text-[8px] text-slate-500">Presidencia de la Asociación</p>
 </div>
 <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-amber-400 bg-[#003366] px-4 py-1 text-[8px] text-sky-100">
 <span>Verificación: reptecnm.mx/verificar</span>
 <span>Propiedad del TecNM</span>
 </div>
 </div>
 );
}

export default function CredencialesAdminPage() {
 const [personas, setPersonas] = useState<Persona[]>(ROSTER_INICIAL);
 const [q, setQ] = useState("");
 const [rolF, setRolF] = useState("");
 const [seleccion, setSeleccion] = useState<string[]>([]);
 const [desde, setDesde] = useState("");
 const [hasta, setHasta] = useState("");
 const [vigencia, setVigencia] = useState("2027");
 const [titular, setTitular] = useState({ nombre: "Dra. Elena Ruiz", firma: "" });

 useEffect(() => {
 setTitular({
 nombre: localStorage.getItem("rep-titular-nombre") ?? "Dra. Elena Ruiz",
 firma: localStorage.getItem("rep-titular-firma") ?? "",
 });
 }, []);

 const filtrados = useMemo(
 () =>
 personas.filter(
 (p) =>
 (rolF === "" || p.rol === rolF) &&
 (p.nombre + p.numero + p.instituto).toLowerCase().includes(q.toLowerCase())
 ),
 [personas, q, rolF]
 );

 const tanda = seleccion.length > 0 ? personas.filter((p) => seleccion.includes(p.id)) : filtrados;

 const toggle = (id: string) =>
 setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

 const seleccionarRango = () => {
 const a = Number(desde);
 const b = Number(hasta);
 if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) {
 toast.error("Define un rango válido de números de afiliado.");
 return;
 }
 const ids = personas.filter((p) => { const s = sufijo(p.numero); return s >= a && s <= b; }).map((p) => p.id);
 setSeleccion(ids);
 toast.success(`Tanda seleccionada: ${ids.length} credencial(es).`);
 };

 const asignarVigencia = () => {
 if (seleccion.length === 0) {
 toast.error("Selecciona primero una tanda.");
 return;
 }
 setPersonas((prev) => prev.map((p) => (seleccion.includes(p.id) ? { ...p, vigencia } : p)));
 toast.success(`Vigencia ${vigencia} asignada a ${seleccion.length} credencial(es).`);
 };

 return (
 <div className="grid gap-6">
 <style>{`
 @media print {
 body * { visibility: hidden; }
 #area-impresion, #area-impresion * { visibility: visible; }
 #area-impresion { position: absolute; left: 0; top: 0; }
 .lado-card { width: 85.6mm !important; height: 53.98mm !important; max-width: none !important; margin: 0 0 8mm 0 !important; break-inside: avoid; }
 }
 `}</style>

 <div>
 <h1 className="text-2xl font-semibold tracking-tight">Credenciales para impresión</h1>
 <p className="text-sm text-muted-foreground">
 Selecciona tandas por número de afiliado, asigna vigencia y genera credenciales CR80 de dos caras (RF-CRED-002).
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <div className="relative min-w-64 flex-1">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por nombre, número o instituto..." className="pl-9" />
 </div>
 <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={rolF} onChange={(e) => setRolF(e.target.value)}>
 <option value="">Todos los roles</option>
 <option value="afiliado">Afiliados</option>
 <option value="admin">Administradores</option>
 </select>
 </div>

 <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
 <span className="text-sm font-semibold">Tanda por número:</span>
 <Input className="w-28" placeholder="Desde 1" value={desde} onChange={(e) => setDesde(e.target.value.replace(/\D/g, ""))} />
 <Input className="w-28" placeholder="Hasta 5" value={hasta} onChange={(e) => setHasta(e.target.value.replace(/\D/g, ""))} />
 <Button variant="outline" onClick={seleccionarRango}>Seleccionar rango</Button>
 <Button variant="outline" onClick={() => setSeleccion(filtrados.map((p) => p.id))}>Seleccionar filtrados</Button>
 {seleccion.length > 0 && (
 <Button variant="ghost" onClick={() => setSeleccion([])}>Limpiar ({seleccion.length})</Button>
 )}
 <span className="mx-2 hidden h-6 w-px bg-border sm:block" />
 <CalendarRange className="h-4 w-4 text-muted-foreground" />
 <Input className="w-24" value={vigencia} onChange={(e) => setVigencia(e.target.value.replace(/\D/g, "").slice(0, 4))} />
 <Button variant="outline" onClick={asignarVigencia}>Asignar vigencia</Button>
 <Button className="ml-auto" onClick={() => window.print()}>
 <Printer className="mr-2 h-4 w-4" /> Imprimir tanda ({tanda.length})
 </Button>
 </div>

 <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
 <div className="grid content-start gap-1 rounded-2xl border bg-card p-2">
 {filtrados.map((p) => (
 <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted">
 <input type="checkbox" checked={seleccion.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-[#004B87]" />
 <span className="min-w-0 flex-1">
 <span className="block truncate text-sm font-medium">{p.nombre}</span>
 <span className="block text-xs text-muted-foreground">
 {p.numero} · {p.rol === "admin" ? "Administración" : "Afiliado"} · Vigencia {p.vigencia}
 </span>
 </span>
 </label>
 ))}
 {filtrados.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">Sin coincidencias.</p>}
 </div>

 <div id="area-impresion" className="grid content-start gap-6">
 {tanda.map((p) => (
 <div key={p.id} className="grid gap-4">
 <Anverso p={p} />
 <Reverso p={p} titular={titular} />
 </div>
 ))}
 <p className="max-w-[430px] text-xs text-muted-foreground">
 Formato CR80 (85.6 × 53.98 mm). Para Zebra ZXP Serie 7: imprime cada cara como página y activa
 dúplex manual, o exporta el PDF y rasteriza a 300 dpi (≈1011 × 638 px por cara).
 </p>
 </div>
 </div>
 </div>
 );
}
