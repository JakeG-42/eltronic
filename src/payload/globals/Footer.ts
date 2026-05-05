import type { GlobalConfig } from "payload";

import { adminsOnly } from "../access.ts";
import { linkFields } from "../fields.ts";

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: () => true,
    update: adminsOnly,
  },
  admin: {
    hidden: true,
    group: "Settings",
  },
  fields: [
    {
      name: "intro",
      type: "textarea",
      label: "Footer intro",
    },
    {
      name: "linkGroups",
      type: "array",
      fields: [
        {
          name: "heading",
          type: "text",
          required: true,
        },
        {
          name: "links",
          type: "array",
          fields: linkFields,
        },
      ],
      label: "Link groups",
    },
    {
      name: "legalLinks",
      type: "array",
      fields: linkFields,
      label: "Legal links",
    },
  ],
};
