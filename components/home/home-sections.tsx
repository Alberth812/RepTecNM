import Link from "next/link";
import {
 BookOpen,
 Building2,
 Eye,
 GraduationCap,
 MapPin,
 Quote,
 QrCode,
 Search,
 Star,
 Target,
 Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type {
 CtaVM,
 RedSocialVM,
 SeccionAfiliacionVM,
 TestimonioVM,
} from "@/payload/globals/home-types";
import { cn } from "@/lib/utils";

function iniciales(nombre: string) {
 return nombre
 .split(" ")
 .filter(Boolean)
 .slice(0, 2)
 .map((p) => p[0])
 .join("")
 .toUpperCase();
}

/* -------------------------------------------------------------------------------------------- */
/* ESTADÍSTICAS */
/* -------------------------------------------------------------------------------------------- */
/* Estos 4 números no viven en el Global `home` (no hay campos para ellos */
/* en el CMS), así que quedan como valores fijos, igual que en la versión */
/* anterior. Si quieres que la directiva los edite desde el admin, se */
/* agregarían como un array de 4 campos (etiqueta + valor) en Home.ts. */
const STATS = [
 { icon: Users, valor: "1,248", etiqueta: "Afiliados activos" },
 { icon: BookOpen, valor: "312", etiqueta: "Publicaciones académicas" },
 { icon: MapPin, valor: "32", etiqueta: "Entidades federativas" },
 { icon: Building2, valor: "78", etiqueta: "Institutos representados" },
];

export function StatsSection() {
 return (
 <section className="bg-[#0B3B66] py-12 text-white">
 <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 sm:px-10 md:grid-cols-4 md:divide-x md:divide-white/15">
 {STATS.map((st, i) => (
 <div key={st.etiqueta} className={i > 0 ? "px-2 md:pl-8" : "px-2"}>
 <st.icon className="h-5 w-5 text-[#E4C878]" />
 <p className="mt-3 font-serif text-3xl font-semibold">{st.valor}</p>
 <p className="mt-1 text-sm text-white/70">{st.etiqueta}</p>
 </div>
 ))}
 </div>
 </section>
 );
}

/* -------------------------------------------------------------------------------------------- */
/* NOSOTROS */
/* -------------------------------------------------------------------------------------------- */

interface NosotrosSectionProps {
 titulo: string;
 texto: string;
 imagen1Url?: string;
 imagen2Url?: string;
}

export function NosotrosSection({
 titulo,
 texto,
 imagen1Url,
 imagen2Url,
}: NosotrosSectionProps) {
 return (
 <section id="nosotros" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
 <div className="max-w-2xl">
 <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
 {titulo}
 </h2>
 <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
 {texto}
 </p>
 </div>

 {/* Fila propia para las dos imágenes, con un leve desfase vertical
 entre ellas en vez del grid parejo de dos columnas que había antes. */}
 <div className="mt-12 grid gap-6 sm:grid-cols-2">
 <div className="relative h-64 overflow-hidden rounded-lg sm:h-80">
 {imagen1Url ? (
 <img
 src={imagen1Url}
 alt="Comunidad de la Red de Egresados"
 className="h-full w-full object-cover"
 />
 ) : (
 <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0B3B66] to-[#2E6DA4]">
 <GraduationCap className="h-14 w-14 text-white/60" />
 </div>
 )}
 </div>
 {/*<div className="relative h-64 overflow-hidden rounded-lg sm:mt-10 sm:h-80">*/}
 <div className="relative h-64 overflow-hidden rounded-lg sm:h-80">
 {imagen2Url ? (
 <img
 src={imagen2Url}
 alt="Egresados en actividades de vinculación"
 className="h-full w-full object-cover"
 />
 ) : (
 <div className="flex h-full items-center justify-center bg-[#EFEDE6]">
 <Users className="h-14 w-14 text-[#0B3B66]/50" />
 </div>
 )}
 </div>
 </div>
 </section>
 );
}

/* -------------------------------------------------------------------------------------------- */
/* MISIÓN / VISIÓN */
/* -------------------------------------------------------------------------------------------- */

interface MisionVisionSectionProps {
 mision: { titulo: string; texto: string };
 vision: { titulo: string; texto: string };
}

export function MisionVisionSection({
 mision,
 vision,
}: MisionVisionSectionProps) {
 return (
 <section className="grid overflow-hidden sm:grid-cols-2">
 <div className="bg-[#0A2540] px-6 py-20 text-white sm:px-12 lg:py-28">
 <Target className="h-6 w-6 text-[#C9972E]" />
 <h3 className="mt-5 font-serif text-2xl font-semibold sm:text-3xl">
 {mision.titulo}
 </h3>
 <p className="mt-4 max-w-md leading-relaxed text-white/75">
 {mision.texto}
 </p>
 </div>
 <div className="bg-[#EFEDE6] px-6 py-20 text-[#1C2530] sm:px-12 lg:py-28">
 <Eye className="h-6 w-6 text-[#0B3B66]" />
 <h3 className="mt-5 font-serif text-2xl font-semibold sm:text-3xl">
 {vision.titulo}
 </h3>
 <p className="mt-4 max-w-md leading-relaxed text-[#1C2530]/75">
 {vision.texto}
 </p>
 </div>
 </section>
 );
}

/* -------------------------------------------------------------------------------------------- */
/* AFILIACIÓN */
/* -------------------------------------------------------------------------------------------- */

interface AfiliacionSectionProps {
 titulo: string;
 descripcion: string;
 secciones: SeccionAfiliacionVM[];
 cta: CtaVM;
}

export function AfiliacionSection({
 titulo,
 descripcion,
 secciones,
 cta,
}: AfiliacionSectionProps) {
 return (
 <section id="afiliacion" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
 <div className="max-w-2xl">
 <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
 {titulo}
 </h2>
 <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
 {descripcion}
 </p>
 </div>

 <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
 {secciones.map((seccion) => {
 // Heurística simple: solo la sección "Proceso" es una secuencia real,
 // así que es la única que se numera (ver guía de diseño: los
 // marcadores numerados solo tienen sentido si el contenido de
 // verdad es una secuencia). Si prefieres controlarlo explícitamente
 // desde el CMS, se puede agregar un checkbox `esSecuencia` a cada
 // sección en Home.ts.
 const esProceso = seccion.titulo.toLowerCase().includes("proceso");
 return (
 <div key={seccion.titulo} className="bg-card p-8">
 <h3 className="font-serif text-xl font-semibold text-foreground">
 {seccion.titulo}
 </h3>
 {esProceso ? (
 <ol className="mt-4 space-y-3">
 {seccion.items.map((item, i) => (
 <li
 key={item}
 className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
 >
 <span className="font-serif text-[#C9972E]">
 {i + 1}.
 </span>
 <span>{item}</span>
 </li>
 ))}
 </ol>
 ) : (
 <ul className="mt-4 space-y-3">
 {seccion.items.map((item) => (
 <li
 key={item}
 className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
 >
 <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#C9972E]" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 )}
 </div>
 );
 })}
 </div>

 <Link
 href={cta.href}
 className={cn(
 buttonVariants({ size: "lg" }),
 "bg-[#C9972E] text-[#1C1305] hover:bg-[#DDAC42]",
 )}
 >
 {cta.label}
 </Link>
 </section>
 );
}

/* -------------------------------------------------------------------------------------------- */
/* QUÉ HACEMOS */
/* -------------------------------------------------------------------------------------------- */

interface QueHacemosSectionProps {
 titulo: string;
 texto: string;
}

export function QueHacemosSection({ titulo, texto }: QueHacemosSectionProps) {
 return (
 <section className="bg-[#EFEDE6] py-24">
 <div className="mx-auto max-w-2xl px-6 text-center sm:px-10">
 <h2 className="text-sm font-semibold text-[#0B3B66]">{titulo}</h2>
 <p className="mt-5 font-serif text-2xl leading-snug text-[#1C2530] sm:text-3xl">
 {texto}
 </p>
 </div>
 </section>
 );
}

/* -------------------------------------------------------------------------------------------- */
/* TESTIMONIOS */
/* -------------------------------------------------------------------------------------------- */

interface TestimoniosSectionProps {
 testimonios: TestimonioVM[];
}

export function TestimoniosSection({ testimonios }: TestimoniosSectionProps) {
 if (testimonios.length === 0) return null;

 return (
 <section id="testimonios" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
 <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
 Testimonios
 </h2>
 <div className="mt-12 grid gap-8 md:grid-cols-3">
 {testimonios.map((t) => (
 <figure key={t.id} className="border-t-2 border-[#C9972E] pt-6">
 <Quote className="h-5 w-5 text-[#0B3B66]/30" />
 <blockquote className="mt-3 font-serif text-lg leading-relaxed text-foreground">
 {t.texto}
 </blockquote>
 <figcaption className="mt-5 flex items-center justify-between">
 <span className="flex items-center gap-3 text-sm font-medium text-foreground">
 {t.fotoUrl ? (
 <img
 src={t.fotoUrl}
 alt={t.nombre}
 className="h-9 w-9 rounded-full object-cover"
 />
 ) : (
 <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0B3B66]/25 text-xs font-semibold text-[#0B3B66]">
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
 ? "h-3.5 w-3.5 fill-[#C9972E] text-[#C9972E]"
 : "h-3.5 w-3.5 text-muted-foreground/25"
 }
 />
 ))}
 </div>
 </figcaption>
 </figure>
 ))}
 </div>
 </section>
 );
}

/* -------------------------------------------------------------------------------------------- */
/* CONTACTO */
/* -------------------------------------------------------------------------------------------- */

interface ContactoSectionProps {
 titulo: string;
 texto: string;
 redes: RedSocialVM[];
}

export function ContactoSection({
 titulo,
 texto,
 redes,
}: ContactoSectionProps) {
 return (
 <section id="contacto" className="bg-[#0A2540] py-24 text-white">
 <div className="mx-auto max-w-2xl px-6 text-center sm:px-10">
 <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
 {titulo}
 </h2>
 <p className="mt-4 leading-relaxed text-white/75">{texto}</p>

 {redes.length > 0 && (
 <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
 {redes.map((r) => (
 <a
 key={r.nombre}
 href={r.url}
 target="_blank"
 rel="noopener noreferrer"
 className="rounded-full border border-white/25 px-4 py-2 text-sm text-white/85 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9972E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A2540]"
 >
 {r.nombre}
 </a>
 ))}
 </div>
 )}

 <div className="mt-10 flex flex-wrap justify-center gap-3">
 <Link
 href="/catalogo"
 className={cn(
 buttonVariants({ size: "lg" }),
 "bg-card text-[#0B3B66] hover:bg-white/90",
 )}
 >
 <Search className="mr-2 h-4 w-4" />
 Explorar catálogo
 </Link>

 <Link
 href="/verificar"
 className={cn(
 buttonVariants({
 variant: "outline",
 size: "lg",
 }),
 "border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15",
 )}
 >
 <QrCode className="mr-2 h-4 w-4" />
 Verificar credencial
 </Link>
 </div>
 </div>
 </section>
 );
}
