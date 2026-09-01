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

const MEXICO_TIME_ZONE = "America/Mexico_City";

function getMexicoToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const Notices: CollectionConfig = {
  slug: "notices",

  admin: {
    useAsTitle: "title",

    defaultColumns: [
      "title",
      "isImportant",
      "publishedAt",
      "expirationDate",
      "slug",
    ],

    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          collection: "notices",
          slug: typeof data?.slug === "string" ? data.slug : "",
        }),
    },

    preview: (data) =>
      generatePreviewPath({
        collection: "notices",
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
      name: "isImportant",
      type: "checkbox",
      defaultValue: false,
      label: {
        es: "Es importante",
      },
      admin: {
        description:
          "Los avisos importantes y vigentes se mostrarán automáticamente en la página principal.",
      },
    },

    {
      name: "expirationDate",
      type: "date",
      label: {
        es: "Fecha de expiración",
      },
      admin: {
        position: "sidebar",

        date: {
          pickerAppearance: "dayOnly",
        },

        condition: (_, siblingData) => Boolean(siblingData?.isImportant),

        description:
          "Debe ser posterior a hoy y como máximo 365 días después de hoy.",
      },

      validate: (value: unknown, { siblingData, req }) => {
        // Casteamos siblingData para que TypeScript reconozca la propiedad
        const sibling = siblingData as { isImportant?: boolean };
        const isImportant = Boolean(sibling?.isImportant);

        // Si no es importante, la fecha no es necesaria.
        if (!isImportant) {
          return true;
        }

        if (!value) {
          return req.t
            ? req.t("validation:required")
            : "La fecha de expiración es obligatoria cuando el aviso es importante.";
        }

        const expirationDate = new Date(value as string);

        if (Number.isNaN(expirationDate.getTime())) {
          return "La fecha de expiración proporcionada no es válida.";
        }

        const today = getMexicoToday();

        const expirationDateOnly = new Intl.DateTimeFormat("en-CA", {
          timeZone: MEXICO_TIME_ZONE,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(expirationDate);

        if (expirationDateOnly <= today) {
          return "La fecha de expiración debe ser posterior al día de hoy.";
        }

        const todayDate = new Date(`${today}T00:00:00Z`);

        const maxDate = new Date(todayDate);
        maxDate.setUTCDate(maxDate.getUTCDate() + 365);

        const maxDateOnly = maxDate.toISOString().slice(0, 10);

        if (expirationDateOnly > maxDateOnly) {
          return "La fecha de expiración no puede superar 365 días a partir de hoy.";
        }

        return true;
      },
    },

    {
      name: "content",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures, rootFeatures }) => [
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

  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data?.isImportant) {
          data.expirationDate = null;
        }

        return data;
      },
    ],
  },

  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
    },
    maxPerDoc: 10,
  },
};