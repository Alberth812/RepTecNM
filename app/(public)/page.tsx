"use client";

import { useEffect, useState , useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowRight, Search, Users, BookOpen, Building2, MapPin, GraduationCap,
  Star, Quote, QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadisticasPublicas } from "@/components/public/estadisticas-publicas";
import { CONTENIDO_DEFAULT, cargarContenido, type ContenidoHome } from "@/lib/mock/cms";

const STATS = [
  { icon: Users, valor: "1,248", etiqueta: "Afiliados activos" },
  { icon: BookOpen, valor: "312", etiqueta: "Publicaciones académicas" },
  { icon: MapPin, valor: "32", etiqueta: "Entidades federativas" },
  { icon: Building2, valor: "78", etiqueta: "Institutos representados" },
];

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function HomePage() {
  const [contenido, setContenido] = useState<ContenidoHome>(CONTENIDO_DEFAULT);
  const [slide, setSlide] = useState(0);

  useEffect(() => setContenido(cargarContenido()), []);

  const slidesOrden = useMemo(
    () => [...contenido.slides].sort((a, b) => Number(b.prioridad === "alta") - Number(a.prioridad === "alta")),
    [contenido.slides]
  );

  useEffect(() => {
    const actual = slidesOrden[slide];
    const dur = actual?.prioridad === "alta" || actual?.tipo === "aviso" ? 8000 : 5000;
    const t = setTimeout(() => setSlide((x) => (x + 1) % slidesOrden.length), dur);
    return () => clearTimeout(t);
  }, [slide, slidesOrden]);

  const s = slidesOrden[slide] || slidesOrden[0];

  const redes = [
    { url: contenido.redes.facebook, label: "FB", nombre: "Facebook" },
    { url: contenido.redes.instagram, label: "IG", nombre: "Instagram" },
    { url: contenido.redes.linkedin, label: "IN", nombre: "LinkedIn" },
    { url: contenido.redes.youtube, label: "YT", nombre: "YouTube" },
    { url: contenido.redes.tiktok, label: "TK", nombre: "TikTok" },
  ].filter((r) => r.url.trim() !== "");

  return (
    <div>
      {/* Hero a sangre completa, como el sitio oficial */}
      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden text-white">
        {s.imagen ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${s.imagen})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#004B87] via-[#003562] to-[#001D3D]" />
        )}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide backdrop-blur ${s.tipo === "aviso" ? "border-amber-400/60 bg-amber-500/25 text-amber-100" : "border-white/30 bg-card/10"}`}>
            {s.tipo === "aviso" && <AlertCircle className="h-3 w-3" />}
            {s.etiqueta}
          </span>
          <h1 className={`mt-4 font-serif text-5xl font-bold leading-tight md:text-6xl ${s.tipo === "aviso" ? "text-amber-100" : ""}`}>
            {s.titulo}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sky-100/90">{s.texto}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={s.ctaHref}>
              <Button size="lg" className="rounded-sm bg-[#1E4F9C] text-xs uppercase tracking-widest hover:bg-[#2A62B8]">
                {s.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button size="lg" variant="outline" className="rounded-sm border-white/40 bg-card/10 text-xs uppercase tracking-widest text-white backdrop-blur hover:bg-card/20">
                <Search className="mr-2 h-4 w-4" />
                Buscar profesionales
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex justify-center gap-2">
            {slidesOrden.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={
                  i === slide
                    ? "h-2 w-8 rounded-full bg-amber-400 shadow-[0_1px_4px_rgba(0,0,0,0.6)] transition-all"
                    : "h-2 w-4 rounded-full bg-amber-400/50 shadow-[0_1px_4px_rgba(0,0,0,0.6)] transition-all hover:bg-amber-300"
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Franja azul institucional con estadísticas (RF-DASH-007) */}
      <section className="bg-[#27518F] py-10 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {STATS.map((st) => (
            <div key={st.etiqueta} className="flex items-center gap-3">
              <div className="rounded-xl bg-card/10 p-2.5">
                <st.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{st.valor}</p>
                <p className="text-xs text-sky-100/80">{st.etiqueta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* La red en números (RF-DASH-007) */}
      <EstadisticasPublicas />

      {/* Nosotros */}
      <section id="nosotros" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight">Nosotros</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{contenido.nosotrosTexto}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {contenido.nosotrosImagen1 ? (
            <img src={contenido.nosotrosImagen1} alt="Nosotros 1" className="h-44 w-full rounded-2xl object-cover" />
          ) : (
            <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004B87] to-sky-500">
              <GraduationCap className="h-14 w-14 text-white/70" />
            </div>
          )}
          {contenido.nosotrosImagen2 ? (
            <img src={contenido.nosotrosImagen2} alt="Nosotros 2" className="h-44 w-full rounded-2xl object-cover" />
          ) : (
            <div className="glass flex h-44 items-center justify-center rounded-2xl">
              <Users className="h-14 w-14 text-[#004B87]/60" />
            </div>
          )}
        </div>
      </section>
      <section className="bg-background py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">Qué hacemos</h2>
          <p className="mt-4 leading-relaxed text-foreground/80">
            Impulsamos la investigación aplicada, la publicación académica y la vinculación del
            talento de posgrado con los sectores productivo, social y gubernamental, para que el
            conocimiento generado en las aulas del TecNM se traduzca en desarrollo para México.
          </p>
        </div>
      </section>


      {/* Testimonios */}
      <section id="testimonios" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-serif text-3xl font-bold tracking-tight">Testimonios</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {contenido.testimonios.map((t) => (
            <div key={t.nombre} className="rounded-2xl border bg-card p-6">
              <Quote className="h-5 w-5 text-[#004B87]/40" />
              <p className="mt-3 text-sm leading-relaxed">{t.texto}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {t.foto ? (
                    <img src={t.foto} alt={t.nombre} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004B87]/10 text-xs font-bold text-[#004B87]">
                      {iniciales(t.nombre)}
                    </span>
                  )}
                  {t.nombre}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < t.puntaje
                          ? "h-4 w-4 fill-amber-400 text-amber-400"
                          : "h-4 w-4 text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="relative overflow-hidden bg-gradient-to-br from-[#004B87] to-[#001D3D] py-20 text-white">
        <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight">{contenido.contactoTitulo}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sky-100/90">{contenido.contactoTexto}</p>
          {redes.length > 0 && (
            <div className="glass-dark mx-auto mt-8 flex w-fit items-center gap-4 rounded-2xl px-6 py-4">
              {redes.map((r) => (
                <a key={r.nombre} href={r.url} target="_blank" rel="noopener noreferrer" aria-label={r.nombre} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-card/10 text-xs font-bold transition-colors hover:bg-card/20">
                  {r.label}
                </a>
              ))}
            </div>
          )}
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/catalogo">
              <Button size="lg" className="rounded-sm bg-card text-xs uppercase tracking-widest text-[#004B87] hover:bg-sky-100">
                Explorar catálogo
              </Button>
            </Link>
            <Link href="/verificar">
              <Button size="lg" variant="outline" className="rounded-sm border-white/40 bg-card/10 text-xs uppercase tracking-widest text-white backdrop-blur hover:bg-card/20">
                <QrCode className="mr-2 h-4 w-4" />
                Verificar credencial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
