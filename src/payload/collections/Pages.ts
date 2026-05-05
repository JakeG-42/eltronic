import type { Access, CollectionConfig } from "payload";

const authenticated: Access = ({ req }) => Boolean(req.user);

const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) {
    return true;
  }

  return {
    status: {
      equals: "published",
    },
  };
};

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["title", "slug", "status", "updatedAt"],
    group: "Content",
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      admin: {
        description: "Use home for the first Payload-backed /v2 page.",
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
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
    },
    {
      name: "heroHeading",
      type: "text",
      label: "Hero heading",
    },
    {
      name: "body",
      type: "textarea",
    },
  ],
};
