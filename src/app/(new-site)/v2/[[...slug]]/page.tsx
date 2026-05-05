import type { Metadata } from "next";
import config from "@payload-config";
import { getPayload, type Where } from "payload";

import { PuckBuilderRenderer } from "@/components/payload/puck-builder-renderer";
import {
  applyThemeToBuilderData,
  getBuilderMenus,
  getBuilderThemeSettings,
  getBuilderThemes,
  getPageBuilderTheme,
  productsToBuilderProducts,
} from "@/payload/builder/metadata";
import { normalizeBuilderData } from "@/payload/builder/convert";
import type { BuilderMenu, BuilderTheme, BuilderThemeSettings } from "@/payload/builder/types";
import type { Page, Product } from "@/payload-types";

export const dynamic = "force-dynamic";

type PayloadV2PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

function getSlugFromSegments(segments: string[] | undefined) {
  return segments?.length ? segments.join("/") : "home";
}

function getPagePath(slug: string) {
  return slug === "home" ? "/" : `/${slug}`;
}

async function getPayloadPage(slug: string): Promise<Page | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      depth: 2,
      limit: 1,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            status: {
              equals: "published",
            },
          },
        ],
      },
    });

    return result.docs[0] ?? null;
  } catch (error) {
    console.error("Unable to load Payload v2 page.", error);
    return null;
  }
}

export async function generateMetadata({ params }: PayloadV2PageProps): Promise<Metadata> {
  const { slug: segments } = await params;
  const slug = getSlugFromSegments(segments);
  const page = await getPayloadPage(slug);
  const title = page?.seo?.title ?? page?.title ?? "New Eltronic";
  const description = page?.seo?.description ?? page?.summary ?? "A Payload-managed preview of the next Eltronic website.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://new.eltronic.co.uk${getPagePath(slug)}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const payload = await getPayload({ config });
    const featured = await payload.find({
      collection: "products",
      depth: 1,
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

    if (featured.docs.length) {
      return featured.docs;
    }

    const fallback = await payload.find({
      collection: "products",
      depth: 1,
      limit: 6,
      sort: "-updatedAt",
      where: {
        status: {
          equals: "published",
        },
      },
    });

    return fallback.docs;
  } catch (error) {
    console.error("Unable to load Payload products for v2.", error);
    return [];
  }
}

async function getMenus(): Promise<BuilderMenu[]> {
  try {
    const payload = await getPayload({ config });

    return getBuilderMenus(payload);
  } catch (error) {
    console.error("Unable to load Payload menus for v2.", error);
    return [];
  }
}

async function getThemes(): Promise<BuilderTheme[]> {
  try {
    const payload = await getPayload({ config });

    return getBuilderThemes(payload);
  } catch (error) {
    console.error("Unable to load Payload themes for v2.", error);
    return [];
  }
}

async function getThemeSettings(): Promise<BuilderThemeSettings> {
  try {
    const payload = await getPayload({ config });

    return getBuilderThemeSettings(payload);
  } catch (error) {
    console.error("Unable to load Payload theme settings for v2.", error);
    return {};
  }
}

function numericId(value: number | string | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return typeof value === "string" && /^\d+$/.test(value) ? Number(value) : undefined;
}

async function getCustomCss({ pageId, themeId }: { pageId?: number | string; themeId?: number | string }) {
  const orConditions: Where[] = [
    {
      scope: {
        equals: "global",
      },
    },
  ];
  const numericThemeId = numericId(themeId);
  const numericPageId = numericId(pageId);

  if (numericThemeId) {
    orConditions.push({
      and: [
        {
          scope: {
            equals: "theme",
          },
        },
        {
          theme: {
            equals: numericThemeId,
          },
        },
      ],
    });
  }

  if (numericPageId) {
    orConditions.push({
      and: [
        {
          scope: {
            equals: "page",
          },
        },
        {
          page: {
            equals: numericPageId,
          },
        },
      ],
    });
  }

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "code-snippets",
      depth: 0,
      limit: 50,
      sort: "priority",
      where: {
        and: [
          {
            status: {
              equals: "active",
            },
          },
          {
            or: orConditions,
          },
        ],
      },
    });

    return result.docs
      .map((snippet) => (snippet.css ? `/* ${snippet.title} */\n${snippet.css}` : ""))
      .filter(Boolean)
      .join("\n\n");
  } catch (error) {
    console.error("Unable to load Payload custom CSS for new site.", error);
    return "";
  }
}

export default async function PayloadV2Page({ params }: PayloadV2PageProps) {
  const { slug: segments } = await params;
  const slug = getSlugFromSegments(segments);
  const [page, featuredProducts, menus, themes, themeSettings] = await Promise.all([
    getPayloadPage(slug),
    getFeaturedProducts(),
    getMenus(),
    getThemes(),
    getThemeSettings(),
  ]);

  if (page) {
    const activeTheme = getPageBuilderTheme(page, themes, themeSettings.themeId);
    const customCss = await getCustomCss({ pageId: page.id, themeId: activeTheme.id });

    if ("builderData" in page && page.builderData) {
      const builderData = normalizeBuilderData(page.builderData);
      const themedBuilderData = builderData ? applyThemeToBuilderData(builderData, activeTheme) : page.builderData;

      return <PuckBuilderRenderer customCss={customCss} data={themedBuilderData} featuredProducts={productsToBuilderProducts(featuredProducts)} menus={menus} />;
    }

    return (
      <main className="new-site-empty">
        <section className="new-site-empty-panel">
          <p>Payload page</p>
          <h1>{page.title}</h1>
          <p>Open this page in the WYSIWYG builder and publish visual builder data to control this route.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="new-site-empty">
      <section className="new-site-empty-panel">
        <p>Payload site</p>
        <h1>New Eltronic</h1>
        <p>
          Create and publish a Payload page with the slug <code>{slug}</code> to control this route.
        </p>
      </section>
    </main>
  );
}
