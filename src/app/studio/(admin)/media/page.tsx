import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaLibraryManager, type StudioMediaItem } from "@/components/studio/media-library-manager";
import type { ProductImage } from "@/content/products";
import { getProductImages, getProductMediaReferenceId, getProducts } from "@/lib/managed-data";

type StudioMediaPageProps = {
  searchParams?: Promise<{
    deleted?: string;
    error?: string;
    skipped?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Media | Eltronic Studio",
};

export default async function StudioMediaPage({ searchParams }: StudioMediaPageProps) {
  const params = await searchParams;
  const products = await getProducts();
  const mediaItems: StudioMediaItem[] = products.flatMap((product) =>
    getProductImages(product).map((image) => ({
      alt: image.alt,
      id: getProductMediaReferenceId(product.slug, image.src),
      productName: product.name,
      productSlug: product.slug,
      sourceLabel: displayMediaSource(image),
      sourceType: isInlineImageSource(image.src) ? "Upload" : "URL",
      src: image.src,
    })),
  );
  const inlineUploadCount = mediaItems.filter((item) => item.sourceType === "Upload").length;
  const productsWithMediaCount = new Set(mediaItems.map((item) => item.productSlug)).size;
  const deletedCount = Number(params?.deleted ?? 0);

  return (
    <div className="grid gap-6">
      <section className="studio-page-header">
        <p>
          Product media is attached to product galleries. Select images here to remove those image references from
          the products they belong to.
        </p>
      </section>

      {params?.deleted ? (
        <div className="studio-storage-alert builder-success">
          {deletedCount > 0
            ? `Removed ${params.deleted} image reference${params.deleted === "1" ? "" : "s"} from product galleries.`
            : "No image references were removed."}
          {params.skipped ? ` ${params.skipped} image${params.skipped === "1" ? "" : "s"} kept because every product needs at least one image.` : ""}
        </div>
      ) : null}
      {params?.error ? <div className="studio-storage-alert">{params.error}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Media library</CardTitle>
          <CardDescription>Compact gallery view with table mode for checking filenames, products and alt text.</CardDescription>
        </CardHeader>
        <CardContent>
          <MediaLibraryManager
            inlineUploadCount={inlineUploadCount}
            items={mediaItems}
            productsWithMediaCount={productsWithMediaCount}
          />
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
