import type { Metadata } from "next";
import config from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eltronic v2",
  robots: {
    index: false,
    follow: false,
  },
};

type PayloadV2Page = {
  body?: string | null;
  heroHeading?: string | null;
  title?: string | null;
};

async function getPayloadHomePage(): Promise<PayloadV2Page | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      depth: 0,
      limit: 1,
      where: {
        slug: {
          equals: "home",
        },
      },
    });

    return result.docs[0] ?? null;
  } catch (error) {
    console.error("Unable to load Payload v2 home page.", error);
    return null;
  }
}

export default async function PayloadV2Page() {
  const page = await getPayloadHomePage();

  return (
    <main className="page">
      <section className="panel">
        <p className="code-kicker">Payload sandbox</p>
        <h1>{page?.heroHeading ?? page?.title ?? "Eltronic v2"}</h1>
        <p className="lede">
          {page?.body ??
            "This is the blank Payload-backed version space. The current Eltronic site and Studio are still running separately."}
        </p>
      </section>
    </main>
  );
}
