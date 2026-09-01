import configPromise from "@payload-config";
import { getPayload } from "payload";
import { draftMode } from "next/headers";
import { cache } from "react";

export const queryPostBySlug = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({
    config: configPromise,
  });

  const result = await payload.find({
    collection: "posts",

    where: {
      slug: {
        equals: slug,
      },
    },

    draft,

    // Permite leer drafts únicamente desde Draft Mode.
    overrideAccess: draft,

    limit: 1,

    // Ajusta esto según las relaciones que realmente necesites.
    depth: 1,
  });

  return result.docs[0] ?? null;
});
