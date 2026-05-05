import type { CollectionConfig } from "payload";

import { adminsOnly } from "../access.ts";

const scopeOptions = [
  {
    label: "Whole new site",
    value: "global",
  },
  {
    label: "One theme",
    value: "theme",
  },
  {
    label: "One page",
    value: "page",
  },
];

export const CodeSnippets: CollectionConfig = {
  slug: "code-snippets",
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ["title", "scope", "status", "priority", "updatedAt"],
    hidden: true,
    useAsTitle: "title",
  },
  labels: {
    plural: "Custom CSS",
    singular: "CSS snippet",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "handle",
      type: "text",
      admin: {
        description: "Short internal key, for example product-card-css.",
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
      defaultValue: "draft",
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
      name: "scope",
      type: "select",
      admin: {
        description: "Choose where this CSS is allowed to run.",
      },
      defaultValue: "global",
      index: true,
      options: scopeOptions,
      required: true,
    },
    {
      name: "theme",
      type: "relationship",
      admin: {
        condition: (_, siblingData) => siblingData.scope === "theme",
        description: "Only used when the scope is One theme.",
      },
      relationTo: "themes",
    },
    {
      name: "page",
      type: "relationship",
      admin: {
        condition: (_, siblingData) => siblingData.scope === "page",
        description: "Only used when the scope is One page.",
      },
      relationTo: "pages",
    },
    {
      name: "priority",
      type: "number",
      admin: {
        description: "Lower numbers load first. Use this when one snippet needs to override another.",
      },
      defaultValue: 100,
      index: true,
      required: true,
    },
    {
      name: "css",
      type: "code",
      admin: {
        description: "Custom CSS for the new Payload site. JavaScript is intentionally not supported here.",
        editorOptions: {
          minimap: {
            enabled: false,
          },
          tabSize: 2,
          wordWrap: "on",
        },
        language: "css",
      },
      label: "CSS",
      required: true,
    },
    {
      name: "notes",
      type: "textarea",
      admin: {
        description: "Internal note explaining what this snippet changes.",
      },
    },
  ],
};
