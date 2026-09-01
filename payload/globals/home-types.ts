/**
 * Tipos "de vista" (view models) para el Global `home`.
 *
 * La idea es que los componentes de presentación (`hero-carousel.tsx`,
 * `home-sections.tsx`) nunca importen los tipos generados de Payload
 * directamente: solo conocen esta forma, ya resuelta y con los valores
 * por defecto aplicados. Toda la lógica de "¿esto vino vacío?, ¿la imagen
 * está poblada?" vive en `get-home.ts`.
 */

export interface CtaVM {
  label: string;
  href: string;
}

export interface HeroSlideVM {
  id: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  /** Milisegundos que el slide permanece visible (campo `duracion` del CMS). */
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
  hero: {
    slides: HeroSlideVM[];
  };
  nosotros: {
    titulo: string;
    texto: string;
    imagen1Url?: string;
    imagen2Url?: string;
  };
  mision: {
    titulo: string;
    texto: string;
  };
  vision: {
    titulo: string;
    texto: string;
  };
  afiliacion: {
    titulo: string;
    descripcion: string;
    secciones: SeccionAfiliacionVM[];
    cta: CtaVM;
  };
  queHacemos: {
    titulo: string;
    texto: string;
  };
  testimonios: TestimonioVM[];
  contacto: {
    titulo: string;
    texto: string;
    redes: RedSocialVM[];
  };
}
