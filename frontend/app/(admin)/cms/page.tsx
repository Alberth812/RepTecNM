"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, Save, Trash2, Mail, Phone, MapPin, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONTENIDO_DEFAULT, type ContenidoHome, type Slide, type Testimonio } from "@/lib/mock/cms";

const getCookie = (name: string) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const BOTONES = [
  { label: "Sin botón", texto: "", href: "" },
  { label: "Explorar catálogo", texto: "Explorar catálogo", href: "/catalogo" },
  { label: "Buscar profesionales", texto: "Buscar profesionales", href: "/catalogo" },
  { label: "Ver repositorio académico", texto: "Ver repositorio", href: "/repositorio" },
  { label: "Ver blog", texto: "Ver blog", href: "/blog" },
  { label: "Afíliate a la red", texto: "Afíliate ahora", href: "/registro" },
  { label: "Conocer la credencial digital", texto: "Conoce tu credencial", href: "/credencial" },
];

function Contador({ len, min, max }: { len: number; min: number; max: number }) {
  const fuera = len < min || len > max;
  return <p className={`text-xs ${fuera ? "text-red-600" : "text-muted-foreground"}`}>{len} / {max} caracteres (mínimo {min}).</p>;
}

export default function CmsPage() {
  const [c, setC] = useState<ContenidoHome>(CONTENIDO_DEFAULT);
  const [cargado, setCargado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagen1File, setImagen1File] = useState<File | null>(null);
  const [imagen2File, setImagen2File] = useState<File | null>(null);
  const [imagen1Preview, setImagen1Preview] = useState<string>("");
  const [imagen2Preview, setImagen2Preview] = useState<string>("");
  const [slideImages, setSlideImages] = useState<{[key: number]: {file: File | null, preview: string}}>({});

  // Auto-logout al cerrar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Limpiar sesión al cerrar
      localStorage.removeItem("rep-rol");
      localStorage.removeItem("rep-usuario");
      localStorage.removeItem("rep-tema");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Heartbeat para detectar si la pestaña está activa
    const heartbeat = setInterval(() => {
      localStorage.setItem("rep-heartbeat", Date.now().toString());
    }, 5000);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(heartbeat);
      handleBeforeUnload();
    };
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch("/api/cms/contenido-inicio/publico/");
        if (res.ok) {
          const data = await res.json();
          setC({
            ...CONTENIDO_DEFAULT,
            ...data,
            nosotrosTexto: data.nosotros_texto || data.nosotrosTexto || CONTENIDO_DEFAULT.nosotrosTexto,
            queHacemosTexto: data.que_hacemos_texto || data.queHacemosTexto || CONTENIDO_DEFAULT.queHacemosTexto,
            nosotrosImagen1: data.nosotros_imagen_1 || data.nosotrosImagen1 || "",
            nosotrosImagen2: data.nosotros_imagen_2 || data.nosotrosImagen2 || "",
            afiliacion_beneficios: data.afiliacion_beneficios || CONTENIDO_DEFAULT.afiliacion_beneficios,
            afiliacion_requisitos: data.afiliacion_requisitos || CONTENIDO_DEFAULT.afiliacion_requisitos,
            afiliacion_proceso: data.afiliacion_proceso || CONTENIDO_DEFAULT.afiliacion_proceso,
            redes: {
              facebook: data.facebook_url || data.redes?.facebook || "",
              twitter: data.twitter_url || data.redes?.twitter || "",
              instagram: data.instagram_url || data.redes?.instagram || "",
              linkedin: data.linkedin_url || data.redes?.linkedin || "",
              youtube: data.youtube_url || data.redes?.youtube || "",
              tiktok: data.tiktok_url || data.redes?.tiktok || "",
            },
            slides: (data.slides || []).map((s: any) => ({ ...s, ctaLabel: s.boton_texto || s.ctaLabel || "", ctaHref: s.boton_url || s.ctaHref || "" })),
            testimonios: (data.testimonios || []).map((t: any) => ({ ...t, nombre: t.autor_nombre || t.nombre || "", cargo: t.autor_cargo || t.cargo || "" }))});
          
          if (data.nosotros_imagen_1 || data.nosotrosImagen1) {
            setImagen1Preview(data.nosotros_imagen_1 || data.nosotrosImagen1);
          }
          if (data.nosotros_imagen_2 || data.nosotrosImagen2) {
            setImagen2Preview(data.nosotros_imagen_2 || data.nosotrosImagen2);
          }
        }
      } catch (error) {
        console.error("Error cargando CMS", error);
      } finally {
        setCargado(true);
      }
    };
    cargarDatos();
  }, []);

  const setSlide = (i: number, cambios: Partial<Slide>) =>
    setC((prev) => ({ ...prev, slides: prev.slides.map((sl, x) => (x === i ? { ...sl, ...cambios } : sl)) }));

  const setTest = (i: number, cambios: Partial<Testimonio>) =>
    setC((prev) => ({ ...prev, testimonios: prev.testimonios.map((t, x) => (x === i ? { ...t, ...cambios } : t)) }));

  const agregarSlide = () => {
    if (c.slides.length >= 5) {
      toast.error("Máximo 5 slides permitidos");
      return;
    }
    setC((prev) => ({
      ...prev,
      slides: [...prev.slides, {
        tipo: "normal",
        prioridad: "normal",
        etiqueta: "",
        titulo: "",
        texto: "",
        ctaLabel: "",
        ctaHref: "",
        imagen: "",
      }],
    }));
  };

  const eliminarSlide = (i: number) => {
    if (c.slides.length <= 1) {
      toast.error("Debe haber al menos 1 slide");
      return;
    }
    setC((prev) => ({ ...prev, slides: prev.slides.filter((_, x) => x !== i) }));
  };

  const handleSlideImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Formato no permitido. Usa JPG, PNG o WebP.");
        return;
      }
      if (file.size > 2000000) {
        toast.error("Imagen demasiado pesada (máx. 2 MB).");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlideImages(prev => ({
          ...prev,
          [index]: { file, preview: reader.result as string }
        }));
        // Actualizar el slide con la imagen en base64 temporalmente
        setSlide(index, { imagen: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSlideImage = (index: number) => {
    setSlideImages(prev => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
    setSlide(index, { imagen: "" });
  };

  const handleImagen1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Formato no permitido. Usa JPG, PNG o WebP.");
        return;
      }
      if (file.size > 2000000) {
        toast.error("Imagen demasiado pesada (máx. 2 MB).");
        return;
      }
      setImagen1File(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagen1Preview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImagen2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Formato no permitido. Usa JPG, PNG o WebP.");
        return;
      }
      if (file.size > 2000000) {
        toast.error("Imagen demasiado pesada (máx. 2 MB).");
        return;
      }
      setImagen2File(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagen2Preview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const guardar = async () => {
    setLoading(true);
    try {
      const errores: string[] = [];
      c.slides.forEach((sl, i) => {
        if (!sl.titulo.trim() || !sl.texto.trim()) {
          errores.push(`Slide ${i + 1}: título y texto son obligatorios.`);
        }
      });
      if (c.nosotrosTexto.trim().length < 150 || c.nosotrosTexto.trim().length > 1500) {
        errores.push("El texto de Nosotros debe tener entre 150 y 1500 caracteres.");
      }
      if (c.queHacemosTexto.trim().length < 150 || c.queHacemosTexto.trim().length > 1500) {
        errores.push("El texto de Qué hacemos debe tener entre 150 y 1500 caracteres.");
      }
      if (errores.length > 0) {
        toast.error(errores[0]);
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("nosotros_texto", c.nosotrosTexto);
      formData.append("mision", c.mision || "");
      formData.append("vision", c.vision || "");
      formData.append("que_hacemos_texto", c.queHacemosTexto);
      formData.append("afiliacion_beneficios", c.afiliacion_beneficios || "");
      formData.append("afiliacion_requisitos", c.afiliacion_requisitos || "");
      formData.append("afiliacion_proceso", c.afiliacion_proceso || "");
      formData.append("facebook_url", c.redes.facebook);
      formData.append("twitter_url", c.redes.twitter);
      formData.append("instagram_url", c.redes.instagram);
      formData.append("linkedin_url", c.redes.linkedin);
      formData.append("youtube_url", c.redes.youtube);
      formData.append("tiktok_url", c.redes.tiktok);
      formData.append("contacto_titulo", c.contactoTitulo);
      formData.append("contacto_texto", c.contactoTexto);
      formData.append("contacto_email", c.contactoEmail || "");
      formData.append("contacto_telefono", c.contactoTelefono || "");
      formData.append("contacto_direccion", c.contactoDireccion || "");
      
      // 1. Procesar slides: separar imágenes del JSON para enviarlas como archivos
      const slidesParaJSON = c.slides.map((s, index) => {
        const slideData = { ...s, boton_texto: s.ctaLabel, boton_url: s.ctaHref };
        // Si hay una imagen nueva en este slide, la agregamos al FormData como archivo
        if (slideImages[index]?.file) {
          formData.append(`slide_${index}_imagen`, slideImages[index].file);
          // Quitamos la cadena base64 del JSON para que el backend no falle al validar
          slideData.imagen = null; 
        }
        return slideData;
      });

      formData.append("slides", JSON.stringify(slidesParaJSON));
      formData.append("testimonios", JSON.stringify(c.testimonios.map(t => ({ ...t, autor_nombre: t.nombre, autor_cargo: t.cargo }))));
      
      // 2. Imágenes de la sección Nosotros
      if (imagen1File) {
        formData.append("nosotros_imagen_1", imagen1File);
      }
      if (imagen2File) {
        formData.append("nosotros_imagen_2", imagen2File);
      }

      const res = await fetch("/api/cms/contenido-inicio/", {
        method: "PUT",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Contenido de la página de inicio actualizado correctamente.");
        setImagen1File(null);
        setImagen2File(null);
      } else {
        const err = await res.text();
        toast.error(`Error al guardar: ${err}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      toast.error("Error de conexión al guardar.");
    } finally {
      setLoading(false);
    }
  };

  if (!cargado) return <div className="p-8 text-center text-muted-foreground">Cargando editor...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editor de Página de Inicio</h1>
          <p className="text-sm text-muted-foreground">Modifica el contenido que ven los visitantes en la página principal.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setC(CONTENIDO_DEFAULT)}><RotateCcw className="mr-2 h-4 w-4" /> Restablecer</Button>
          <Button onClick={guardar} disabled={loading}><Save className="mr-2 h-4 w-4" /> {loading ? "Guardando..." : "Guardar cambios"}</Button>
        </div>
      </div>


      {/* MISIÓN Y VISIÓN */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Misión y Visión</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Misión</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Nuestra misión es..."
              value={c.mision || ""}
              onChange={(e) => setC({ ...c, mision: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Visión</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Nuestra visión es..."
              value={c.vision || ""}
              onChange={(e) => setC({ ...c, vision: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* AFILIACIÓN: BENEFICIOS, REQUISITOS Y PROCESO */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Afiliación (Un elemento por línea)</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Beneficios</Label>
            <textarea
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="- Beneficio 1&#10;- Beneficio 2"
              value={c.afiliacion_beneficios || ""}
              onChange={(e) => setC({ ...c, afiliacion_beneficios: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Requisitos</Label>
            <textarea
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="- Requisito 1&#10;- Requisito 2"
              value={c.afiliacion_requisitos || ""}
              onChange={(e) => setC({ ...c, afiliacion_requisitos: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Proceso (Ej: 1 | Llena el formulario)</Label>
            <textarea
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="1 | Paso 1&#10;2 | Paso 2"
              value={c.afiliacion_proceso || ""}
              onChange={(e) => setC({ ...c, afiliacion_proceso: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* SLIDES DINÁMICOS CON SUBIDA DE IMÁGENES */}
      <section className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Slider Principal ({c.slides.length}/5 slides)</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={agregarSlide}
            disabled={c.slides.length >= 5}
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar slide
          </Button>
        </div>
        <div className="space-y-6">
          {c.slides.map((slide, i) => (
            <div key={i} className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Slide {i + 1}</h3>
                <div className="flex gap-2">
                  <Select value={slide.tipo} onValueChange={(v: any) => setSlide(i, { tipo: v })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="aviso">Aviso</SelectItem>
                    </SelectContent>
                  </Select>
                  {c.slides.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarSlide(i)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Etiqueta</Label>
                  <Input value={slide.etiqueta} onChange={(e) => setSlide(i, { etiqueta: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Imagen de fondo (subir desde dispositivo)</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleSlideImageChange(i, e)}
                        className="flex-1"
                      />
                      {(slideImages[i]?.preview || slide.imagen) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlideImage(i)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {(slideImages[i]?.preview || slide.imagen) && (
                      <div className="relative h-32 rounded-lg border bg-muted overflow-hidden">
                        <img 
                          src={slideImages[i]?.preview || slide.imagen} 
                          alt="Preview slide" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Título</Label>
                  <Input value={slide.titulo} onChange={(e) => setSlide(i, { titulo: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Texto descriptivo</Label>
                  <Textarea value={slide.texto} onChange={(e) => setSlide(i, { texto: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Texto del botón</Label>
                  <Select value={slide.ctaLabel} onValueChange={(v) => {
                    const btn = BOTONES.find(b => b.texto === v);
                    setSlide(i, { ctaLabel: v, ctaHref: btn ? btn.href : "" });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {BOTONES.map(b => <SelectItem key={b.label} value={b.texto}>{b.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destino del botón (URL)</Label>
                  <Input value={slide.ctaHref} onChange={(e) => setSlide(i, { ctaHref: e.target.value })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOSOTROS CON SUBIDA DE ARCHIVOS */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Sección Nosotros</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Texto descriptivo</Label>
            <Textarea value={c.nosotrosTexto || ""} onChange={(e) => setC({ ...c, nosotrosTexto: e.target.value })} rows={5} />
            <Contador len={c.nosotrosTexto.length} min={150} max={1500} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Imagen 1</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImagen1Change}
                    className="flex-1"
                  />
                  {imagen1Preview && !imagen1File && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setImagen1Preview("");
                        setC({ ...c, nosotrosImagen1: "" });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagen1Preview && (
                  <div className="relative h-32 rounded-lg border bg-muted overflow-hidden">
                    <img src={imagen1Preview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagen 2</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImagen2Change}
                    className="flex-1"
                  />
                  {imagen2Preview && !imagen2File && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setImagen2Preview("");
                        setC({ ...c, nosotrosImagen2: "" });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagen2Preview && (
                  <div className="relative h-32 rounded-lg border bg-muted overflow-hidden">
                    <img src={imagen2Preview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Misión y Visión</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Misión</Label>
            <Textarea 
              value={c.mision || ""} 
              onChange={(e) => setC({ ...c, mision: e.target.value })} 
              rows={4} 
              placeholder="Describe la misión de la asociación..."
            />
            <Contador len={(c.mision || "").length} min={50} max={1000} />
          </div>
          <div className="space-y-2">
            <Label>Visión</Label>
            <Textarea 
              value={c.vision || ""} 
              onChange={(e) => setC({ ...c, vision: e.target.value })} 
              rows={4} 
              placeholder="Describe la visión de la asociación..."
            />
            <Contador len={(c.vision || "").length} min={50} max={1000} />
          </div>
        </div>
      </section>

      {/* QUÉ HACEMOS */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Sección Qué Hacemos</h2>
        <div className="space-y-2">
          <Label>Texto descriptivo</Label>
          <Textarea value={c.queHacemosTexto || ""} onChange={(e) => setC({ ...c, queHacemosTexto: e.target.value })} rows={5} />
          <Contador len={c.queHacemosTexto.length} min={150} max={1500} />
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Testimonios</h2>
        <div className="space-y-4">
          {c.testimonios.map((t, i) => (
            <div key={i} className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Input placeholder="Nombre" value={t.nombre} onChange={(e) => setTest(i, { nombre: e.target.value })} />
                <Input placeholder="Cargo / Instituto" value={t.cargo || ""} onChange={(e) => setTest(i, { cargo: e.target.value })} />
                <Input placeholder="URL de foto" value={t.foto || ""} onChange={(e) => setTest(i, { foto: e.target.value })} />
              </div>
              <Textarea placeholder="Texto del testimonio" value={t.texto} onChange={(e) => setTest(i, { texto: e.target.value })} rows={2} />
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO Y REDES */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Contacto y Redes Sociales</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Título de contacto</Label><Input value={c.contactoTitulo || ""} onChange={(e) => setC({ ...c, contactoTitulo: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Texto de contacto</Label><Textarea value={c.contactoTexto || ""} onChange={(e) => setC({ ...c, contactoTexto: e.target.value })} /></div>
          <div className="space-y-2"><Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Correo</Label><Input value={c.contactoEmail || ""} onChange={(e) => setC({ ...c, contactoEmail: e.target.value })} /></div>
          <div className="space-y-2"><Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> Teléfono</Label><Input value={c.contactoTelefono || ""} onChange={(e) => setC({ ...c, contactoTelefono: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección</Label><Input value={c.contactoDireccion || ""} onChange={(e) => setC({ ...c, contactoDireccion: e.target.value })} /></div>
          
          <div className="space-y-2 md:col-span-2"><Label className="font-semibold mt-2 block">Redes Sociales (URLs)</Label></div>
          <div className="space-y-2"><Label>Facebook</Label><Input value={c.redes?.facebook || ""} onChange={(e) => setC({ ...c, redes: { ...c.redes, facebook: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Instagram</Label><Input value={c.redes?.instagram || ""} onChange={(e) => setC({ ...c, redes: { ...c.redes, instagram: e.target.value } })} /></div>
          <div className="space-y-2"><Label>LinkedIn</Label><Input value={c.redes?.linkedin || ""} onChange={(e) => setC({ ...c, redes: { ...c.redes, linkedin: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Twitter / X</Label><Input value={c.redes?.twitter || ""} onChange={(e) => setC({ ...c, redes: { ...c.redes, twitter: e.target.value } })} /></div>
          <div className="space-y-2"><Label>YouTube</Label><Input value={c.redes?.youtube || ""} onChange={(e) => setC({ ...c, redes: { ...c.redes, youtube: e.target.value } })} /></div>
          <div className="space-y-2"><Label>TikTok</Label><Input value={c.redes?.tiktok || ""} onChange={(e) => setC({ ...c, redes: { ...c.redes, tiktok: e.target.value } })} /></div>
        </div>
      </section>
    </div>
  );
}
