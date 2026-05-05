import type { Field } from "payload";

export const statusField: Field = {
  name: "status",
  type: "select",
  defaultValue: "draft",
  index: true,
  options: [
    {
      label: "Draft",
      value: "draft",
    },
    {
      label: "Published",
      value: "published",
    },
  ],
  required: true,
};

export const slugField: Field = {
  name: "slug",
  type: "text",
  admin: {
    description: "Lowercase URL segment. Use letters, numbers and hyphens.",
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
};

export const seoFields: Field = {
  name: "seo",
  type: "group",
  admin: {
    description: "Optional search/social metadata. Leave blank to use the page title and summary.",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "SEO title",
    },
    {
      name: "description",
      type: "textarea",
      label: "SEO description",
      maxLength: 180,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Social image",
    },
  ],
};

export function createLinkFields({ required }: { required: boolean }): Field[] {
  return [
    {
      name: "label",
      type: "text",
      required,
    },
    {
      name: "url",
      type: "text",
      required,
    },
  ];
}

export const linkFields = createLinkFields({ required: true });

export const optionalLinkFields = createLinkFields({ required: false });

export const requiredLinkFields = createLinkFields({ required: true });

export function blockDesignFields({
  defaultAlignment = "left",
  includeColumns = false,
}: {
  defaultAlignment?: "center" | "left";
  includeColumns?: boolean;
} = {}): Field[] {
  return [
    {
      type: "collapsible",
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "backgroundStyle",
          type: "select",
          defaultValue: "default",
          label: "Background",
          options: [
            {
              label: "Default",
              value: "default",
            },
            {
              label: "Panel",
              value: "panel",
            },
            {
              label: "Soft",
              value: "soft",
            },
            {
              label: "Contrast",
              value: "contrast",
            },
          ],
          required: true,
        },
        {
          name: "spacing",
          type: "select",
          defaultValue: "normal",
          label: "Spacing",
          options: [
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
          ],
          required: true,
        },
        {
          name: "alignment",
          type: "select",
          defaultValue: defaultAlignment,
          label: "Text alignment",
          options: [
            {
              label: "Left",
              value: "left",
            },
            {
              label: "Center",
              value: "center",
            },
          ],
          required: true,
        },
        ...(includeColumns
          ? [
              {
                name: "columns",
                type: "select",
                defaultValue: "3",
                label: "Columns",
                options: [
                  {
                    label: "2 columns",
                    value: "2",
                  },
                  {
                    label: "3 columns",
                    value: "3",
                  },
                  {
                    label: "4 columns",
                    value: "4",
                  },
                ],
                required: true,
              } satisfies Field,
            ]
          : []),
      ],
      label: "Design",
    },
  ];
}
