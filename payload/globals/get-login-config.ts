import { getPayload } from "payload";
import configPromise from "@payload-config";

type PopulatedMedia = { url?: string | null } | null | undefined;
type MaybeMedia = string | number | PopulatedMedia;

function getMediaUrl(media: MaybeMedia): string | undefined {
 if (media && typeof media === "object" && "url" in media) {
 let url = media.url;
 if (url) {
 try { return new URL(url).pathname; } catch { return url; }
 }
 }
 return undefined;
}

export async function getLoginConfig(): Promise<{ imagenFondoUrl?: string }> {
 const payload = await getPayload({ config: configPromise });
 const config = await payload.findGlobal({ slug: "login-config", depth: 2 });
 
 return {
 imagenFondoUrl: getMediaUrl(config?.imagenFondo),
 };
}
