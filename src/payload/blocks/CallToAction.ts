import type { Block } from "payload";

import { blockDesignFields, optionalLinkFields } from "../fields.ts";

export const CallToActionBlock: Block = {
  slug: "callToAction",
  fields: [
    {
      name: "eyebrow",
      type: "text",
    },
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
      name: "primaryLink",
      type: "group",
      fields: optionalLinkFields,
      label: "Primary link",
    },
    ...blockDesignFields({ defaultAlignment: "center" }),
  ],
  labels: {
    plural: "CTA bands",
    singular: "CTA band",
  },
};
