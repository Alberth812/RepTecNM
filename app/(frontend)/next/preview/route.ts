// app/next/preview/route.ts
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload/getPayloadClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const path = searchParams.get("path");
  const collection = searchParams.get("collection");
  const slug = searchParams.get("slug");
  const previewSecret = searchParams.get("previewSecret");

  if (previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response("Secreto de preview inválido.", { status: 403 });
  }

  if (!path || !collection || !slug) {
    return new Response("Faltan parámetros para el preview.", { status: 404 });
  }

  if (!path.startsWith("/")) {
    return new Response("El path debe ser una ruta relativa.", { status: 400 });
  }

  const payload = await getPayloadClient();

  let isAuthorized = false;
  try {
    const { user } = await payload.auth({ headers: request.headers });
    isAuthorized = Boolean(user);
  } catch (error) {
    payload.logger.error(
      { err: error },
      "Error verificando sesión para preview",
    );
  }

  const draft = await draftMode();

  if (!isAuthorized) {
    draft.disable();
    return new Response("No tienes permiso para ver este preview.", {
      status: 403,
    });
  }

  draft.enable();
  redirect(path);
}
