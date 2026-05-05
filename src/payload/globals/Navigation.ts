import type { GlobalConfig } from "payload";

import { adminsOnly } from "../access.ts";
import { linkFields } from "../fields.ts";

export const Navigation: GlobalConfig = {
  slug: "navigation",
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
      name: "primary",
      type: "array",
      fields: linkFields,
      label: "Primary navigation",
    },
    {
      name: "utility",
      type: "array",
      fields: linkFields,
      label: "Utility navigation",
    },
  ],
};
