"use client";

import { useState } from "react";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CONTENIDO_DEFAULT, cargarContenido, guardarContenido,
  type ContenidoHome, type Slide, type Testimonio,
} from "@/lib/mock/cms";

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

  useState(() => {
    setC(cargarContenido());
    setCargado(true);
    return true;
  });

  const setSlide = (i: number, cambios: Partial<Slide>) =>
    setC((prev) => ({ ...prev, slides: prev.slides.map((sl, x) => (x === i ? { ...sl, ...cambios } : sl)) }));

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
        <h2 className="mb-4 font-semibold">Slider principal (3 slides fijos)</h2>
        <div className="grid gap-6">
          {c.slides.map((sl, i) => (
            <div key={i} className="grid gap-3 rounded-xl border bg-background p-4">
              <p className="text-sm font-medium text-primary">Slide {i + 1}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={sl.etiqueta} onChange={(e) => setSlide(i, { etiqueta: e.target.value })} placeholder="Etiqueta" />
                <Input value={sl.ctaLabel} onChange={(e) => setSlide(i, { ctaLabel: e.target.value })} placeholder="Texto del botón" />
              </div>
              <Input value={sl.titulo} onChange={(e) => setSlide(i, { titulo: e.target.value })} placeholder="Título" />
              <Textarea rows={2} value={sl.texto} onChange={(e) => setSlide(i, { texto: e.target.value })} placeholder="Texto descriptivo" />
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={sl.ctaHref} onChange={(e) => setSlide(i, { ctaHref: e.target.value })} placeholder="Destino del botón (ej. /catalogo)" />
                <Input value={sl.imagen} onChange={(e) => setSlide(i, { imagen: e.target.value })} placeholder="URL de imagen de fondo (opcional)" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nosotros */}
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