"use client";

const SITUACION = [
 { label: "Empleo pleno", valor: 128 },
 { label: "Subempleo", valor: 41 },
 { label: "Buscando empleo", valor: 27 },
 { label: "Academia / investigación", valor: 18 },
];

const SECTOR = [
 { label: "Empresarial", valor: 96 },
 { label: "Académico", valor: 64 },
 { label: "Gubernamental", valor: 31 },
 { label: "Independiente", valor: 23 },
];

const RECIENTES = [
 { nombre: "María Fernanda López Herrera", instituto: "Celaya", fecha: "2026-08-20", estado: "Actualizado" },
 { nombre: "Jorge Alberto Ramírez Soto", instituto: "Mérida", fecha: "2026-07-02", estado: "Actualizado" },
 { nombre: "Ricardo Pérez Castillo", instituto: "Nuevo León", fecha: "2024-11-30", estado: "Desactualizado" },
 { nombre: "Verónica Jiménez Ríos", instituto: "Oaxaca", fecha: "2026-03-15", estado: "Actualizado" },
];

function Barra({ label, valor, max }: { label: string; valor: number; max: number }) {
 return (
 <div className="grid gap-1">
 <div className="flex justify-between text-xs">
 <span>{label}</span>
 <span className="text-muted-foreground">{valor}</span>
 </div>
 <div className="h-2 rounded-full bg-muted">
 <div className="h-2 rounded-full bg-[#004B87]" style={{ width: `${(valor / max) * 100}%` }} />
 </div>
 </div>
 );
}

export default function SeguimientoAdminPage() {
 return (
 <div className="grid gap-6">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight">Seguimiento de afiliados</h1>
 <p className="text-sm text-muted-foreground">
 Respuestas del cuestionario de seguimiento para estadísticas y reportes de la directiva (RF-SEG-003).
 </p>
 </div>

 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {[
 { t: "214", d: "Respuestas totales" },
 { t: "78%", d: "Afiliados actualizados" },
 { t: "26", d: "Desactualizados (>12 meses)" },
 { t: "9", d: "Respuestas este mes" },
 ].map((s) => (
 <div key={s.d} className="rounded-2xl border bg-card p-5">
 <p className="text-2xl font-bold">{s.t}</p>
 <p className="text-xs text-muted-foreground">{s.d}</p>
 </div>
 ))}
 </div>

 <div className="grid gap-6 lg:grid-cols-2">
 <div className="rounded-2xl border bg-card p-6">
 <h2 className="font-semibold">Situación laboral</h2>
 <div className="mt-4 grid gap-3">
 {SITUACION.map((s) => <Barra key={s.label} {...s} max={140} />)}
 </div>
 </div>
 <div className="rounded-2xl border bg-card p-6">
 <h2 className="font-semibold">Sector de actividad</h2>
 <div className="mt-4 grid gap-3">
 {SECTOR.map((s) => <Barra key={s.label} {...s} max={100} />)}
 </div>
 </div>
 </div>

 <div className="rounded-2xl border bg-card p-6">
 <h2 className="font-semibold">Últimas respuestas</h2>
 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
 <th className="py-2 pr-4">Afiliado</th>
 <th className="py-2 pr-4">Instituto</th>
 <th className="py-2 pr-4">Fecha</th>
 <th className="py-2">Estado</th>
 </tr>
 </thead>
 <tbody>
 {RECIENTES.map((r) => (
 <tr key={r.nombre} className="border-b last:border-0">
 <td className="py-2.5 pr-4 font-medium">{r.nombre}</td>
 <td className="py-2.5 pr-4 text-muted-foreground">IT de {r.instituto}</td>
 <td className="py-2.5 pr-4 text-muted-foreground">{r.fecha}</td>
 <td className="py-2.5">
 <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.estado === "Actualizado" ? "bg-green-500/15 text-green-700" : "bg-amber-500/15 text-amber-700"}`}>
 {r.estado}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
