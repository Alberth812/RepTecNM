// payload/collections/CmsAdmins.ts
import type { CollectionConfig } from "payload";
import { betterAuthStrategy } from "../auth/betterAuthStrategy";

export const CmsAdmins: CollectionConfig = {
  slug: "cms-admins",
  auth: {
    disableLocalStrategy: true, // sin passwords propios, sin login local de Payload
    strategies: [betterAuthStrategy],
  },
  admin: {
    useAsTitle: "email",
    hidden: true, // es un espejo interno, no algo que un editor deba tocar a mano
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false, // solo la strategy escribe aquí (Local API bypassa access control)
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "betterAuthUserId",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    { name: "email", type: "text", required: true },
    { name: "name", type: "text" },
    {
      name: "subtype",
      type: "select",
      options: ["GENERAL", "CONTENIDO"],
      required: true,
    },
    { name: "isRoot", type: "checkbox", defaultValue: false },
  ],
};
