import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { HeroSlideVM, HomeContent, RedSocialVM, SeccionAfiliacionVM, TestimonioVM } from "./home-types";

type PopulatedMedia = { url?: string | null } | null | undefined;
type MaybeMedia = string | number | PopulatedMedia;

export function getMediaUrl(media: MaybeMedia): string | undefined {
 if (media && typeof media === "object" && "url" in media) {
 let url = media.url;
 if (url) {
 try { return new URL(url).pathname; } catch { return url; }
 }
 }
 return undefined;
}

export async function getHomeContent(): Promise<HomeContent> {
 const payload = await getPayload({ config: configPromise });
 const home = await payload.findGlobal({ slug: "home", depth: 2 });

 const slides: HeroSlideVM[] = (home.hero?.slides ?? []).filter((s) => s.activo !== false).map((s, i) => ({
 id: String(s.id ?? i), etiqueta: s.etiqueta, titulo: s.titulo, texto: s.texto,
 duracion: s.duracion ?? 5000, imagenUrl: getMediaUrl(s.imagen),
 ctaPrincipal: { label: s.ctaPrincipal.label, href: s.ctaPrincipal.href },
 ctaSecundario: s.ctaSecundario?.href && s.ctaSecundario?.label ? { label: s.ctaSecundario.label, href: s.ctaSecundario.href } : undefined,
 }));

 const secciones: SeccionAfiliacionVM[] = (home.afiliacion?.secciones ?? []).map((sec) => ({
 titulo: sec.titulo, items: (sec.items ?? []).map((item) => item.texto),
 }));

 const testimonios: TestimonioVM[] = (home.testimonios ?? []).filter((t) => t.activo !== false).map((t, i) => ({
 id: String(t.id ?? i), nombre: t.nombre, texto: t.texto, puntaje: t.puntaje, fotoUrl: getMediaUrl(t.foto),
 }));

 const redesCrudas = home.contacto?.redes;
 const redesCandidatas = [
 { nombre: "Facebook", url: redesCrudas?.facebook },
 { nombre: "Instagram", url: redesCrudas?.instagram },
 { nombre: "LinkedIn", url: redesCrudas?.linkedin },
 { nombre: "YouTube", url: redesCrudas?.youtube },
 { nombre: "TikTok", url: redesCrudas?.tiktok },
 ];
 const redes: RedSocialVM[] = redesCandidatas.filter((r): r is RedSocialVM => Boolean(r.url && r.url.trim() !== ""));

 return {
 hero: { slides },
 nosotros: { titulo: home.nosotros?.titulo ?? "Nosotros", texto: home.nosotros?.texto ?? "", imagen1Url: getMediaUrl(home.nosotros?.imagen1), imagen2Url: getMediaUrl(home.nosotros?.imagen2) },
 mision: { titulo: home.mision?.titulo ?? "Misión", texto: home.mision?.texto ?? "" },
 vision: { titulo: home.vision?.titulo ?? "Visión", texto: home.vision?.texto ?? "" },
 afiliacion: { titulo: home.afiliacion?.titulo ?? "Afiliación", descripcion: home.afiliacion?.descripcion ?? "", secciones, cta: { label: home.afiliacion?.cta?.label ?? "¿Eres nuevo? Afíliate", href: home.afiliacion?.cta?.href ?? "/register" } },
 queHacemos: { titulo: home.queHacemos?.titulo ?? "Qué hacemos", texto: home.queHacemos?.texto ?? "" },
 testimonios,
 contacto: { titulo: home.contacto?.titulo ?? "Contacto", texto: home.contacto?.texto ?? "", redes },
 };
}
