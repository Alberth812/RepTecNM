// payload/collections/Media.ts
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  upload: true, // habilita subida de archivos; con el plugin s3Storage se sube a Garage
  admin: { useAsTitle: "filename" },
  access: {
    read: () => true, // asunción: media es de lectura pública, como en cualquier blog
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [{ name: "alt", type: "text" }],
};
