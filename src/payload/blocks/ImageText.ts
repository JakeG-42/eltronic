import type { Block } from "payload";

import { blockDesignFields, optionalLinkFields } from "../fields.ts";

export const ImageTextBlock: Block = {
  slug: "imageText",
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
    },
    {
      name: "body",
      type: "textarea",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "imageSide",
      type: "select",
      defaultValue: "right",
      options: [
        {
          label: "Left",
          value: "left",
        },
        {
          label: "Right",
          value: "right",
        },
      ],
      required: true,
    },
    {
      name: "link",
      type: "group",
      fields: optionalLinkFields,
    },
    ...blockDesignFields(),
  ],
  labels: {
    plural: "Image text sections",
    singular: "Image text section",
  },
};
