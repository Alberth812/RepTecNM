// payload.config.ts
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import { CmsAdmins } from "./payload/collections/CmsAdmins";
import { Media } from "./payload/collections/Media";
import { Posts } from "./payload/collections/Posts";

import { es } from "@payloadcms/translations/languages/es";
import { Avisos } from "./payload/collections/Avisos";
import Home from "./payload/globals/home";
import LoginConfig from "./payload/globals/LoginConfig";

//const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  serverURL: process.env.PAYLOAD_SERVER_URL,

  editor: lexicalEditor(),

  collections: [CmsAdmins, Posts, Media, Avisos],

  globals: [Home, LoginConfig],

  localization: {
    locales: ["es"],
    defaultLocale: "es",
  },

  i18n: {
    supportedLanguages: {
      es,
    },
    fallbackLanguage: "es",
  },

  admin: {
    user: CmsAdmins.slug, // evita que Payload cree su propio "users"
  },

  // Rutas raíz: por defecto Payload usa /admin y /api.
  // Usamos contenido-api para no interferir con la API de backend
  routes: {
    admin: "/contenido",
    api: "/contenido-api",
  },

  // No usamos GraphQL en esta primera prueba: menos superficie, menos rutas.
  graphQL: { disable: true },

  db: mongooseAdapter({
    // Mongoose-specific arguments go here.
    // URL is required.
    url: process.env.DATABASE_URI!,
  }),

  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_CMS_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_CMS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_CMS_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_INTERNAL_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],

  sharp,
});
