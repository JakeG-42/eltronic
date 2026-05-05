import type { DocumentViewServerProps, Payload } from "payload";

import { pageToBuilderData } from "@/payload/builder/convert";
import {
  applyThemeToBuilderData,
  getBuilderMenus,
  getBuilderPageTemplates,
  getBuilderThemeSettings,
  getBuilderThemes,
  getPageBuilderTheme,
} from "@/payload/builder/metadata";
import type { BuilderProduct } from "@/payload/builder/types";

import { VisualBuilderClient } from "./VisualBuilderClient";

function getNewSiteUrl() {
  return (process.env.NEXT_PUBLIC_NEW_SITE_URL ?? "https://new.eltronic.co.uk").replace(/\/+$/, "");
}

function getPreviewUrl(slug: unknown) {
  const path = typeof slug === "string" && slug !== "home" ? `/${slug}` : "/";

  return `${getNewSiteUrl()}${path}`;
}

async function getFeaturedProducts(payload: Payload): Promise<BuilderProduct[]> {
  try {
    const result = await payload.find({
      collection: "products",
      depth: 0,
      limit: 6,
      sort: "-updatedAt",
      where: {
        and: [
          {
            status: {
              equals: "published",
            },
          },
          {
            featured: {
              equals: true,
            },
          },
        ],
      },
    });

    return result.docs.map((product) => ({
      family: product.family,
      name: product.name,
      slug: product.slug,
      summary: product.summary,
    }));
  } catch (error) {
    console.error("Unable to load featured products for visual builder.", error);
    return [];
  }
}

export async function VisualBuilderView({ doc, initPageResult }: DocumentViewServerProps) {
  if (!initPageResult.req.user) {
    return (
      <div className="visual-builder-view">
        <div className="visual-builder-toolbar">
          <div>
            <p className="visual-builder-kicker">Eltronic WYSIWYG</p>
            <h1>Sign in required</h1>
          </div>
        </div>
      </div>
    );
  }

  const page = doc as {
    builderData?: unknown;
    id?: number | string;
    layout?: Record<string, unknown>[];
    pageTemplate?: { id?: number | string } | number | string;
    slug?: string;
    theme?: { id?: number | string } | number | string;
    title?: string;
  };
  const slug = page.slug ?? "home";
  const title = page.title ?? "Untitled page";
  const payload = initPageResult.req.payload;
  const [featuredProducts, menus, themes, pageTemplates, themeSettings] = await Promise.all([
    getFeaturedProducts(payload),
    getBuilderMenus(payload),
    getBuilderThemes(payload),
    getBuilderPageTemplates(payload),
    getBuilderThemeSettings(payload),
  ]);
  const activeTheme = getPageBuilderTheme(page, themes, themeSettings.themeId);
  const activeTemplateId =
    typeof page.pageTemplate === "number" || typeof page.pageTemplate === "string" ? String(page.pageTemplate) : String(page.pageTemplate?.id ?? themeSettings.templateId ?? "");

  return (
    <VisualBuilderClient
      activeTemplateId={activeTemplateId}
      activeThemeId={activeTheme.id}
      builderData={applyThemeToBuilderData(pageToBuilderData(page), activeTheme)}
      featuredProducts={featuredProducts}
      menus={menus}
      pageTemplates={pageTemplates}
      pageId={String(page.id)}
      previewUrl={getPreviewUrl(slug)}
      slug={slug}
      themes={themes}
      title={title}
    />
  );
}
