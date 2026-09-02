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
            <span className="cursor-not-allowed opacity-50" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-sm border-white/40 bg-white/10 text-xs uppercase tracking-widest text-white backdrop-blur hover:bg-white/20" disabled>
                <Search className="mr-2 h-4 w-4" /> Catálogo próximamente
              </Button>
            </span>
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
      

      
      {/* ===== AFILIACIÓN ===== */}
      <section id="afiliacion" className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 sm:mb-12">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">Únete a la red</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#004B87]">Afiliación</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground">Conoce los beneficios, requisitos y el proceso para unirte a la Red de Egresados de Posgrado del TecNM.</p>
          </div>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-lg text-[#004B87]">Beneficios</h3>
                <ul className="space-y-3">
                  {beneficios.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-lg text-[#004B87]">Requisitos</h3>
                <ul className="space-y-3">
                  {requisitos.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-lg text-[#004B87]">Proceso</h3>
                <ol className="space-y-3">
                  {proceso.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004B87] text-xs font-bold text-white">{i + 1}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/registro">
              <Button size="lg" className="bg-[#004B87] hover:bg-[#003562] text-sm sm:text-base">
                Iniciar proceso de afiliación <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
            {contenido.contactoEmail && <Card><CardContent className="p-6 text-center"><Mail className="mx-auto mb-3 h-8 w-8 text-[#004B87]" /><h3 className="mb-1 font-semibold">Correo</h3><p className="text-sm text-muted-foreground break-all">{contenido.contactoEmail}</p></CardContent></Card>}
            {contenido.contactoTelefono && <Card><CardContent className="p-6 text-center"><Phone className="mx-auto mb-3 h-8 w-8 text-[#004B87]" /><h3 className="mb-1 font-semibold">Teléfono</h3><p className="text-sm text-muted-foreground">{contenido.contactoTelefono}</p></CardContent></Card>}
            {contenido.contactoDireccion && <Card><CardContent className="p-6 text-center"><MapPinIcon className="mx-auto mb-3 h-8 w-8 text-[#004B87]" /><h3 className="mb-1 font-semibold">Ubicación</h3><p className="text-sm text-muted-foreground">{contenido.contactoDireccion}</p></CardContent></Card>}
          </div>
          {(contenido.redes?.facebook || contenido.redes?.instagram || contenido.redes?.linkedin || contenido.redes?.twitter || contenido.redes?.youtube) && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <p className="text-sm font-medium text-muted-foreground">Síguenos en:</p>
              <div className="flex items-center gap-3">
                {contenido.redes?.facebook && (
                  <Link href={contenido.redes.facebook} target="_blank" aria-label="Facebook" className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[#004B87] transition-all hover:bg-[#004B87] hover:text-white hover:scale-110">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </Link>
                )}
                {contenido.redes?.instagram && (
                  <Link href={contenido.redes.instagram} target="_blank" aria-label="Instagram" className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[#004B87] transition-all hover:bg-[#004B87] hover:text-white hover:scale-110">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </Link>
                )}
                {contenido.redes?.linkedin && (
                  <Link href={contenido.redes.linkedin} target="_blank" aria-label="LinkedIn" className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[#004B87] transition-all hover:bg-[#004B87] hover:text-white hover:scale-110">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </Link>
                )}
                {contenido.redes?.twitter && (
                  <Link href={contenido.redes.twitter} target="_blank" aria-label="Twitter / X" className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[#004B87] transition-all hover:bg-[#004B87] hover:text-white hover:scale-110">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </Link>
                )}
                {contenido.redes?.youtube && (
                  <Link href={contenido.redes.youtube} target="_blank" aria-label="YouTube" className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[#004B87] transition-all hover:bg-[#004B87] hover:text-white hover:scale-110">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
