import type { GlobalConfig } from "payload";

import { adminsOnly } from "../access.ts";

export const ThemeSettings: GlobalConfig = {
  slug: "theme-settings",
  access: {
    read: () => true,
    update: adminsOnly,
  },
  admin: {
    group: "Theme",
  },
  fields: [
    {
      name: "activeTemplate",
      type: "relationship",
      admin: {
        description: "The active whole-website template for the new Payload-built Eltronic site.",
      },
      label: "Active website template",
      relationTo: "page-templates",
    },
    {
      name: "activeTheme",
      type: "relationship",
      admin: {
        description: "The default visual theme used when a page does not have its own override.",
      },
      label: "Active theme",
      relationTo: "themes",
    },
  ],
};
