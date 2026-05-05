import type { Block } from "payload";

import { blockDesignFields, optionalLinkFields } from "../fields.ts";

export const HeroBlock: Block = {
  slug: "hero",
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
      name: "lede",
      type: "textarea",
      label: "Lead text",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "primaryLink",
      type: "group",
      fields: optionalLinkFields,
      label: "Primary link",
    },
    {
      name: "secondaryLink",
      type: "group",
      fields: optionalLinkFields,
      label: "Secondary link",
    },
    ...blockDesignFields(),
  ],
  labels: {
    plural: "Heroes",
    singular: "Hero",
  },
};
