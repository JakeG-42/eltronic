import type { Block } from "payload";

import { blockDesignFields, optionalLinkFields } from "../fields.ts";

export const CardGridBlock: Block = {
  slug: "cardGrid",
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
    },
    {
      name: "intro",
      type: "textarea",
    },
    {
      name: "cards",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "body",
          type: "textarea",
        },
        {
          name: "link",
          type: "group",
          fields: optionalLinkFields,
        },
      ],
      minRows: 1,
    },
    ...blockDesignFields({ includeColumns: true }),
  ],
  labels: {
    plural: "Card grids",
    singular: "Card grid",
  },
};
