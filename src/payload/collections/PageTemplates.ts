import type { CollectionConfig } from "payload";

import { adminsOnly } from "../access.ts";

export const PageTemplates: CollectionConfig = {
  slug: "page-templates",
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ["name", "handle", "status", "theme", "updatedAt"],
    group: "Theme",
    useAsTitle: "name",
  },
  labels: {
    plural: "Website templates",
    singular: "Website template",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "handle",
      type: "text",
      admin: {
        description: "Short template key used by the whole-site template selector.",
      },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === "string"
              ? value
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
              : value,
        ],
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      index: true,
      options: [
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Draft",
          value: "draft",
        },
      ],
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "theme",
      type: "relationship",
      admin: {
        description: "Default theme to use when this website template is selected.",
      },
      relationTo: "themes",
    },
    {
      name: "builderData",
      type: "json",
      admin: {
        description: "Reusable WYSIWYG layout data used as the starting point for this website template.",
      },
      label: "Builder data",
      required: true,
    },
  ],
};
