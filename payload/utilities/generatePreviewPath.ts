// lib/payload/generatePreviewPath.ts
import type { CollectionSlug } from "payload";

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: "/posts",
  // avisos: "/avisos", // cuando la añadas
};

type Args = {
  collection: keyof typeof collectionPrefixMap;
  slug: string;
};

export function generatePreviewPath({ collection, slug }: Args) {
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: `${collectionPrefixMap[collection]}/${slug}`,
    previewSecret: process.env.PREVIEW_SECRET ?? "",
  });

  return `${process.env.NEXT_PUBLIC_APP_URL}/next/preview?${encodedParams.toString()}`;
}
