import type { Block } from "payload";

import { blockDesignFields } from "../fields.ts";

export const GalleryBlock: Block = {
  slug: "gallery",
  fields: [
    {
      name: "heading",
      type: "text",
    },
    {
      name: "images",
      type: "upload",
      hasMany: true,
      relationTo: "media",
      required: true,
    },
    ...blockDesignFields({ includeColumns: true }),
  ],
  labels: {
    plural: "Galleries",
    singular: "Gallery",
  },
};
