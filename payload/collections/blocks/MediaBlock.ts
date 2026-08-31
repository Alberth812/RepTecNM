import type { Block } from "payload";

export const MediaBlock: Block = {
  slug: "mediaBlock",
  interfaceName: "MediaBlock",
  labels: {
    singular: "Bloque de imagen",
    plural: "Bloques de imagen",
  },
  fields: [
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      required: true,
      // No hace falta filterOptions/mimeType extra: la collection "media"
      // ya solo contiene imágenes.
    },
  ],
};
