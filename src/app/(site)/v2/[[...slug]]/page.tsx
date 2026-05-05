import type { Metadata } from "next";
import config from "@payload-config";
import { getPayload } from "payload";

import { PayloadPageRenderer } from "@/components/payload/payload-page-renderer";
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

export default async function PayloadV2Page({ params }: PayloadV2PageProps) {
  const { slug: segments } = await params;
  const slug = getSlugFromSegments(segments);
  const [page, featuredProducts] = await Promise.all([getPayloadPage(slug), getFeaturedProducts()]);

  if (page) {
    return <PayloadPageRenderer featuredProducts={featuredProducts} page={page} />;
  }

  return (
    <main className="page payload-page">
      <section className="panel payload-empty-page">
        <p className="code-kicker">Payload site</p>
        <h1>New Eltronic</h1>
        <p className="lede">
          Create and publish a Payload page with the slug <code>{slug}</code> to control this route.
        </p>
      </section>
    </main>
  );
}
