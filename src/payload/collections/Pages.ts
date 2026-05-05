import type { CollectionConfig } from "payload";

import { adminsOnly, publishedOrAdmin } from "../access.ts";
import { pageBlocks } from "../blocks/index.ts";
import { seoFields, slugField, statusField } from "../fields.ts";

function getNewSiteUrl() {
  return (process.env.NEXT_PUBLIC_NEW_SITE_URL ?? "https://new.eltronic.co.uk").replace(/\/+$/, "");
}

function getPreviewPath(slug: unknown) {
  return typeof slug === "string" && slug !== "home" ? `/${slug}` : "/";
}

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publishedOrAdmin,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ["title", "slug", "status", "updatedAt"],
    group: "Content",
    preview: (doc) => `${getNewSiteUrl()}${getPreviewPath(doc.slug)}`,
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField,
    {
      name: "summary",
      type: "textarea",
      admin: {
        description: "Short internal/search summary.",
      },
    },
    statusField,
    {
      name: "layout",
      type: "blocks",
      blocks: pageBlocks,
      required: true,
    },
    seoFields,
  ],
};
