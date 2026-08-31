import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Lectura pública: el frontend necesita poder resolver las imágenes
    // (vía la API de Payload o directamente desde S3).
    read: () => true,
    // Escritura solo para editores autenticados vía la Better Auth strategy
    // (req.user solo existe si betterAuthStrategy.authenticate devolvió un usuario).
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    // No tocamos el storage: el plugin s3Storage ya configurado en payload.config.ts
    // con collections: { media: true } se engancha solo porque esta collection
    // tiene `upload` habilitado. Esto SOLO restringe el picker/validación de archivos.
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      admin: {
        description: "Texto alternativo (accesibilidad / SEO).",
      },
    },
  ],
};
