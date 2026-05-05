import Link from "next/link";

import { ManagedImage } from "@/components/site/managed-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductImage } from "@/content/products";
import { getProductImages, getProducts } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Media | Eltronic Studio",
};

export default async function StudioMediaPage() {
  const products = await getProducts();
  const mediaItems = products.flatMap((product) =>
    getProductImages(product).map((image, index) => ({
      image,
      index,
      productName: product.name,
      productSlug: product.slug,
    })),
  );
  const inlineUploadCount = mediaItems.filter((item) => isInlineImageSource(item.image.src)).length;
  const productsWithMediaCount = new Set(mediaItems.map((item) => item.productSlug)).size;

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>
          Product media used across catalogue cards and product galleries. Uploaded images show their filename here
          rather than the inline stored image data.
        </p>
        <Button asChild>
          <Link href="/studio/products">Manage products</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{mediaItems.length}</CardTitle>
            <CardDescription>Total gallery images</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{inlineUploadCount}</CardTitle>
            <CardDescription>Studio uploads</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{productsWithMediaCount}</CardTitle>
            <CardDescription>Products with managed media</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Media library</CardTitle>
          <CardDescription>Images are currently attached to products, not stored as separate reusable assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mediaItems.map((item) => (
              <article
                className="overflow-hidden rounded-2xl border border-border bg-background/40"
                key={`${item.productSlug}-${item.index}-${item.image.src.slice(0, 48)}`}
              >
                <div className="relative aspect-video bg-muted">
                  <ManagedImage
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    src={item.image.src}
                  />
                </div>
                <div className="grid gap-2 p-4">
                  <div>
                    <strong className="block break-all text-sm">{displayMediaSource(item.image)}</strong>
                    <span className="text-xs text-muted-foreground">{item.image.alt}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{item.productName}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/studio/products/${item.productSlug}/edit`}>Edit product</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function displayMediaSource(image: ProductImage) {
  if (!isInlineImageSource(image.src)) {
    return image.src;
  }

  return image.fileName || inlineFileNameFromAlt(image.alt, image.src);
}

function inlineFileNameFromAlt(alt: string, src: string) {
  const extension = extensionFromInlineImageSource(src);
  const baseName = alt.trim() || "uploaded_image";

  return normalizeFileName(`${baseName}.${extension}`);
}

function extensionFromInlineImageSource(src: string) {
  const match = src.match(/^data:image\/([a-z0-9.+-]+)[;,]/i);
  const extension = match?.[1]?.toLowerCase();

  if (!extension) {
    return "image";
  }

  if (extension === "jpeg") {
    return "jpg";
  }

  if (extension === "svg+xml") {
    return "svg";
  }

  return extension.replace(/[^a-z0-9]+/g, "");
}

function isInlineImageSource(src: string) {
  return /^(data|blob):/i.test(src);
}

function normalizeFileName(fileName: string) {
  const cleanName = fileName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleanName || "uploaded_image";
}
