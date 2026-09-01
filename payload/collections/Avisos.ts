// payload/collections/Avisos.ts
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

export const Avisos: CollectionConfig = {
  slug: "avisos",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "important", "expiresAt", "publishedAt", "slug"],
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          collection: "avisos",
          slug: typeof data?.slug === "string" ? data.slug : "",
        }),
    },
    preview: (data) =>
      generatePreviewPath({
        collection: "avisos",
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
      name: "important",
      type: "checkbox",
      defaultValue: false,
      index: true,
      label: {
        es: "Es importante",
      },
      admin: {
        position: "sidebar",
        description:
          "Si está activado, este aviso se mostrará en un modal en la landing mientras no haya expirado.",
      },
    },
    {
      name: "expiresAt",
      type: "date",
      index: true,
      label: {
        es: "Fecha de expiración",
      },
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
        },
        // Solo se muestra en el admin cuando "important" está activado.
        condition: (_, siblingData) => Boolean(siblingData?.important),
        description:
          "Obligatoria cuando 'Es importante' está activado. Debe ser entre mañana y 365 días a partir de hoy.",
      },
      // Requerido condicionalmente: no usamos `required: true` a nivel de
      // campo porque solo debe exigirse cuando `important` es true.
      validate: (value: unknown, { siblingData }) => {
        const isImportant = Boolean(
          (siblingData as { important?: boolean } | undefined)?.important,
        );

        if (!isImportant) {
          return true;
        }

        if (!value) {
          return "La fecha de expiración es obligatoria cuando 'Es importante' está activado.";
        }

        const expiresAt = new Date(value as string);

        if (Number.isNaN(expiresAt.getTime())) {
          return "La fecha proporcionada no es válida.";
        }

        const now = new Date();

        // Límite inferior: inicio de "mañana" en UTC (estrictamente
        // posterior a hoy).
        const startOfTomorrowUTC = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1,
            0,
            0,
            0,
            0,
          ),
        );

        // Límite superior: final del día, 365 días a partir de hoy.
        const maxDateUTC = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 365,
            23,
            59,
            59,
            999,
          ),
        );

        if (expiresAt.getTime() < startOfTomorrowUTC.getTime()) {
          return "La fecha de expiración debe ser posterior al día de hoy.";
        }

        if (expiresAt.getTime() > maxDateUTC.getTime()) {
          return "La fecha de expiración no puede ser mayor a 365 días a partir de hoy.";
        }

        return true;
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            // Si no es importante, no tiene sentido guardar una fecha de
            // expiración obsoleta: la limpiamos.
            if (!siblingData?.important) {
              return null;
            }
            return value;
          },
        ],
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
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
    },
    maxPerDoc: 10,
  },
};