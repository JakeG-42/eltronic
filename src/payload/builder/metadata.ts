import type { Payload } from "payload";

import { normalizeBuilderData } from "./convert";
import type {
  BuilderData,
  BuilderMenu,
  BuilderMenuItem,
  BuilderPageTemplate,
  BuilderProduct,
  BuilderRootProps,
  BuilderTheme,
  BuilderThemeSettings,
} from "./types";

type LinkLike = {
  label?: unknown;
  url?: unknown;
};

type UnknownRecord = Record<string, unknown>;

export const fallbackBuilderThemes: BuilderTheme[] = [
  {
    description: "Current Eltronic dark visual language for the Payload-built site.",
    handle: "eltronic-dark",
    id: "eltronic-dark",
    isDefault: true,
    name: "Eltronic Dark",
    rootProps: {
      accentColor: "#8bd3ff",
      backgroundColor: "#020617",
      fontFamily: "display",
      sectionSpacing: "normal",
      surfaceColor: "23, 32, 51",
      surfaceOpacity: 0.78,
      textColor: "#f1f5f9",
      themeHandle: "eltronic-dark",
      themeId: "eltronic-dark",
      themeName: "Eltronic Dark",
      themePreset: "eltronicDark",
    },
  },
  {
    description: "A lighter, editorial starter theme for testing new layouts.",
    handle: "signal-light",
    id: "signal-light",
    name: "Signal Light",
    rootProps: {
      accentColor: "#0f766e",
      backgroundColor: "#f7f8fb",
      fontFamily: "sans",
      sectionSpacing: "spacious",
      surfaceColor: "255, 255, 255",
      surfaceOpacity: 0.92,
      textColor: "#102033",
      themeHandle: "signal-light",
      themeId: "signal-light",
      themeName: "Signal Light",
      themePreset: "precisionLight",
    },
  },
];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function relationId(value: unknown) {
  if (typeof value === "number" || typeof value === "string") {
    return String(value);
  }

  if (isRecord(value) && (typeof value.id === "number" || typeof value.id === "string")) {
    return String(value.id);
  }

  return "";
}

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

function uniqueThemes(themes: BuilderTheme[]) {
  const seen = new Set<string>();

  return themes.filter((theme) => {
    if (seen.has(theme.id)) {
      return false;
    }

    seen.add(theme.id);
    return true;
  });
}

function themeRootProps(theme: UnknownRecord, id: string, name: string, handle: string): Partial<BuilderRootProps> {
  const colors = isRecord(theme.colors) ? theme.colors : {};
  const typography = isRecord(theme.typography) ? theme.typography : {};
  const layout = isRecord(theme.layout) ? theme.layout : {};

  return {
    accentColor: asString(colors.accentColor, "#8bd3ff"),
    backgroundColor: asString(colors.backgroundColor, "#020617"),
    fontFamily: asString(typography.fontFamily, "display") as BuilderRootProps["fontFamily"],
    sectionSpacing: asString(layout.sectionSpacing, "normal") as BuilderRootProps["sectionSpacing"],
    surfaceColor: asString(colors.surfaceColor, "23, 32, 51"),
    surfaceOpacity: asNumber(colors.surfaceOpacity, 0.78),
    textColor: asString(colors.textColor, "#f1f5f9"),
    themeHandle: handle,
    themeId: id,
    themeName: name,
    themePreset: handle === "signal-light" ? "precisionLight" : "eltronicDark",
  };
}

function normalizeTheme(theme: unknown): BuilderTheme | null {
  if (!isRecord(theme)) {
    return null;
  }

  const id = relationId(theme.id);
  const name = asString(theme.name, "Theme");
  const handle = normalizeHandle(theme.handle, id || name);

  if (!id || !handle) {
    return null;
  }

  return {
    description: asString(theme.description),
    handle,
    id,
    isDefault: asBoolean(theme.isDefault),
    name,
    rootProps: themeRootProps(theme, id, name, handle),
  };
}

function normalizeTemplate(template: unknown): BuilderPageTemplate | null {
  if (!isRecord(template)) {
    return null;
  }

  const id = relationId(template.id);
  const name = asString(template.name, "Page template");
  const handle = normalizeHandle(template.handle, id || name);

  if (!id || !handle) {
    return null;
  }

  return {
    builderData: normalizeBuilderData(template.builderData),
    description: asString(template.description),
    handle,
    id,
    name,
    themeId: relationId(template.theme),
  };
}

export function getDefaultBuilderTheme(themes: BuilderTheme[] = fallbackBuilderThemes) {
  return themes.find((theme) => theme.isDefault) ?? themes[0] ?? fallbackBuilderThemes[0];
}

export function getPageBuilderTheme(page: unknown, themes: BuilderTheme[] = fallbackBuilderThemes, fallbackThemeId = "") {
  const pageThemeId = isRecord(page) ? relationId(page.theme) : "";

  return themes.find((theme) => theme.id === pageThemeId) ?? themes.find((theme) => theme.id === fallbackThemeId) ?? getDefaultBuilderTheme(themes);
}

export function applyThemeToBuilderData(data: BuilderData, theme: BuilderTheme = getDefaultBuilderTheme()) {
  const existingRootProps = isRecord(data.root?.props) ? data.root.props : {};

  return {
    ...data,
    root: {
      ...data.root,
      props: {
        ...existingRootProps,
        ...theme.rootProps,
        pageTitle: asString(existingRootProps.pageTitle, asString(theme.rootProps.pageTitle, "New Eltronic page")),
      },
    },
  } as BuilderData;
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

export async function getBuilderThemes(payload: Payload): Promise<BuilderTheme[]> {
  try {
    const result = await payload.find({
      collection: "themes",
      depth: 0,
      limit: 50,
      sort: "-isDefault",
      where: {
        status: {
          equals: "active",
        },
      },
    });

    const themes = uniqueThemes(result.docs.map(normalizeTheme).filter((theme): theme is BuilderTheme => Boolean(theme)));

    return themes.length ? themes : fallbackBuilderThemes;
  } catch (error) {
    console.error("Unable to load Payload themes.", error);
    return fallbackBuilderThemes;
  }
}

export async function getBuilderPageTemplates(payload: Payload): Promise<BuilderPageTemplate[]> {
  try {
    const result = await payload.find({
      collection: "page-templates",
      depth: 1,
      limit: 50,
      sort: "name",
      where: {
        status: {
          equals: "active",
        },
      },
    });

    return result.docs.map(normalizeTemplate).filter((template): template is BuilderPageTemplate => Boolean(template));
  } catch (error) {
    console.error("Unable to load Payload page templates.", error);
    return [];
  }
}

export async function getBuilderThemeSettings(payload: Payload): Promise<BuilderThemeSettings> {
  try {
    const settings = await payload.findGlobal({
      depth: 1,
      slug: "theme-settings",
    });

    return {
      templateId: relationId(isRecord(settings) ? settings.activeTemplate : ""),
      themeId: relationId(isRecord(settings) ? settings.activeTheme : ""),
    };
  } catch (error) {
    console.error("Unable to load Payload theme settings.", error);
    return {};
  }
}

export function productsToBuilderProducts(products: BuilderProduct[]): BuilderProduct[] {
  return products.map((product) => ({
    family: product.family,
    name: product.name,
    slug: product.slug,
    summary: product.summary,
  }));
}
