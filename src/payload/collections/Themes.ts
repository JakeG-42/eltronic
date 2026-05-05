import type { CollectionConfig } from "payload";

import { adminsOnly } from "../access.ts";

const fontOptions = [
  {
    label: "Display",
    value: "display",
  },
  {
    label: "Sans",
    value: "sans",
  },
  {
    label: "Technical code",
    value: "code",
  },
];

const spacingOptions = [
  {
    label: "Compact",
    value: "compact",
  },
  {
    label: "Normal",
    value: "normal",
  },
  {
    label: "Spacious",
    value: "spacious",
  },
];

export const Themes: CollectionConfig = {
  slug: "themes",
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ["name", "handle", "status", "isDefault", "updatedAt"],
    group: "Theme",
    useAsTitle: "name",
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
        description: "Short theme key used by the WYSIWYG editor.",
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
      name: "isDefault",
      type: "checkbox",
      admin: {
        description: "Used when a page does not have a theme selected.",
      },
      defaultValue: false,
      label: "Default theme",
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "colors",
      type: "group",
      fields: [
        {
          name: "backgroundColor",
          type: "text",
          defaultValue: "#020617",
          label: "Page background",
          required: true,
        },
        {
          name: "textColor",
          type: "text",
          defaultValue: "#f1f5f9",
          label: "Text colour",
          required: true,
        },
        {
          name: "accentColor",
          type: "text",
          defaultValue: "#8bd3ff",
          label: "Accent colour",
          required: true,
        },
        {
          name: "surfaceColor",
          type: "text",
          admin: {
            description: "RGB values, for example: 23, 32, 51.",
          },
          defaultValue: "23, 32, 51",
          label: "Surface RGB",
          required: true,
        },
        {
          name: "surfaceOpacity",
          type: "number",
          defaultValue: 0.78,
          max: 1,
          min: 0.2,
          required: true,
        },
      ],
    },
    {
      name: "typography",
      type: "group",
      fields: [
        {
          name: "fontFamily",
          type: "select",
          defaultValue: "display",
          label: "Base font",
          options: fontOptions,
          required: true,
        },
      ],
    },
    {
      name: "layout",
      type: "group",
      fields: [
        {
          name: "sectionSpacing",
          type: "select",
          defaultValue: "normal",
          label: "Section spacing",
          options: spacingOptions,
          required: true,
        },
      ],
    },
  ],
};
