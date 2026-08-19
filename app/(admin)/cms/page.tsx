"use client";

import { useEffect, useState } from "react";
import { PencilLine, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CONTENIDO_DEFAULT, cargarContenido, guardarContenido,
  type ContenidoHome, type Slide, type Testimonio,
} from "@/lib/mock/cms";

const BOTONES = [
  { label: "Sin botón", texto: "", href: "" },
  { label: "Explorar catálogo", texto: "Explorar catálogo", href: "/catalogo" },
  { label: "Buscar profesionales", texto: "Buscar profesionales", href: "/catalogo" },
  { label: "Ver repositorio académico", texto: "Ver repositorio", href: "/repositorio" },
  { label: "Afíliate a la red", texto: "Afíliate ahora", href: "/registro" },
  { label: "Únete a la red", texto: "Únete a la red", href: "/registro" },
  { label: "Conocer la credencial digital", texto: "Conoce tu credencial", href: "/credencial" },
  { label: "Abrir mensajería", texto: "Abrir mensajería", href: "/mensajeria" },
  { label: "Actualizar seguimiento", texto: "Actualizar seguimiento", href: "/seguimiento" },
  { label: "Iniciar sesión", texto: "Iniciar sesión", href: "/login" },
];

function Contador({ len, min, max }: { len: number; min: number; max: number }) {
  const fuera = len < min || len > max;
  
return (
    <p className={`text-xs ${fuera ? "text-red-600" : "text-muted-foreground"}`}>
      {len} / {max} caracteres (mínimo {min}).
    </p>
  );
}

export default function CmsPage() {
  const [c, setC] = useState<ContenidoHome>(() => CONTENIDO_DEFAULT);
  const [cargado, setCargado] = useState(false);
  const [pickerAbierto, setPickerAbierto] = useState<number | null>(null);

  useEffect(() => {
    setC(cargarContenido());
    setCargado(true);
  }, []);

  const setSlide = (i: number, cambios: Partial<Slide>) =>
    setC((prev) => ({ ...prev, slides: prev.slides.map((sl, x) => (x === i ? { ...sl, ...cambios } : sl)) }));

  const agregarSlide = () =>
    setC((prev) => ({
      ...prev,
      slides: [
        ...prev.slides,
        { tipo: "normal", prioridad: "normal", etiqueta: "", titulo: "", texto: "", ctaLabel: "", ctaHref: "", imagen: "" },
      ],
    }));

  const eliminarSlide = (i: number) =>
    setC((prev) => ({ ...prev, slides: prev.slides.filter((_, x) => x !== i) }));

  const MAX_ALTAS = 3;

  const setPrioridad = (i: number, p: "normal" | "alta") => {
    if (p === "alta") {
      const altas = c.slides.filter((s, x) => x !== i && s.prioridad === "alta").length;
      if (altas >= MAX_ALTAS) {
        toast.error(`Máximo ${MAX_ALTAS} slides de alta prioridad. Baja alguno antes de subir otro.`);
        return;
      }
    }
    setSlide(i, { prioridad: p });
  };

  const setTest = (i: number, cambios: Partial<Testimonio>) =>
    setC((prev) => ({ ...prev, testimonios: prev.testimonios.map((t, x) => (x === i ? { ...t, ...cambios } : t)) }));

  const errores: string[] = [];
  c.slides.forEach((sl, i) => {
    if (!sl.titulo.trim() || !sl.texto.trim()) errores.push(`Slide ${i + 1}: título y texto son obligatorios.`);
  });
  if (c.nosotrosTexto.trim().length < 150 || c.nosotrosTexto.trim().length > 1500)
    errores.push("El texto de Nosotros debe tener entre 150 y 1500 caracteres.");
  if (c.queHacemosTexto.trim().length < 150 || c.queHacemosTexto.trim().length > 1500)
    errores.push("El texto de Qué hacemos debe tener entre 150 y 1500 caracteres.");
  c.testimonios.forEach((t, i) => {
    const len = t.texto.trim().length;
    if (len < 15 || len > 250) errores.push(`Testimonio ${i + 1}: el texto debe tener entre 15 y 250 caracteres.`);
    if (!t.nombre.trim()) errores.push(`Testimonio ${i + 1}: el nombre es obligatorio.`);
  });
  if (!c.redes.facebook.trim()) errores.push("El enlace de Facebook es obligatorio.");

  const guardar = () => {
    if (errores.length > 0) { toast.error(errores[0]); return; }
    guardarContenido(c);
    toast.success("Contenido publicado en la página de inicio (RF-ADMIN-007).");
  };

  const subirImagen = (i: number, f: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Formato no permitido. Usa JPG, PNG o WebP.");
      return;
    }
    if (f.size > 1500000) {
      toast.error("Imagen demasiado pesada para el prototipo (máx. 1.5 MB).");
      return;
    }
    const r = new FileReader();
    r.onload = () => setSlide(i, { imagen: String(r.result) });
    r.readAsDataURL(f);
  };

  const restaurar = () => {
    setC(CONTENIDO_DEFAULT);
    toast.info("Valores predeterminados restaurados. Pulsa Guardar para publicar.");
  };

  if (!cargado) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editor de página de inicio</h1>
          <p className="text-sm text-muted-foreground">
            Los cambios se publican al guardar (RF-ADMIN-008).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={restaurar}>
            <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
          </Button>
          <Button onClick={guardar}>
            <Save className="mr-2 h-4 w-4" /> Guardar y publicar
          </Button>
        </div>
      </div>

      {errores.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errores[0]}
        </div>
      )}

      {/* Slider */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Slider principal (slides dinámicos con prioridad)</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.slides.filter((s) => s.prioridad === "alta").length >= MAX_ALTAS ? "bg-amber-500/15 text-amber-700" : "bg-muted text-muted-foreground"}`}>
            Alta prioridad: {c.slides.filter((s) => s.prioridad === "alta").length} / {MAX_ALTAS}
          </span>
        </div>
        <Button variant="outline" size="sm" className="mb-4" onClick={agregarSlide}>
          <Plus className="mr-2 h-4 w-4" /> Agregar slide
        </Button>
        <div className="grid gap-6">
          {c.slides.map((sl, i) => (
            <div key={i} className="grid gap-3 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">Slide {i + 1}</p>
                {c.slides.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => eliminarSlide(i)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </Button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <span className="text-xs font-medium">Tipo</span>
                  <div className="flex rounded-lg border bg-muted p-1">
                    {(["normal", "aviso"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSlide(i, { tipo: t })}
                        className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${(sl.tipo || "normal") === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {t === "normal" ? "Normal" : "Aviso importante"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <span className="text-xs font-medium">Prioridad</span>
                  <div className="flex rounded-lg border bg-muted p-1">
                    {(["normal", "alta"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrioridad(i, p)}
                        className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${(sl.prioridad || "normal") === p ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {p === "normal" ? "Normal · 5 s" : "Alta · primero y 8 s"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Input value={sl.etiqueta} onChange={(e) => setSlide(i, { etiqueta: e.target.value })} placeholder="Etiqueta" />
              <Input value={sl.titulo} onChange={(e) => setSlide(i, { titulo: e.target.value })} placeholder="Título" />
              <Textarea rows={2} value={sl.texto} onChange={(e) => setSlide(i, { texto: e.target.value })} placeholder="Texto descriptivo" />
              <div className="grid gap-2">
                <span className="text-xs font-medium">Botón del slide</span>
                <button
                  type="button"
                  onClick={() => setPickerAbierto(i)}
                  className="inline-flex max-w-full items-center gap-2 rounded-lg border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-amber-500/20"
                  title="Cambiar botón del slide"
                >
                  <PencilLine className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="truncate">
                    {sl.ctaLabel ? `${sl.ctaLabel} · ${sl.ctaHref}` : "Elegir botón del slide"}
                  </span>
                </button>
              </div>
              <Dialog open={pickerAbierto === i} onOpenChange={(o) => { if (!o) setPickerAbierto(null); }}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Botón del slide {i + 1}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-2">
                    {BOTONES.map((b, x) => (
                      <Button
                        key={x}
                        type="button"
                        variant={b.texto === sl.ctaLabel && b.href === sl.ctaHref ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => { setSlide(i, { ctaLabel: b.texto, ctaHref: b.href }); setPickerAbierto(null); }}
                      >
                        {b.label}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Input value={sl.imagen} onChange={(e) => setSlide(i, { imagen: e.target.value })} placeholder="URL de imagen de fondo (opcional)" />
              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
                  Subir imagen desde archivo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(i, f); }}
                  />
                </label>
                {sl.imagen?.startsWith("data:") && (
                  <span className="text-xs text-muted-foreground">Imagen local cargada</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Sección Nosotros</h2>
        <Textarea rows={5} value={c.nosotrosTexto} onChange={(e) => setC({ ...c, nosotrosTexto: e.target.value })} />
        <Contador len={c.nosotrosTexto.trim().length} min={150} max={1500} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input value={c.nosotrosImagen1} onChange={(e) => setC({ ...c, nosotrosImagen1: e.target.value })} placeholder="URL imagen 1 (opcional)" />
          <Input value={c.nosotrosImagen2} onChange={(e) => setC({ ...c, nosotrosImagen2: e.target.value })} placeholder="URL imagen 2 (opcional)" />
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Sección Qué hacemos</h2>
        <Textarea rows={4} value={c.queHacemosTexto} onChange={(e) => setC({ ...c, queHacemosTexto: e.target.value })} />
        <Contador len={c.queHacemosTexto.trim().length} min={150} max={1500} />
      </section>

      {/* Testimonios */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Testimonios</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setC({ ...c, testimonios: [...c.testimonios, { nombre: "", texto: "", puntaje: 5, foto: "" }] })}
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </div>
        <div className="grid gap-4">
          {c.testimonios.map((t, i) => (
            <div key={i} className="grid gap-3 rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">Testimonio {i + 1}</p>
                <Button variant="ghost" size="icon" onClick={() => setC({ ...c, testimonios: c.testimonios.filter((_, x) => x !== i) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                <Input value={t.nombre} onChange={(e) => setTest(i, { nombre: e.target.value })} placeholder="Nombre" />
                <Select value={String(t.puntaje)} onValueChange={(v) => setTest(i, { puntaje: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Puntaje" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} estrella{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea rows={2} value={t.texto} onChange={(e) => setTest(i, { texto: e.target.value })} placeholder="Texto del testimonio" />
              <Contador len={t.texto.trim().length} min={15} max={250} />
              <Input value={t.foto} onChange={(e) => setTest(i, { foto: e.target.value })} placeholder="URL de fotografía (opcional)" />
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Sección Contacto y redes sociales</h2>
        <div className="grid gap-3">
          <Input value={c.contactoTitulo} onChange={(e) => setC({ ...c, contactoTitulo: e.target.value })} placeholder="Título" />
          <Textarea rows={2} value={c.contactoTexto} onChange={(e) => setC({ ...c, contactoTexto: e.target.value })} placeholder="Texto descriptivo" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1">
              <Input value={c.redes.facebook} onChange={(e) => setC({ ...c, redes: { ...c.redes, facebook: e.target.value } })} placeholder="Facebook (obligatorio)" />
              {!c.redes.facebook.trim() && <p className="text-xs text-red-600">Facebook es obligatorio.</p>}
            </div>
            <Input value={c.redes.instagram} onChange={(e) => setC({ ...c, redes: { ...c.redes, instagram: e.target.value } })} placeholder="Instagram (opcional)" />
            <Input value={c.redes.linkedin} onChange={(e) => setC({ ...c, redes: { ...c.redes, linkedin: e.target.value } })} placeholder="LinkedIn (opcional)" />
            <Input value={c.redes.youtube} onChange={(e) => setC({ ...c, redes: { ...c.redes, youtube: e.target.value } })} placeholder="YouTube (opcional)" />
            <Input value={c.redes.tiktok} onChange={(e) => setC({ ...c, redes: { ...c.redes, tiktok: e.target.value } })} placeholder="TikTok (opcional)" />
          </div>
        </div>
      </section>
    </div>
  );
}