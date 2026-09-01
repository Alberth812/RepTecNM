// payload/queries/avisos.ts
import { cache } from "react";
import { draftMode } from "next/headers";
import { getPayloadClient } from "@/lib/payload/getPayloadClient";
import type { Aviso } from "@/payload-types";

export const queryAvisoBySlug = cache(
  async (slug: string): Promise<Aviso | null> => {
    const { isEnabled: draft } = await draftMode();
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: "avisos",
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    return result.docs?.[0] ?? null;
  },
);

// Para la landing: avisos importantes y todavía no expirados.
export async function queryAvisosImportantesActivos(): Promise<Aviso[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "avisos",
    draft: false,
    pagination: false,
    overrideAccess: true, // ya filtramos explícitamente lo publicable abajo
    sort: "-publishedAt",
    where: {
      and: [
        { important: { equals: true } },
        { expiresAt: { greater_than: new Date().toISOString() } },
      ],
    },
  });

  return result.docs;
}