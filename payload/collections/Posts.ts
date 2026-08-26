// payload/collections/Posts.ts
import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: { useAsTitle: "title" },
  versions: { drafts: true }, // habilita _status: 'draft' | 'published'
  access: {
    read: ({ req }) => {
      if (req.user) return true; // admins ven todo, incluidos drafts
      return { _status: { equals: "published" } }; // público solo ve lo publicado
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "content", type: "richText" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "publishedAt", type: "date" },
  ],
};
