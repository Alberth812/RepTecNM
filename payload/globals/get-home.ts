import { getPayload } from "payload";
// Ajusta este import al alias real de tu proyecto si no usas "@payload-config"
// (por ejemplo: `import configPromise from "@/payload.config"`).
import configPromise from "@payload-config";
import type {
  HeroSlideVM,
  HomeContent,
  RedSocialVM,
  SeccionAfiliacionVM,
  TestimonioVM,
} from "./home-types";

type PopulatedMedia = { url?: string | null } | null | undefined;
type MaybeMedia = string | number | PopulatedMedia;

export function getMediaUrl(media: MaybeMedia): string | undefined {
  if (media && typeof media === "object" && "url" in media) {
    let url = media.url;
    if (url) {
      try {
        return new URL(url).pathname;
      } catch {
        return url;
      }
    }
  }
  return undefined;
}

/**
 * Trae el Global `home` y lo transforma a `HomeContent`.
 *
 * - `depth: 2` puebla las relaciones `upload` (imagen, imagen1/imagen2, foto)
 *   para que vengan como objeto `media` completo, no solo su ID.
 * - Filtra por `activo` aquí mismo, así ningún componente de UI necesita
 *   saber que ese campo existe.
 * - Aplica valores por defecto para que la página nunca reciba `undefined`
 *   en un texto, aunque el editor todavía no haya llenado esa sección.
 *
 * Nota: si corriste `payload generate:types`, `payload.findGlobal({ slug: "home" })`
 * ya viene tipado como tu `Home` generado. Si aún no generas tipos, este
 * archivo sigue funcionando igual (con `home` como `any`), solo pierdes
 * autocompletado.
 */
export async function getHomeContent(): Promise<HomeContent> {
  const payload = await getPayload({ config: configPromise });

  const home = await payload.findGlobal({
    slug: "home",
    depth: 2,
  });

  const slides: HeroSlideVM[] = (home.hero?.slides ?? [])
    .filter((slide) => slide.activo !== false)
    .map((slide, index) => ({
      id: String(slide.id ?? index),
      etiqueta: slide.etiqueta,
      titulo: slide.titulo,
      texto: slide.texto,
      duracion: slide.duracion ?? 5000,
      imagenUrl: getMediaUrl(slide.imagen),
      ctaPrincipal: {
        label: slide.ctaPrincipal.label,
        href: slide.ctaPrincipal.href,
      },
      ctaSecundario:
        slide.ctaSecundario?.href && slide.ctaSecundario?.label
          ? { label: slide.ctaSecundario.label, href: slide.ctaSecundario.href }
          : undefined,
    }));

  const secciones: SeccionAfiliacionVM[] = (
    home.afiliacion?.secciones ?? []
  ).map((seccion) => ({
    titulo: seccion.titulo,
    items: (seccion.items ?? []).map((item) => item.texto),
  }));

  const testimonios: TestimonioVM[] = (home.testimonios ?? [])
    .filter((t) => t.activo !== false)
    .map((t, index) => ({
      id: String(t.id ?? index),
      nombre: t.nombre,
      texto: t.texto,
      puntaje: t.puntaje,
      fotoUrl: getMediaUrl(t.foto),
    }));

  const redesCrudas = home.contacto?.redes;
  const redesCandidatas: { nombre: string; url?: string | null }[] = [
    { nombre: "Facebook", url: redesCrudas?.facebook },
    { nombre: "Instagram", url: redesCrudas?.instagram },
    { nombre: "LinkedIn", url: redesCrudas?.linkedin },
    { nombre: "YouTube", url: redesCrudas?.youtube },
    { nombre: "TikTok", url: redesCrudas?.tiktok },
  ];
  const redes: RedSocialVM[] = redesCandidatas.filter((r): r is RedSocialVM =>
    Boolean(r.url && r.url.trim() !== ""),
  );

  return {
    hero: { slides },
    nosotros: {
      titulo: home.nosotros?.titulo ?? "Nosotros",
      texto: home.nosotros?.texto ?? "",
      imagen1Url: getMediaUrl(home.nosotros?.imagen1),
      imagen2Url: getMediaUrl(home.nosotros?.imagen2),
    },
    mision: {
      titulo: home.mision?.titulo ?? "Misión",
      texto: home.mision?.texto ?? "",
    },
    vision: {
      titulo: home.vision?.titulo ?? "Visión",
      texto: home.vision?.texto ?? "",
    },
    afiliacion: {
      titulo: home.afiliacion?.titulo ?? "Afiliación",
      descripcion: home.afiliacion?.descripcion ?? "",
      secciones,
      cta: {
        label: home.afiliacion?.cta?.label ?? "¿Eres nuevo? Afíliate",
        href: home.afiliacion?.cta?.href ?? "/register",
      },
    },
    queHacemos: {
      titulo: home.queHacemos?.titulo ?? "Qué hacemos",
      texto: home.queHacemos?.texto ?? "",
    },
    testimonios,
    contacto: {
      titulo: home.contacto?.titulo ?? "Contacto",
      texto: home.contacto?.texto ?? "",
      redes,
    },
  };
}
