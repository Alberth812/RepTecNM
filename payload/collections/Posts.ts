import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import {
  lexicalEditor,
  BlocksFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  HeadingFeature,
  AlignFeature,
  IndentFeature,
  OrderedListFeature,
  UnorderedListFeature,
  ChecklistFeature,
  LinkFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  FixedToolbarFeature,
} from "@payloadcms/richtext-lexical";

import { MediaBlock } from "./blocks/MediaBlock";
import { generatePreviewPath } from "../utilities/generatePreviewPath";
import { authenticatedOrPublished } from "../utilities/authenticatedOrPublished";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "slug"],
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          collection: "posts",
          slug: typeof data?.slug === "string" ? data.slug : "",
        }),
    },
    preview: (data) =>
      generatePreviewPath({
        collection: "posts",
        slug: typeof data?.slug === "string" ? data.slug : "",
      }),
  },
  access: {
    read: authenticatedOrPublished,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: {
        es: "Título",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      required: true,
      label: {
        es: "Imagen principal",
      },
      admin: {
        description: "Imagen principal del post mostrada como imagen de fondo.",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures, rootFeatures }) => [
          // defaultFeatures ya incluye: headings, listas, links, bold/italic,
          // blockquote, etc. — el "formato normal de Lexical" que pediste.
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          HeadingFeature(),
          AlignFeature(),
          IndentFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          ChecklistFeature(),
          LinkFeature(),
          BlockquoteFeature(),
          HorizontalRuleFeature(),
          BlocksFeature({
            blocks: [MediaBlock],
          }),
          InlineToolbarFeature(),
          FixedToolbarFeature(),
        ],
      }),
      label: {
        es: "Contenido",
      },
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
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === "published" && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    slugField(),
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
    },
    maxPerDoc: 10,
  },
};
