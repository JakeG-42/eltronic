import type { Block } from "payload";

import { blockDesignFields } from "../fields.ts";

export const RichTextBlock: Block = {
  slug: "richText",
  fields: [
    {
      name: "content",
      type: "richText",
      required: true,
    },
    ...blockDesignFields(),
  ],
  labels: {
    plural: "Rich text sections",
    singular: "Rich text section",
  },
};
