import type { CollectionConfig } from "payload";

export const ConsoleUsers: CollectionConfig = {
  slug: "console-users",
  auth: true,
  admin: {
    defaultColumns: ["email", "name", "role", "updatedAt"],
    group: "Console",
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      defaultValue: "editor",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "Editor",
          value: "editor",
        },
      ],
      required: true,
    },
  ],
};
