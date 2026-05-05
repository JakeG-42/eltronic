import type { Payload } from "payload";

import type { BuilderMenu, BuilderMenuItem, BuilderProduct } from "./types";

type LinkLike = {
  label?: unknown;
  url?: unknown;
};

function normalizeMenuItems(items: unknown): BuilderMenuItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item): BuilderMenuItem | null => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const link = item as LinkLike;
      const label = typeof link.label === "string" ? link.label.trim() : "";
      const url = typeof link.url === "string" ? link.url.trim() : "";

      return label && url ? { label, url } : null;
    })
    .filter((item): item is BuilderMenuItem => Boolean(item));
}

function normalizeHandle(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const handle = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return handle || fallback;
}

function uniqueMenus(menus: BuilderMenu[]) {
  const seen = new Set<string>();

  return menus.filter((menu) => {
    if (seen.has(menu.handle)) {
      return false;
    }

    seen.add(menu.handle);
    return true;
  });
}

export async function getBuilderMenus(payload: Payload): Promise<BuilderMenu[]> {
  const menus: BuilderMenu[] = [];

  try {
    const navigation = await payload.findGlobal({
      depth: 0,
      slug: "navigation",
    });

    menus.push(
      {
        handle: "primary",
        items: normalizeMenuItems(navigation.primary),
        title: "Primary navigation",
      },
      {
        handle: "utility",
        items: normalizeMenuItems(navigation.utility),
        title: "Utility navigation",
      },
    );
  } catch (error) {
    console.error("Unable to load Payload navigation menus.", error);
  }

  try {
    const result = await payload.find({
      collection: "menus",
      depth: 0,
      limit: 50,
      sort: "name",
    });

    for (const menu of result.docs) {
      menus.push({
        handle: normalizeHandle(menu.handle, String(menu.id)),
        items: normalizeMenuItems(menu.items),
        title: menu.name || menu.handle || "Menu",
      });
    }
  } catch (error) {
    console.error("Unable to load custom Payload menus.", error);
  }

  return uniqueMenus(menus).length
    ? uniqueMenus(menus)
    : [
        {
          handle: "primary",
          items: [],
          title: "Primary navigation",
        },
      ];
}

export function productsToBuilderProducts(products: BuilderProduct[]): BuilderProduct[] {
  return products.map((product) => ({
    family: product.family,
    name: product.name,
    slug: product.slug,
    summary: product.summary,
  }));
}
