// payload/fields/slug.ts (solo si tu versión no exporta slugField desde 'payload')
import type { Field, FieldHook } from "payload";

const formatSlug: FieldHook = ({ value, data }) =>
  typeof value === "string" && value.length > 0
    ? value
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "")
    : (data?.title ?? "")
        .toString()
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

export const slugField = (fieldToUse = "title"): Field => ({
  name: "slug",
  type: "text",
  index: true,
  unique: true,
  admin: { position: "sidebar" },
  hooks: { beforeValidate: [formatSlug] },
});
