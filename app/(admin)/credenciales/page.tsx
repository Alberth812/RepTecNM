"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Search } from "lucide-react";

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
  estado: string;
  tipoSanguineo: string;
  alergias: string;
  contactoNombre: string;
  contactoParentesco: string;
  contactoTelefono: string;
};

const ROSTER: Persona[] = [
  { id: "p1", nombre: "María Fernanda López Herrera", numero: "REP-2026-00001", folio: "A1B2C3D4E5F6", rol: "afiliado", posgrado: "Maestría en Ciencias Computacionales", instituto: "Instituto Tecnológico de Celaya", ingreso: "2026-01-15", estado: "ACTIVO", tipoSanguineo: "O+", alergias: "Penicilina", contactoNombre: "Carlos López Herrera", contactoParentesco: "Hermano", contactoTelefono: "55 9876 5432" },
  { id: "p2", nombre: "Jorge Alberto Ramírez Soto", numero: "REP-2026-00002", folio: "B2C3D4E5F6A7", rol: "afiliado", posgrado: "Doctorado en Ciencias de la Ingeniería", instituto: "Instituto Tecnológico de Mérida", ingreso: "2026-02-01", estado: "ACTIVO", tipoSanguineo: "A+", alergias: "Ninguna", contactoNombre: "Lucía Ramírez", contactoParentesco: "Esposa", contactoTelefono: "99 8877 6655" },
  { id: "p3", nombre: "Ana Cecilia Torres Miranda", numero: "REP-2026-00003", folio: "C3D4E5F6A7B8", rol: "afiliado", posgrado: "Maestría en Administración", instituto: "Instituto Tecnológico de Tijuana", ingreso: "2026-03-10", estado: "PENDIENTE", tipoSanguineo: "B+", alergias: "Ninguna", contactoNombre: "Marco Torres", contactoParentesco: "Padre", contactoTelefono: "66 4433 2211" },
  { id: "p4", nombre: "Gabriela Sánchez Moreno", numero: "REP-2026-00004", folio: "D4E5F6A7B8C9", rol: "afiliado", posgrado: "Doctorado en Biotecnología", instituto: "Instituto Tecnológico de Querétaro", ingreso: "2025-11-20", estado: "ACTIVO", tipoSanguineo: "AB-", alergias: "Aspirina", contactoNombre: "Rosa Moreno", contactoParentesco: "Madre", contactoTelefono: "44 2211 3344" },
  { id: "p5", nombre: "Ricardo Pérez Castillo", numero: "REP-2026-00005", folio: "E5F6A7B8C9D0", rol: "afiliado", posgrado: "Maestría en Finanzas", instituto: "Instituto Tecnológico de Nuevo León", ingreso: "2025-08-05", estado: "INACTIVO", tipoSanguineo: "O-", alergias: "Ninguna", contactoNombre: "Elena Castillo", contactoParentesco: "Cónyuge", contactoTelefono: "81 5566 7788" },
  { id: "p6", nombre: "Administración RepTecNM", numero: "REP-2026-ADMIN1", folio: "F6A7B8C9D0E1", rol: "admin", posgrado: "Dirección de la Red", instituto: "Coordinación General TecNM", ingreso: "2026-01-01", estado: "ACTIVO", tipoSanguineo: "—", alergias: "—", contactoNombre: "Secretaría Técnica", contactoParentesco: "Oficina", contactoTelefono: "55 1122 3344" },
];

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function colorEstado(estado: string) {
  return estado === "ACTIVO" ? "bg-green-500" : estado === "PENDIENTE" ? "bg-amber-500" : "bg-red-500";
}

export default function CredencialesAdminPage() {
  const [q, setQ] = useState("");
  const [rolF, setRolF] = useState("");
  const [sel, setSel] = useState<Persona>(ROSTER[0]);

  const resultados = useMemo(
    () =>
      ROSTER.filter(
        (p) =>
          (rolF === "" || p.rol === rolF) &&
          (p.nombre + p.numero + p.instituto).toLowerCase().includes(q.toLowerCase())
      ),
    [q, rolF]
  );

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
          Busca a un afiliado o administrador y genera su credencial CR80 de dos caras (RF-CRED-002).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por nombre, número o instituto..." className="pl-9" />
        </div>
        <select
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          value={rolF}
          onChange={(e) => setRolF(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="afiliado">Afiliados</option>
          <option value="admin">Administradores</option>
        </select>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="grid content-start gap-1 rounded-2xl border bg-card p-2">
          {resultados.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSel(p)}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                sel.id === p.id ? "bg-[#004B87] text-white" : "hover:bg-muted"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{p.nombre}</span>
                <span className={`block text-xs ${sel.id === p.id ? "text-sky-100" : "text-muted-foreground"}`}>
                  {p.numero} · {p.rol === "admin" ? "Administración" : "Afiliado"}
                </span>
              </span>
              <span className={`h-2 w-2 shrink-0 rounded-full ${colorEstado(p.estado)}`} />
            </button>
          ))}
          {resultados.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">Sin coincidencias.</p>
          )}
        </div>

        <div id="area-impresion" className="grid content-start gap-6">
          {/* Anverso */}
          <div className="lado-card relative aspect-[856/540] w-full max-w-[430px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#003366] via-[#004B87] to-[#0070C0] px-4 py-2 text-white">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="REP-TecNM" className="h-7 w-7 rounded bg-white object-cover object-[center_15%] p-0.5" />
                <div>
                  <p className="text-xs font-bold leading-tight">REP TecNM</p>
                  <p className="text-[8px] uppercase tracking-widest text-sky-100/90">Red de Egresados de Posgrado</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold text-white ${colorEstado(sel.estado)}`}>
                {sel.estado}
              </span>
            </div>
            <div className="flex gap-3 px-4 pt-3 text-slate-900">
              <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-[#004B87]/20 bg-slate-100 text-xl font-bold text-[#004B87]">
                {iniciales(sel.nombre)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{sel.nombre}</p>
                <p className="font-mono text-[11px] font-bold text-[#004B87]">{sel.numero}</p>
                <p className="mt-1 text-[10px] text-slate-600">{sel.posgrado}</p>
                <p className="text-[10px] text-slate-600">{sel.instituto}</p>
                <p className="mt-1 text-[10px] text-slate-600">Fecha de ingreso: {sel.ingreso}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#003366] px-4 py-1 text-[8px] text-sky-100">
              <span>Tecnológico Nacional de México</span>
              <span>Vigencia 2026</span>
            </div>
          </div>

          {/* Reverso */}
          <div className="lado-card relative aspect-[856/540] w-full max-w-[430px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            <div className="bg-[#003366] px-4 py-2 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest">Información de emergencia</p>
            </div>
            <div className="flex gap-4 px-4 pt-3 text-slate-900">
              <div className="grid flex-1 content-start gap-1 text-[10px]">
                <p><span className="font-bold">Tipo sanguíneo:</span> {sel.tipoSanguineo}</p>
                <p><span className="font-bold">Alergias:</span> {sel.alergias}</p>
                <p><span className="font-bold">Contacto:</span> {sel.contactoNombre} ({sel.contactoParentesco})</p>
                <p><span className="font-bold">Teléfono:</span> {sel.contactoTelefono}</p>
                <p className="mt-1 text-[8px] text-slate-500">
                  Si encuentras esta credencial, entrégala en cualquier campus TecNM o llama al contacto indicado.
                </p>
              </div>
              <div className="grid justify-items-center gap-1">
                <div className="rounded-lg border border-slate-200 bg-white p-1.5">
                  <QRCodeSVG value={`https://reptecnm.mx/verificar/${sel.folio}`} size={72} />
                </div>
                <p className="font-mono text-[8px] font-semibold tracking-wider text-slate-700">{sel.folio}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#003366] px-4 py-1 text-[8px] text-sky-100">
              <span>Verificación: reptecnm.mx/verificar</span>
              <span>Propiedad del TecNM</span>
            </div>
          </div>

          <p className="max-w-[430px] text-xs text-muted-foreground">
            Formato CR80 (85.6 × 53.98 mm). Para Zebra ZXP Serie 7: imprime cada cara como página y activa
            dúplex manual, o exporta el PDF y rasteriza a 300 dpi (≈1011 × 638 px por cara).
          </p>
        </div>
      </div>
    </div>
  );
}
