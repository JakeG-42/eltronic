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

  function updateImage(index: number, field: "src" | "alt", value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
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
                <Input
                  id={`image-src-${image.id}`}
                  name="imageSrc"
                  placeholder="/product-images/example.jpg"
                  required={requireFirst && index === 0}
                  value={image.src}
                  onChange={(event) => updateImage(index, "src", event.target.value)}
                />
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
