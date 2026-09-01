"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowRight, Search, Users, BookOpen, Building2, MapPin,
  Star, Quote, Mail, Phone, MapPin as MapPinIcon, CheckCircle2, FileText,
  Briefcase} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTENIDO_DEFAULT, type ContenidoHome } from "@/lib/mock/cms";

const STATS = [
  { icon: Users, valor: "1,248", etiqueta: "Afiliados activos" },
  { icon: BookOpen, valor: "312", etiqueta: "Publicaciones académicas" },
  { icon: MapPin, valor: "32", etiqueta: "Entidades federativas" },
  { icon: Building2, valor: "78", etiqueta: "Institutos representados" },
];

function parsearLista(texto: string) {
  if (!texto) return [];
  return texto.split("\n").filter((l) => l.trim() !== "");
}

export default function HomePage() {
  const limpiar = (val: any) => (val === "undefined" || !val) ? "" : String(val);
  const [contenido, setContenido] = useState<ContenidoHome>(CONTENIDO_DEFAULT);
  const [slide, setSlide] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchContenido = async () => {
      try {
        const res = await fetch("/api/cms/contenido-inicio/publico/");
        if (res.ok) {
          const data = await res.json();
          const mappedData: ContenidoHome = {
            ...CONTENIDO_DEFAULT,
            ...data,
            nosotrosTexto: data.nosotros_texto || data.nosotrosTexto || CONTENIDO_DEFAULT.nosotrosTexto,
            queHacemosTexto: data.que_hacemos_texto || data.queHacemosTexto || CONTENIDO_DEFAULT.queHacemosTexto,
            nosotrosImagen1: data.nosotros_imagen_1 || data.nosotrosImagen1 || "",
            nosotrosImagen2: data.nosotros_imagen_2 || data.nosotrosImagen2 || "",
            afiliacion_beneficios: data.afiliacion_beneficios || CONTENIDO_DEFAULT.afiliacion_beneficios,
            afiliacion_requisitos: data.afiliacion_requisitos || CONTENIDO_DEFAULT.afiliacion_requisitos,
            afiliacion_proceso: data.afiliacion_proceso || CONTENIDO_DEFAULT.afiliacion_proceso,
            contactoTitulo: data.contacto_titulo || data.contactoTitulo || "",
            contactoTexto: data.contacto_texto || data.contactoTexto || "",
            contactoEmail: data.contacto_email || data.contactoEmail || "",
            contactoTelefono: data.contacto_telefono || data.contactoTelefono || "",
            contactoDireccion: data.contacto_direccion || data.contactoDireccion || "",
            mision: data.mision || "",
            vision: data.vision || "",
            redes: {
              facebook: data.facebook_url || data.redes?.facebook || "",
              twitter: data.twitter_url || data.redes?.twitter || "",
              instagram: data.instagram_url || data.redes?.instagram || "",
              linkedin: data.linkedin_url || data.redes?.linkedin || "",
              youtube: data.youtube_url || data.redes?.youtube || "",
              tiktok: data.tiktok_url || data.redes?.tiktok || ""},
            slides: (data.slides || []).map((s: any) => ({
              ...s,
              ctaLabel: s.boton_texto || s.ctaLabel || "",
              ctaHref: s.boton_url || s.ctaHref || ""})),
            testimonios: (data.testimonios || []).map((t: any) => ({
              ...t,
              nombre: t.autor_nombre || t.nombre || "",
              cargo: t.autor_cargo || t.cargo || ""}))};
          setContenido(mappedData);
        }
      } catch (error) {
        console.error("Error al cargar contenido del CMS, usando fallback", error);
      } finally {
        setCargando(false);
      }
    };
    fetchContenido();
  }, []);

  const slidesOrden = useMemo(() => {
    if (!contenido?.slides || contenido.slides.length === 0) return [];
    return [...contenido.slides].sort(
      (a, b) => Number(b.prioridad === "alta") - Number(a.prioridad === "alta")
    );
  }, [contenido?.slides]);

  useEffect(() => {
    if (slidesOrden.length === 0) return;
    const actual = slidesOrden[slide];
    const dur = actual?.prioridad === "alta" || actual?.tipo === "aviso" ? 8000 : 5000;
    const t = setTimeout(() => setSlide((x) => (x + 1) % slidesOrden.length), dur);
    return () => clearTimeout(t);
  }, [slide, slidesOrden]);

  const s = slidesOrden[slide] || slidesOrden[0];

  const beneficios = parsearLista(contenido.afiliacion_beneficios || "").length > 0
    ? parsearLista(contenido.afiliacion_beneficios!)
    : ["Acceso al repositorio académico completo", "Visibilidad en el catálogo de profesionales", "Participación en eventos exclusivos", "Credencial digital verificable con QR"];

  const requisitos = parsearLista(contenido.afiliacion_requisitos || "").length > 0
    ? parsearLista(contenido.afiliacion_requisitos!)
    : ["Ser egresado de un programa de posgrado del TecNM", "Contar con grado de Maestría o Doctorado", "Comprobar el grado académico", "Aceptar el código de ética"];

  const proceso = parsearLista(contenido.afiliacion_proceso || "").length > 0
    ? parsearLista(contenido.afiliacion_proceso!)
    : ["01 | Registro inicial: Completa el formulario.", "02 | Validación: Verificamos tu grado en 5 días.", "03 | Aprobación: Recibes tu credencial digital.", "04 | Activa tu perfil: Comienza a conectar."];

  if (cargando) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>;
  }

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] items-center justify-center overflow-hidden text-white">
        {s?.imagen || s?.imagen_url ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.imagen || s.imagen_url})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#004B87] via-[#003562] to-[#001D3D]" />
        )}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:py-12 md:py-16 lg:py-24 text-center">
          <span className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium tracking-wide backdrop-blur ${s?.tipo === "aviso" || s?.prioridad === "alta" ? "border-amber-300 bg-amber-400 text-amber-950 shadow-md" : "border-white/30 bg-white/10"}`}>
            {s?.tipo === "aviso" && <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            {s?.etiqueta || "Red de Egresados de Posgrado"}
          </span>

          <h1 className={`mt-4 sm:mt-6 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight ${s?.tipo === "aviso" ? "text-amber-100" : ""}`}>
            {s?.titulo || "Conectamos el talento de posgrado del TecNM"}
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-sky-100/90 px-2">
            {s?.texto || "Comunidad nacional de profesionistas que colaboran, investigan y transforman el país."}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 px-4">
            {s?.ctaLabel && s?.ctaHref && (
              <Link href={s.ctaHref} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-sm bg-[#1E4F9C] text-xs uppercase tracking-widest hover:bg-[#2A62B8]">
                  {s.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/catalogo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-sm border-white/40 bg-white/10 text-xs uppercase tracking-widest text-white backdrop-blur hover:bg-white/20">
                <Search className="mr-2 h-4 w-4" /> Buscar profesionales
              </Button>
            </Link>
          </div>

          {slidesOrden.length > 1 && (
            <div className="mt-8 sm:mt-10 md:mt-12 flex flex-nowrap justify-center gap-2">
              {slidesOrden.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} aria-label={`Ir al slide ${i + 1}`}
                  className={i === slide ? "h-1.5 sm:h-2 w-6 sm:w-8 rounded-full bg-amber-400 shadow-[0_1px_4px_rgba(0,0,0,0.6)] transition-all" : "h-1.5 sm:h-2 w-4 sm:w-6 rounded-full bg-amber-400/50 shadow-[0_1px_4px_rgba(0,0,0,0.6)] transition-all hover:bg-amber-300"} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== ESTADÍSTICAS ===== */}
      <section className="border-t bg-[#003562] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.etiqueta} className="flex flex-col items-center justify-center text-center p-3 sm:p-4">
                <stat.icon className="mb-2 h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stat.valor}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-sky-200">{stat.etiqueta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NOSOTROS ===== */}
      <section id="nosotros" className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 sm:mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">Quiénes somos</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#004B87]">Una comunidad que transforma</h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm sm:text-base text-muted-foreground whitespace-pre-line">{contenido.nosotrosTexto}</p>
          </div>
          {(contenido.nosotrosImagen1 || contenido.nosotrosImagen2) && (
            <div className="grid gap-6 md:grid-cols-2">
              {contenido.nosotrosImagen1 && <div className="rounded-xl overflow-hidden border bg-muted aspect-video"><img src={contenido.nosotrosImagen1} alt="Nosotros 1" className="w-full h-full object-cover" /></div>}
              {contenido.nosotrosImagen2 && <div className="rounded-xl overflow-hidden border bg-muted aspect-video"><img src={contenido.nosotrosImagen2} alt="Nosotros 2" className="w-full h-full object-cover" /></div>}
            </div>
          )}
        </div>
      </section>
      {/* MISIÓN Y VISIÓN */}
      <section className="bg-gradient-to-br from-[#003366] via-[#004B87] to-[#0077c8] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Nuestro rumbo</h2>
            <p className="mt-3 text-sky-100/80">Misión y visión de la Red de Egresados de Posgrado del TecNM.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400 p-2.5 text-amber-950">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <h3 className="font-serif text-2xl font-bold">Misión</h3>
              </div>
              <p className="mt-4 leading-relaxed text-sky-50/90">
                {contenido.mision || "Consolidar una comunidad de egresados de posgrado del TecNM que promueva la colaboración académica, científica y social."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400 p-2.5 text-amber-950">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <h3 className="font-serif text-2xl font-bold">Visión</h3>
              </div>
              <p className="mt-4 leading-relaxed text-sky-50/90">
                {contenido.vision || "Ser una red de referencia nacional e internacional que articule conocimientos, proyectos y liderazgos de los egresados del TecNM."}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ===== QUÉ HACEMOS ===== */}
      <section id="que-hacemos" className="py-12 sm:py-16 md:py-20 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 sm:mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">Servicios</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#004B87]">Lo que hacemos por ti</h2>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground whitespace-pre-line mb-8">{contenido.queHacemosTexto}</p>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border-0 shadow-sm"><CardContent className="p-6 flex flex-col items-center text-center"><Briefcase className="h-8 w-8 text-[#004B87] mb-3"/><h3 className="font-semibold mb-1">Vinculación Profesional</h3><p className="text-xs text-muted-foreground">Conectamos talento con el sector productivo.</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-6 flex flex-col items-center text-center"><BookOpen className="h-8 w-8 text-[#004B87] mb-3"/><h3 className="font-semibold mb-1">Investigación Aplicada</h3><p className="text-xs text-muted-foreground">Impulsamos proyectos con impacto real.</p></CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-6 flex flex-col items-center text-center"><Users className="h-8 w-8 text-[#004B87] mb-3"/><h3 className="font-semibold mb-1">Desarrollo de Comunidad</h3><p className="text-xs text-muted-foreground">Foros, congresos y networking exclusivo.</p></CardContent></Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AFILIACIÓN ===== */}
      <section id="afiliacion" className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 sm:mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">Únete a la red</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#004B87]">Afiliación</h2>
          </div>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            <Card><CardContent className="p-6 sm:p-8">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Star className="h-5 w-5 text-amber-500" /> Beneficios</h3>
              <ul className="space-y-3">{beneficios.map((b, i) => (<li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{b}</span></li>))}</ul>
            </CardContent></Card>
            <Card><CardContent className="p-6 sm:p-8">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><FileText className="h-5 w-5 text-[#004B87]" /> Requisitos</h3>
              <ul className="space-y-3">{requisitos.map((r, i) => (<li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{r}</span></li>))}</ul>
            </CardContent></Card>
          </div>
          <div className="mt-10 sm:mt-12">
            <h3 className="mb-6 text-center text-lg font-semibold">Proceso de afiliación</h3>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {proceso.map((p, i) => {
                const parts = p.split(" | ");
                return (
                  <div key={i} className="relative rounded-xl border bg-card p-5 sm:p-6">
                    <div className="mb-2 text-3xl font-bold text-amber-500">{parts[0] || `${i + 1}`}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line">{parts.slice(1).join(" | ")}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/registro"><Button size="lg" className="bg-[#004B87] hover:bg-[#003562] text-sm sm:text-base">Iniciar proceso de afiliación <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIOS ===== */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#003562] text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 sm:mb-12">
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider border-white/30 text-white">Testimonios</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold">Lo que dicen nuestros afiliados</h2>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {contenido.testimonios && contenido.testimonios.length > 0 ? (
              contenido.testimonios.slice(0, 3).map((t, i) => (
                <Card key={i} className="border-0 bg-white/5 backdrop-blur">
                  <CardContent className="p-6 sm:p-8">
                    <Quote className="mb-3 h-6 w-6 text-amber-400" />
                    <p className="mb-4 text-sm text-sky-100/90 italic">"{t.texto}"</p>
                    <div><p className="font-semibold">{t.nombre}</p><p className="text-xs text-sky-200">{t.cargo || t.autor_cargo}</p></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-3 text-sky-200">Próximamente testimonios de nuestra comunidad.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== CONTACTO ===== */}
      <section id="contacto" className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-10 sm:mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">Contáctanos</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#004B87]">{contenido.contactoTitulo || "¿Tienes dudas? Escríbenos"}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground">{contenido.contactoTexto || "Estamos para ayudarte en tu proceso de afiliación."}</p>
          </div>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-3 mb-8">
            {limpiar(contenido.contactoEmail) && <Card><CardContent className="p-6 text-center"><Mail className="mx-auto mb-3 h-8 w-8 text-[#004B87]" /><h3 className="mb-1 font-semibold">Correo</h3><p className="text-sm text-muted-foreground break-all">{limpiar(contenido.contactoEmail)}</p></CardContent></Card>}
            {limpiar(contenido.contactoTelefono) && <Card><CardContent className="p-6 text-center"><Phone className="mx-auto mb-3 h-8 w-8 text-[#004B87]" /><h3 className="mb-1 font-semibold">Teléfono</h3><p className="text-sm text-muted-foreground">{limpiar(contenido.contactoTelefono)}</p></CardContent></Card>}
            {limpiar(contenido.contactoDireccion) && <Card><CardContent className="p-6 text-center"><MapPinIcon className="mx-auto mb-3 h-8 w-8 text-[#004B87]" /><h3 className="mb-1 font-semibold">Ubicación</h3><p className="text-sm text-muted-foreground">{limpiar(contenido.contactoDireccion)}</p></CardContent></Card>}
          </div>
          <div className="flex justify-center gap-4">
            {contenido.redes?.facebook && <Link href={contenido.redes.facebook} target="_blank" className="p-2 rounded-full bg-muted hover:bg-[#004B87] hover:text-white transition-colors"><span className="text-[10px] font-bold leading-none">FB</span></Link>}
            {contenido.redes?.instagram && <Link href={contenido.redes.instagram} target="_blank" className="p-2 rounded-full bg-muted hover:bg-[#004B87] hover:text-white transition-colors"><span className="text-[10px] font-bold leading-none">IG</span></Link>}
            {contenido.redes?.linkedin && <Link href={contenido.redes.linkedin} target="_blank" className="p-2 rounded-full bg-muted hover:bg-[#004B87] hover:text-white transition-colors"><span className="text-[10px] font-bold leading-none">IN</span></Link>}
            {contenido.redes?.twitter && <Link href={contenido.redes.twitter} target="_blank" className="p-2 rounded-full bg-muted hover:bg-[#004B87] hover:text-white transition-colors"><span className="text-[10px] font-bold leading-none">X</span></Link>}
            {contenido.redes?.youtube && <Link href={contenido.redes.youtube} target="_blank" className="p-2 rounded-full bg-muted hover:bg-[#004B87] hover:text-white transition-colors"><span className="text-[10px] font-bold leading-none">YT</span></Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
