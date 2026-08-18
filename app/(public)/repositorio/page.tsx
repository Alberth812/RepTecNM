"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Download, Eye, FilePlus2, FileText, Flag, MessageSquareText, PencilLine,
  Plus, Search, Send, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { documentosIniciales, type Documento } from "@/lib/mock/repositorio";

const ANIO_ACTUAL = new Date().getFullYear();
const TIPOS = ["Artículo", "Tesis", "Libro", "Memoria de congreso", "Presentación", "Ensayo", "Reporte técnico", "Otro"];
const MOTIVOS_REPORTE = ["Derechos de autor", "Contenido inapropiado", "Información confidencial", "Plagio", "Spam", "Otro"];

interface Comentario { autor: string; texto: string; fecha: string }

const COMENTARIOS_INICIALES: Record<string, Comentario[]> = {
  "DOC-2026-0001": [
    { autor: "Jorge Alberto Ramírez Soto", texto: "Excelente trabajo de campo. ¿Compartirán el dataset de lecturas?", fecha: "12 ago 2026" },
    { autor: "Gabriela Sánchez Moreno", texto: "Muy útil como referencia para mi proyecto de sensores en salud.", fecha: "11 ago 2026" },
  ],
  "DOC-2026-0002": [
    { autor: "Ricardo Pérez Castillo", texto: "¿El modelo está disponible como código abierto?", fecha: "09 ago 2026" },
  ],
};

interface FormDoc {
  titulo: string; resumen: string; tipo: string; otroTipo: string; anio: string;
  autores: string[]; tags: string[];
  doi: string; revista: string; editorial: string; isbn: string; issn: string; url: string;
  archivo: string; acepta: boolean;
}

const FORM_VACIO: FormDoc = {
  titulo: "", resumen: "", tipo: "", otroTipo: "", anio: "",
  autores: [""], tags: [],
  doi: "", revista: "", editorial: "", isbn: "", issn: "", url: "",
  archivo: "", acepta: false,
};

function normalizar(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function puntuacion(d: Documento, terminos: string[]) {
  const campos = [
    { texto: normalizar(d.titulo), peso: 5 },
    { texto: normalizar(d.palabrasClave.join(" ")), peso: 4 },
    { texto: normalizar(d.autores.join(" ")), peso: 3 },
    { texto: normalizar(d.resumen), peso: 2 },
  ];
  let total = 0;
  for (const t of terminos) {
    for (const c of campos) {
      if (c.texto.includes(t)) total += c.peso;
    }
  }
  return total;
}

function SeccionForm({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-muted/30 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function RepositorioPage() {
  const [docs, setDocs] = useState(documentosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [sheetAbierto, setSheetAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormDoc>(FORM_VACIO);
  const [tagInput, setTagInput] = useState("");
  const [reportando, setReportando] = useState<Documento | null>(null);
  const [motivoReporte, setMotivoReporte] = useState("");
  const [detalleReporte, setDetalleReporte] = useState("");
  const [reportados, setReportados] = useState<string[]>([]);
  const [eliminando, setEliminando] = useState<Documento | null>(null);
  const [viendo, setViendo] = useState<Documento | null>(null);
  const [foroAbierto, setForoAbierto] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Record<string, Comentario[]>>(COMENTARIOS_INICIALES);
  const [textoComentario, setTextoComentario] = useState("");

  const resultados = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean);
    if (terminos.length === 0) return [...docs].sort((a, b) => b.anio - a.anio);
    return docs
      .map((d) => ({ d, s: puntuacion(d, terminos) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.d);
  }, [busqueda, docs]);

  const abrirNuevo = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setSheetAbierto(true);
  };

  const abrirEdicion = (d: Documento) => {
    setForm({
      titulo: d.titulo, resumen: d.resumen,
      tipo: TIPOS.includes(d.tipo) ? d.tipo : "Otro",
      otroTipo: TIPOS.includes(d.tipo) ? "" : d.tipo,
      anio: String(d.anio), autores: [...d.autores], tags: [...d.palabrasClave],
      doi: d.doi ?? "", revista: d.revista ?? "", editorial: "", isbn: "", issn: "", url: "",
      archivo: "", acepta: true,
    });
    setEditandoId(d.id);
    setSheetAbierto(true);
  };

  const guardarDocumento = () => {
    const errores: string[] = [];
    if (!form.titulo.trim() || form.titulo.length > 300) errores.push("El título es obligatorio (máx. 300 caracteres).");
    if (!form.resumen.trim() || form.resumen.length > 1800) errores.push("El resumen es obligatorio (máx. 1800 caracteres).");
    if (!form.tipo) errores.push("Selecciona el tipo de documento.");
    if (form.tipo === "Otro" && (!form.otroTipo.trim() || form.otroTipo.length > 50)) errores.push("Describe el tipo (máx. 50 caracteres).");
    const anio = Number(form.anio);
    if (!form.anio || anio < 1950 || anio > ANIO_ACTUAL) errores.push(`El año debe estar entre 1950 y ${ANIO_ACTUAL}.`);
    if (form.autores.length < 1 || form.autores.some((a) => !a.trim())) errores.push("Registra entre 1 y 50 autores.");
    if (form.autores.some((a) => /\d/.test(a))) errores.push("Los autores no pueden contener dígitos.");
    if (form.autores.some((a) => a.length > 150)) errores.push("Cada autor admite máx. 150 caracteres.");
    if (form.tags.length < 1 || form.tags.length > 15) errores.push("Registra entre 1 y 15 palabras clave.");
    if (form.doi && docs.some((d) => d.doi === form.doi.trim() && d.id !== editandoId)) errores.push("Ya existe un documento con ese DOI.");
    if (form.url && !/^https?:\/\/\S+$/.test(form.url)) errores.push("La URL oficial no es válida.");
    if (!editandoId && !form.archivo) errores.push("Carga el documento en PDF (máx. 5 MB).");
    if (!editandoId && !form.acepta) errores.push("Debes aceptar el descargo de derechos de autor (RF-DOC-002).");

    if (errores.length > 0) { toast.error(errores[0]); return; }

    const tipoFinal = form.tipo === "Otro" ? form.otroTipo.trim() : form.tipo;

    if (editandoId) {
      setDocs((prev) => prev.map((d) => d.id === editandoId ? {
        ...d,
        titulo: form.titulo.trim(), resumen: form.resumen.trim(), tipo: tipoFinal,
        anio, autores: form.autores.map((a) => a.trim()), palabrasClave: form.tags,
        doi: form.doi.trim() || undefined, revista: form.revista.trim() || undefined,
      } : d));
      toast.success("Metadatos actualizados. El PDF no puede modificarse (RF-DOC-009).");
    } else {
      setDocs((prev) => [{
        id: `DOC-2026-${String(prev.length + 1).padStart(4, "0")}`,
        titulo: form.titulo.trim(), resumen: form.resumen.trim(), tipo: tipoFinal,
        anio, autores: form.autores.map((a) => a.trim()), palabrasClave: form.tags,
        doi: form.doi.trim() || undefined, revista: form.revista.trim() || undefined,
        tamano: form.archivo, afiliado: "María Fernanda López Herrera", propio: true,
      }, ...prev]);
      toast.success("Documento publicado en el repositorio.");
    }
    setSheetAbierto(false);
  };

  const confirmarReporte = () => {
    if (!reportando || !motivoReporte) { toast.error("Selecciona un motivo."); return; }
    if (motivoReporte === "Otro") {
      const len = detalleReporte.trim().length;
      if (len < 10 || len > 300) { toast.error("La descripción debe tener entre 10 y 300 caracteres."); return; }
    }
    setReportados((prev) => [...prev, reportando.id]);
    toast.success("Reporte enviado al Administrador General (RF-DOC-005).");
    setReportando(null);
    setMotivoReporte("");
    setDetalleReporte("");
  };

  const agregarComentario = (id: string) => {
    const t = textoComentario.trim();
    if (!t) return;
    setComentarios((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), { autor: "Tú", texto: t, fecha: "Ahora" }],
    }));
    setTextoComentario("");
    toast.success("Comentario publicado en el foro.");
  };

  const agregarTag = () => {
    const t = normalizar(tagInput).slice(0, 50);
    if (!t || form.tags.includes(t) || form.tags.length >= 15) return;
    setForm({ ...form, tags: [...form.tags, t] });
    setTagInput("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
        Entorno de demostración: vista como afiliado ACTIVO. En producción, el acceso
        requiere autenticación (RF-DOC-008).
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositorio Académico</h1>
          <p className="mt-2 text-muted-foreground">Publicaciones de la comunidad de egresados.</p>
        </div>
        <Button onClick={abrirNuevo}>
          <Plus className="mr-2 h-4 w-4" /> Publicar documento
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Busca por título, resumen, autor o palabra clave..."
          className="h-11 rounded-full pl-9"
        />
      </div>

      <div className="grid gap-4">
        {resultados.map((d) => (
          <div key={d.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{d.tipo}</Badge>
                  <span className="text-xs text-muted-foreground">{d.anio}</span>
                  {d.propio && <Badge variant="outline">Tuyo</Badge>}
                </div>
                <h2 className="mt-2 font-semibold leading-snug">{d.titulo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d.autores.join(", ")}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.resumen}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {d.palabrasClave.map((c) => (
                    <Badge key={c} variant="outline" className="text-[11px]">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#004B87]/10">
                <FileText className="h-5 w-5 text-[#004B87]" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
              <Button variant="outline" size="sm" onClick={() => setViendo(d)}>
                <Eye className="mr-2 h-4 w-4" /> Ver en línea
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast.info(`Descarga simulada: ${d.titulo} (${d.tamano}).`)}>
                <Download className="mr-2 h-4 w-4" /> Descargar
              </Button>
              {!d.propio && (
                <Link href={`/mensajeria?con=${encodeURIComponent(d.afiliado)}`}>
                  <Button variant="ghost" size="sm">
                    <MessageSquareText className="mr-2 h-4 w-4" /> Contactar al autor
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setForoAbierto(foroAbierto === d.id ? null : d.id)}
              >
                <MessageSquareText className="mr-2 h-4 w-4" />
                Foro ({(comentarios[d.id] ?? []).length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={reportados.includes(d.id)}
                onClick={() => setReportando(d)}
              >
                <Flag className="mr-2 h-4 w-4" />
                {reportados.includes(d.id) ? "Reportado" : "Reportar"}
              </Button>
              {d.propio && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => abrirEdicion(d)}>
                    <PencilLine className="mr-2 h-4 w-4" /> Editar metadatos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setEliminando(d)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </Button>
                </>
              )}
              <span className="ml-auto text-xs text-muted-foreground">PDF · {d.tamano}</span>
            </div>

            {foroAbierto === d.id && (
              <div className="mt-3 rounded-xl border bg-muted/30 p-4">
                <p className="text-sm font-semibold">Foro de la comunidad</p>
                <div className="mt-3 space-y-3">
                  {(comentarios[d.id] ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">Sé la primera persona en comentar esta publicación.</p>
                  )}
                  {(comentarios[d.id] ?? []).map((c, i) => (
                    <div key={i} className="rounded-lg border bg-background p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{c.autor}</p>
                        <span className="text-[11px] text-muted-foreground">{c.fecha}</span>
                      </div>
                      <p className="mt-1 text-sm">{c.texto}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    className="bg-background"
                    value={textoComentario}
                    onChange={(e) => setTextoComentario(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarComentario(d.id); } }}
                    placeholder="Escribe un comentario para la comunidad..."
                  />
                  <Button size="sm" disabled={!textoComentario.trim()} onClick={() => agregarComentario(d.id)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {resultados.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sin resultados para tu búsqueda.
          </p>
        )}
      </div>

      {viendo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setViendo(null); }}
        >
          <div className="flex h-[90vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div className="min-w-0">
                <h2 className="font-semibold leading-snug">{viendo.titulo}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Vista previa dentro de la plataforma, sin descarga (RF-DOC-008).</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViendo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <iframe src="/docs/muestra.pdf" title="Vista previa del documento" className="w-full flex-1 bg-muted" />
          </div>
        </div>
      )}

      {/* Publicación / edición */}
      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#004B87]/10 p-2.5">
                <FilePlus2 className="h-5 w-5 text-[#004B87]" />
              </div>
              <div className="text-left">
                <SheetTitle>{editandoId ? "Editar metadatos" : "Publicar documento"}</SheetTitle>
                <SheetDescription>
                  {editandoId
                    ? "Solo los metadatos pueden modificarse; el PDF permanece intacto (RF-DOC-009)."
                    : "Completa los metadatos y carga el PDF de tu publicación (RF-DOC-003)."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {!editandoId && (
              <SeccionForm titulo="Archivo">
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-sm font-medium">Documento PDF (máx. 5 MB)</p>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="mt-2 bg-background"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.type !== "application/pdf") { toast.error("Solo se acepta PDF (RF-DOC-001)."); return; }
                      if (f.size > 5 * 1024 * 1024) { toast.error("El PDF excede 5 MB."); return; }
                      setForm({ ...form, archivo: `${(f.size / 1024 / 1024).toFixed(1)} MB` });
                      toast.success("PDF cargado correctamente.");
                    }}
                  />
                  {form.archivo && (
                    <p className="mt-2 text-xs font-medium text-green-700">PDF cargado · {form.archivo}</p>
                  )}
                </div>
              </SeccionForm>
            )}

            <SeccionForm titulo="Información principal">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Título</span>
                  <span className="text-xs text-muted-foreground">{form.titulo.length} / 300</span>
                </div>
                <Input maxLength={300} className="bg-background" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resumen</span>
                  <span className="text-xs text-muted-foreground">{form.resumen.length} / 1800</span>
                </div>
                <Textarea rows={4} maxLength={1800} className="bg-background" value={form.resumen} onChange={(e) => setForm({ ...form, resumen: e.target.value })} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Tipo de documento</span>
                  <Select value={form.tipo || undefined} onValueChange={(v) => { if (v) setForm({ ...form, tipo: v }); }}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Año de publicación</span>
                  <Input
                    inputMode="numeric"
                    className="bg-background"
                    value={form.anio}
                    onChange={(e) => setForm({ ...form, anio: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  />
                </div>
              </div>
              {form.tipo === "Otro" && (
                <Input maxLength={50} className="bg-background" placeholder="Describe el tipo (máx. 50)" value={form.otroTipo} onChange={(e) => setForm({ ...form, otroTipo: e.target.value })} />
              )}
            </SeccionForm>

            <SeccionForm titulo="Autores y palabras clave">
              <div className="grid gap-2">
                <span className="text-sm font-medium">Autores (1 a 50, sin dígitos)</span>
                {form.autores.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <Input maxLength={150} className="bg-background" value={a} onChange={(e) => {
                      const copia = [...form.autores]; copia[i] = e.target.value; setForm({ ...form, autores: copia });
                    }} placeholder={`Autor ${i + 1}`} />
                    <Button variant="ghost" size="icon" disabled={form.autores.length === 1} onClick={() => setForm({ ...form, autores: form.autores.filter((_, x) => x !== i) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-fit bg-background" disabled={form.autores.length >= 50} onClick={() => setForm({ ...form, autores: [...form.autores, ""] })}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar autor
                </Button>
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium">Palabras clave (1 a 15)</span>
                <div className="flex gap-2">
                  <Input className="bg-background" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarTag(); } }} placeholder="ej. biotecnología" />
                  <Button variant="outline" className="bg-background" onClick={agregarTag}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button onClick={() => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </SeccionForm>

            <SeccionForm titulo="Identificadores opcionales">
              <div className="grid gap-3 md:grid-cols-2">
                <Input className="bg-background" placeholder="DOI (opcional, único)" value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} />
                <Input className="bg-background" placeholder="Revista o congreso" maxLength={250} value={form.revista} onChange={(e) => setForm({ ...form, revista: e.target.value })} />
                <Input className="bg-background" placeholder="Editorial" maxLength={250} value={form.editorial} onChange={(e) => setForm({ ...form, editorial: e.target.value })} />
                <Input className="bg-background" placeholder="ISBN" maxLength={25} value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                <Input className="bg-background" placeholder="ISSN" maxLength={13} value={form.issn} onChange={(e) => setForm({ ...form, issn: e.target.value })} />
                <Input className="bg-background" placeholder="URL oficial (https://...)" maxLength={500} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              </div>
            </SeccionForm>

            {!editandoId && (
              <SeccionForm titulo="Declaración de autoría">
                <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                  <li>Es de mi autoría o cuento con la autorización necesaria para su publicación.</li>
                  <li>No infringe derechos de autor ni otros derechos de terceros.</li>
                  <li>Su publicación es compatible con licencias, contratos editoriales o políticas institucionales.</li>
                  <li>Asumo la responsabilidad por cualquier reclamación derivada de su publicación.</li>
                  <li>Corresponde a una producción académica legítima y pertinente.</li>
                </ul>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.acepta} onCheckedChange={(v) => setForm({ ...form, acepta: v === true })} />
                  Declaro que este documento cumple lo anterior.
                </label>
              </SeccionForm>
            )}
          </div>

          <div className="sticky bottom-0 -mx-6 mt-8 border-t bg-background/95 p-6 backdrop-blur">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setSheetAbierto(false)}>Cancelar</Button>
              <Button onClick={guardarDocumento}>{editandoId ? "Guardar cambios" : "Publicar"}</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reporte */}
      <Dialog open={!!reportando} onOpenChange={(open) => !open && setReportando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar documento</DialogTitle>
            <DialogDescription>
              El reporte se turnará al Administrador General (RF-ADMIN-011).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Select value={motivoReporte || undefined} onValueChange={(v) => { if (v) setMotivoReporte(v); }}>
              <SelectTrigger><SelectValue placeholder="Motivo del reporte" /></SelectTrigger>
              <SelectContent>
                {MOTIVOS_REPORTE.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            {motivoReporte === "Otro" && (
              <Textarea rows={3} value={detalleReporte} onChange={(e) => setDetalleReporte(e.target.value)} placeholder="Describe el motivo (10 a 300 caracteres)" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportando(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarReporte}>Enviar reporte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eliminación */}
      <Dialog open={!!eliminando} onOpenChange={(open) => !open && setEliminando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar publicación</DialogTitle>
            <DialogDescription>
              {eliminando ? "Esta acción es irreversible y retirará el documento del repositorio." : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEliminando(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!eliminando) return;
                setDocs((prev) => prev.filter((d) => d.id !== eliminando.id));
                toast.success("Publicación eliminada del repositorio.");
                setEliminando(null);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
