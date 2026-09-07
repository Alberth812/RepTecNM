// @/payload/collections/Media.ts
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  folders: false,
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
    bulkUpload: false,
    imageSizes: [
      {
        name: "thumbnail",
        width: 300,
      },
      {
        name: "square",
        width: 500,
        height: 500,
      },
      {
        name: "small",
        width: 600,
      },
      {
        name: "medium",
        width: 900,
      },
      {
        name: "large",
        width: 1400,
      },
      {
        name: "xlarge",
        width: 1920,
      },
      {
        name: "og",
        width: 1200,
        height: 630,
        crop: "center",
      },
    ],
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
