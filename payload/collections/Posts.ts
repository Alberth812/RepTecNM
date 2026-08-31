import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { lexicalEditor, BlocksFeature } from "@payloadcms/richtext-lexical";

import { MediaBlock } from "./blocks/MediaBlock";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "slug"],
    // Live Preview a nivel de collection. Se puede definir también a nivel
    // raíz (admin.livePreview en payload.config.ts) — la de la collection
    // sobreescribe/mergea sobre esa. Con esto solo, ya es suficiente.
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_APP_URL}/posts/${data?.slug ?? ""}`,
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          'Imagen principal del post. Solo se permiten imágenes (restringido a nivel de la collection "media").',
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          // defaultFeatures ya incluye: headings, listas, links, bold/italic,
          // blockquote, etc. — el "formato normal de Lexical" que pediste.
          ...defaultFeatures,
          BlocksFeature({ blocks: [MediaBlock] }),
        ],
      }),
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date(),
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
        },
        description: "No puede ser una fecha futura.",
      },
      validate: (value: unknown, { req }) => {
        if (!value) {
          return req.t
            ? req.t("validation:required")
            : "Este campo es obligatorio.";
        }

        const publishedAt = new Date(value as string);

        if (Number.isNaN(publishedAt.getTime())) {
          return "La fecha proporcionada no es válida.";
        }

        // Comparamos contra el final del día de HOY en UTC, no contra
        // `new Date()` sin más: así una fecha "hoy" válida no se rechaza
        // por el offset de timezone de quien esté editando.
        const now = new Date();
        const endOfTodayUTC = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            23,
            59,
            59,
            999,
          ),
        );

        if (publishedAt.getTime() > endOfTodayUTC.getTime()) {
          return "La fecha de publicación no puede ser posterior al día de hoy.";
        }

        return true;
      },
    },
    slugField(),
  ],
};
