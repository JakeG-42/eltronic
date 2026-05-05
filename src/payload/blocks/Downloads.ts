import type { Block } from "payload";

import { blockDesignFields } from "../fields.ts";

export const DownloadsBlock: Block = {
  slug: "downloads",
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
    },
    {
      name: "documents",
      type: "relationship",
      hasMany: true,
      relationTo: "documents",
    },
    ...blockDesignFields({ includeColumns: true }),
  ],
  labels: {
    plural: "Download sections",
    singular: "Download section",
  },
};
