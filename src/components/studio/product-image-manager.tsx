"use client";

import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductImage } from "@/content/products";

type ManagedImage = ProductImage & {
  id: string;
};

type ProductImageManagerProps = {
  idPrefix?: string;
  images: ProductImage[];
  requireFirst?: boolean;
};

export function ProductImageManager({ idPrefix = "image", images, requireFirst = true }: ProductImageManagerProps) {
  const initialImages = images.length > 0 ? images : [{ src: "", alt: "" }];
  const [items, setItems] = useState<ManagedImage[]>(() =>
    initialImages.map((image, index) => ({
      ...image,
      id: `${idPrefix}-existing-${index}`,
    })),
  );
  const serializedImages = JSON.stringify(items.map(({ alt, src }) => ({ alt, src })));

  function updateImage(index: number, field: "src" | "alt", value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  async function uploadImage(index: number, file?: File) {
    if (!file) {
      return;
    }

    const src = await fileToManagedImageSource(file);
    const fallbackAlt = imageAltFromFile(file);

    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              alt: item.alt || fallbackAlt,
              src,
            }
          : item,
      ),
    );
  }

  function addImage() {
    setItems((current) => [
      ...current,
      {
        id: `${idPrefix}-${Date.now()}-${current.length}`,
        src: "",
        alt: "",
      },
    ]);
  }

  function removeImage(index: number) {
    setItems((current) => {
      const nextItems = current.filter((_, itemIndex) => itemIndex !== index);
      return nextItems.length > 0 ? nextItems : [{ id: `${idPrefix}-${Date.now()}-empty`, src: "", alt: "" }];
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setItems((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const nextItems = [...current];
      const [item] = nextItems.splice(index, 1);
      nextItems.splice(targetIndex, 0, item);
      return nextItems;
    });
  }

  return (
    <div className="studio-image-manager">
      <input name="galleryImagesJson" type="hidden" value={serializedImages} />
      <div className="studio-image-manager-header">
        <div>
          <Label>Gallery images</Label>
          <p>
            Preview, edit and order the product gallery. Add as many images as the product needs; the first image
            becomes the main product image.
          </p>
        </div>
        <span className="studio-image-count">{items.length} image{items.length === 1 ? "" : "s"}</span>
        <Button type="button" variant="secondary" onClick={addImage}>
          <ImagePlus className="size-4" />
          Add image
        </Button>
      </div>

      <div className="studio-image-list">
        {items.map((image, index) => (
          <article className="studio-image-card" key={image.id}>
            <div
              aria-label={image.alt || image.src || `Product image ${index + 1}`}
              className="studio-image-preview"
              role="img"
              style={{ backgroundImage: image.src ? `url(${JSON.stringify(image.src)})` : undefined }}
            >
              {image.src ? null : <span>No image</span>}
              {index === 0 ? <strong>Primary</strong> : null}
            </div>

            <div className="studio-image-fields">
              <div className="grid gap-2">
                <Label htmlFor={`image-src-${image.id}`}>Image URL</Label>
                <div className="studio-image-source-row">
                  <Input
                    id={`image-src-${image.id}`}
                    name="imageSrc"
                    placeholder="/product-images/example.jpg"
                    required={requireFirst && index === 0}
                    value={image.src}
                    onChange={(event) => updateImage(index, "src", event.target.value)}
                  />
                  <input
                    accept="image/*"
                    className="sr-only"
                    id={`image-upload-${image.id}`}
                    type="file"
                    onChange={(event) => {
                      void uploadImage(index, event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                  <Button
                    aria-label={`Upload image ${index + 1}`}
                    className="studio-image-upload-button"
                    size="icon"
                    title="Upload image"
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById(`image-upload-${image.id}`)?.click()}
                  >
                    <ImagePlus className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`image-alt-${image.id}`}>Alt text</Label>
                <Input
                  id={`image-alt-${image.id}`}
                  name="imageAlt"
                  placeholder="Describe the product image"
                  value={image.alt}
                  onChange={(event) => updateImage(index, "alt", event.target.value)}
                />
              </div>
            </div>

            <div className="studio-image-actions" aria-label={`Reorder image ${index + 1}`}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === 0}
                onClick={() => moveImage(index, -1)}
              >
                <ArrowUp className="size-4" />
                Up
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === items.length - 1}
                onClick={() => moveImage(index, 1)}
              >
                <ArrowDown className="size-4" />
                Down
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => removeImage(index)}>
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function imageAltFromFile(file: File) {
  return file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

async function fileToManagedImageSource(file: File) {
  const rawDataUrl = await readFileAsDataUrl(file);

  if (file.type === "image/svg+xml") {
    return rawDataUrl;
  }

  try {
    const image = await loadImage(rawDataUrl);
    const largestEdge = Math.max(image.naturalWidth, image.naturalHeight);

    if (largestEdge === 0) {
      return rawDataUrl;
    }

    const scale = Math.min(1, 1800 / largestEdge);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return rawDataUrl;
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/webp", 0.86);
  } catch {
    return rawDataUrl;
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(reader.error));
    reader.addEventListener("load", () => resolve(typeof reader.result === "string" ? reader.result : ""));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("error", reject);
    image.addEventListener("load", () => resolve(image));
    image.src = src;
  });
}
