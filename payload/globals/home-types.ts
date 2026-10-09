export interface CtaVM {
  label: string;
  href: string;
}

export interface HeroSlideVM {
  id: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  duracion: number;
  imagenUrl?: string;
  ctaPrincipal: CtaVM;
  ctaSecundario?: CtaVM;
}

export interface SeccionAfiliacionVM {
  titulo: string;
  items: string[];
}

export interface TestimonioVM {
  id: string;
  nombre: string;
  texto: string;
  puntaje: number;
  fotoUrl?: string;
}

export interface RedSocialVM {
  nombre: string;
  url: string;
}

export interface HomeContent {
  hero: { slides: HeroSlideVM[] };
  nosotros: { titulo: string; texto: string; imagen1Url?: string; imagen2Url?: string };
  mision: { titulo: string; texto: string };
  vision: { titulo: string; texto: string };
  afiliacion: { titulo: string; descripcion: string; secciones: SeccionAfiliacionVM[]; cta: CtaVM };
  queHacemos: { titulo: string; texto: string };
  testimonios: TestimonioVM[];
  contacto: { titulo: string; texto: string; redes: RedSocialVM[] };
}
