"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowRight, Search, Users, BookOpen, Building2, MapPin, GraduationCap,
  Target, Eye, CheckCircle, FileText, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const normalizarUrl = (url: string | null) => {
  if (!url) return null;
  return url.replace("http://localhost:8001", "").replace("https://localhost", "");
};

const STATS = [
  { icon: Users, valor: "1,248", etiqueta: "Afiliados activos" },
  { icon: BookOpen, valor: "312", etiqueta: "Publicaciones académicas" },
  { icon: MapPin, valor: "32", etiqueta: "Entidades federativas" },
  { icon: Building2, valor: "78", etiqueta: "Institutos representados" },
];

export default function HomePage() {
  const [contenido, setContenido] = useState<any>(null);
  const [slide, setSlide] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchContenido = async () => {
      try {
        const res = await fetch("/api/cms/contenido-inicio/publico/");
        if (res.ok) {
          const data = await res.json();
          setContenido(data);
        }
      } catch (error) {
        console.error("Error al cargar contenido:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchContenido();
  }, []);

  const slidesOrden = useMemo(
    () => {
      if (!contenido?.slides || contenido.slides.length === 0) return [];
      return [...contenido.slides].sort((a: any, b: any) => Number(b.prioridad === "alta") - Number(a.prioridad === "alta"));
    },
    [contenido?.slides]
  );

  useEffect(() => {
    if (slidesOrden.length === 0) return;
    const actual = slidesOrden[slide];
    const dur = actual?.prioridad === "alta" || actual?.tipo === "aviso" ? 8000 : 5000;
    const t = setTimeout(() => setSlide((x) => (x + 1) % slidesOrden.length), dur);
    return () => clearTimeout(t);
  }, [slide, slidesOrden]);

  const s = slidesOrden[slide] || slidesOrden[0];

  const renderLista = (texto: string, tipo: "check" | "number") => {
    if (!texto) return null;
    return texto.split("\n").filter(line => line.trim() !== "").map((line, i) => (
      <li key={i} className="flex items-start gap-2">
        {tipo === "check" ? (
          <CheckCircle className="h-5 w-5 text-cyan-600 mt-0.5 shrink-0" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-white text-xs font-bold shrink-0 mt-0.5">
            {i + 1}
          </span>
        )}
        <span>{line.replace(/^[•\-\d\.\)\s]+/, "").trim()}</span>
      </li>
    ));
  };

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500">Cargando contenido...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero / Slider */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {s?.imagen_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ backgroundImage: `url(${normalizarUrl(s.imagen_url)})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#004B87] via-[#003562] to-[#001D3D]" />
        )}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 container mx-auto px-4 py-24 text-center text-white">
          <Badge className={`mb-6 px-4 py-2 text-sm font-semibold backdrop-blur-md border-0 ${
            s?.tipo === "aviso" || s?.prioridad === "alta"
              ? "bg-amber-500 text-white"
              : "bg-white/20 text-white"
          }`}>
            {s?.tipo === "aviso" && <AlertCircle className="mr-2 h-3 w-3" />}
            {s?.etiqueta || "Bienvenido"}
          </Badge>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 text-white">
            {s?.titulo || "Red de Egresados de Posgrado"}
          </h1>

          <p className="mx-auto max-w-3xl text-xl md:text-2xl text-white/95 mb-10 leading-relaxed">
            {s?.texto || "Fortaleciendo la vinculación profesional y la colaboración académica."}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {s?.boton_texto && s?.boton_url && (
              <Link href={s.boton_url}>
                <Button size="lg" className="bg-[#1E4F9C] hover:bg-[#2A62B8] text-white px-8 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                  {s.boton_texto}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/catalogo">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md px-8 text-base font-semibold rounded-lg">
                <Search className="mr-2 h-5 w-5" />
                Buscar profesionales
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-2">
            {slidesOrden.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === slide ? "w-8 bg-amber-400" : "w-4 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-20 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((st, idx) => (
            <Card key={idx} className="bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#004B87] to-[#0070C0] text-white">
                    <st.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{st.valor}</p>
                    <p className="text-sm text-slate-500">{st.etiqueta}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#004B87] mb-4">
            Nosotros
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Texto a la izquierda */}
          <div className="space-y-6 text-lg text-black leading-relaxed">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-[#004B87] first-letter:mr-2 first-letter:float-left">
              {contenido?.nosotros_texto ||
                "La Red de Egresados de Posgrado del Tecnológico Nacional de México, A.C., surge como una iniciativa colectiva para consolidar un espacio de vinculación académica, científica, social y profesional entre quienes han egresado de los programas de posgrado del TecNM."}
            </p>
          </div>

          {/* Imágenes a la derecha */}
          <div className="grid grid-cols-2 gap-4">
            {contenido?.nosotros_imagen_1_url && (
              <div className="relative group overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={normalizarUrl(contenido.nosotros_imagen_1_url)}
                  alt="Nosotros"
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            )}
            {contenido?.nosotros_imagen_2_url && (
              <div className="relative group overflow-hidden rounded-2xl shadow-xl mt-8">
                <img
                  src={normalizarUrl(contenido.nosotros_imagen_2_url)}
                  alt="Nosotros 2"
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            )}
            {/* Si no hay imágenes, mostrar placeholder */}
            {!contenido?.nosotros_imagen_1_url && !contenido?.nosotros_imagen_2_url && (
              <div className="col-span-2 flex items-center justify-center h-64 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-sm">Sube imágenes desde el CMS</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-24 bg-[#004B87]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white border border-slate-200 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#004B87] to-[#0070C0] flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#004B87] mb-4">Misión</h3>
                <p className="text-black leading-relaxed">
                  {contenido?.mision ||
                    "Consolidar una comunidad de egresados de posgrado del TecNM que promueva la colaboración académica, científica y social, contribuyendo al desarrollo sustentable, la innovación tecnológica y el fortalecimiento institucional."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#004B87] mb-4">Visión</h3>
                <p className="text-black leading-relaxed">
                  {contenido?.vision ||
                    "Ser una red de referencia nacional e internacional que articule conocimientos, proyectos y liderazgos de los egresados del TecNM, posicionando su incidencia en la transformación productiva y la innovación social."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Qué hacemos */}
      <section id="que-hacemos" className="py-24 container mx-auto px-4 bg-white">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#004B87] mb-4">
            Qué hacemos
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mb-6" />
        </div>

        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-black leading-relaxed text-center">
            {contenido?.que_hacemos_texto ||
              "Impulsamos la investigación aplicada, la publicación académica y la vinculación del talento de posgrado con los sectores productivo, social y gubernamental, para que el conocimiento generado en las aulas del TecNM se traduzca en desarrollo para México."}
          </p>
        </div>
      </section>

      {/* Afiliación */}
      <section id="afiliacion" className="py-24 bg-[#004B87] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Afiliación
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Conoce los beneficios, requisitos y el proceso para unirte a la red
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Card className="bg-white border border-slate-200 rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center mb-6">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Beneficios</h3>
                <ul className="space-y-3 text-black">
                  {renderLista(contenido?.afiliacion_beneficios || "• Credencial digital con verificación QR\n• Perfil en catálogo nacional\n• Mensajería con la comunidad\n• Publicación en repositorio", "check")}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Requisitos</h3>
                <ul className="space-y-3 text-black">
                  {renderLista(contenido?.afiliacion_requisitos || "• Grado de posgrado en TecNM\n• Comprobante de pago\n• Fotografía 3:4 reciente\n• Identificación oficial", "check")}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center mb-6">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Proceso</h3>
                <ol className="space-y-3 text-black">
                  {renderLista(contenido?.afiliacion_proceso || "1. Crea tu cuenta y verifica correo\n2. Completa tu expediente\n3. Revisión y aprobación\n4. Recibe credencial activa", "number")}
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/registro">
              <Button size="lg" className="bg-amber-400/90 backdrop-blur-md text-amber-950 font-semibold px-10 py-6 text-lg rounded-xl shadow-xl hover:bg-amber-300/90 border border-amber-300/50 transition-all">
                ¿Eres nuevo? Afíliate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-24 container mx-auto px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold text-[#004B87] mb-4">
            Contacto
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mb-6" />
          <p className="text-lg text-black mb-8">
            ¿Quieres saber más sobre la afiliación o los servicios de la red? Escríbenos o síguenos en nuestras redes oficiales.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {contenido?.contacto_email && (
              <a href={`mailto:${contenido.contacto_email}`} className="flex items-center gap-2 text-[#004B87] hover:underline">
                <MapPin className="h-5 w-5" /> {contenido.contacto_email}
              </a>
            )}
            {contenido?.contacto_telefono && (
              <span className="flex items-center gap-2 text-black">
                <MapPin className="h-5 w-5" /> {contenido.contacto_telefono}
              </span>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {contenido?.facebook_url && (
              <a href={contenido.facebook_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform">
                <span className="font-bold">FB</span>
              </a>
            )}
            {contenido?.instagram_url && (
              <a href={contenido.instagram_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <span className="font-bold">IG</span>
              </a>
            )}
            {contenido?.twitter_url && (
              <a href={contenido.twitter_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform">
                <span className="font-bold">X</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/log.png" alt="REP-TecNM" className="h-8 w-auto" />
            <div className="text-left">
              <p className="font-bold text-white">REP-TecNM</p>
              <p className="text-xs text-slate-400">Red de Egresados de Posgrado</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 Red de Egresados de Posgrado del Tecnológico Nacional de México. Todos los derechos reservados.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
            <a href="/aviso-de-privacidad" className="hover:text-amber-400 transition-colors">Aviso de Privacidad</a>
            <span>•</span>
            <a href="/#contacto" className="hover:text-amber-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
