"use client";

import { ArrowDown, ArrowUp, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductImage } from "@/content/products";

type ManagedImage = ProductImage & {
  id: string;
};

type ImageField = "alt" | "fileName" | "src";

type ProductImageManagerProps = {
  idPrefix?: string;
  images: ProductImage[];
  requireFirst?: boolean;
};

export function ProductImageManager({ idPrefix = "image", images }: ProductImageManagerProps) {
  const initialImages = images.length > 0 ? images : [{ src: "", alt: "" }];
  const [editingId, setEditingId] = useState<string | null>(initialImages[0] ? `${idPrefix}-existing-0` : null);
  const [items, setItems] = useState<ManagedImage[]>(() =>
    initialImages.map((image, index) => ({
      ...image,
      id: `${idPrefix}-existing-${index}`,
    })),
  );
  const editingIndex = items.findIndex((item) => item.id === editingId);
  const editingImage = editingIndex >= 0 ? items[editingIndex] : null;
  const serializedImages = JSON.stringify(
    items.map((image) => ({
      alt: image.alt,
      fileName: isInlineImageSource(image.src) ? displayImageSource(image) : image.fileName,
      src: image.src,
    })),
  );

  function updateImage(id: string, field: ImageField, value: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              ...(field === "src" ? { fileName: undefined } : {}),
            }
          : item,
      ),
    );
  }

  async function uploadImage(id: string, file?: File) {
    if (!file) {
      return;
    }

    const src = await fileToManagedImageSource(file);
    const fallbackAlt = imageAltFromFile(file);
    const fileName = normalizeUploadFileName(file.name);

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              alt: item.alt || fallbackAlt,
              fileName,
              src,
            }
          : item,
      ),
    );
  }

  function addImage() {
    const id = `${idPrefix}-${Date.now()}-${items.length}`;
    setItems((current) => [
      ...current,
      {
        id,
        src: "",
        alt: "",
      },
    ]);
    setEditingId(id);
  }

  function removeImage(id: string) {
    const removeIndex = items.findIndex((item) => item.id === id);
    const nextItems = items.filter((item) => item.id !== id);

    if (nextItems.length > 0) {
      setItems(nextItems);

      if (editingId === id) {
        setEditingId(nextItems[Math.max(0, removeIndex - 1)]?.id ?? nextItems[0].id);
      }

      return;
    }

    const emptyItem = { id: `${idPrefix}-${Date.now()}-empty`, src: "", alt: "" };
    setItems([emptyItem]);
    setEditingId(emptyItem.id);
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

      {items.map((image) => (
        <span key={image.id}>
          <input name="imageSrc" type="hidden" value={image.src} />
          <input name="imageAlt" type="hidden" value={image.alt} />
          <input name="imageFileName" type="hidden" value={image.fileName ?? ""} />
        </span>
      ))}

      <div className="studio-image-manager-header">
        <div>
          <Label>Gallery images</Label>
          <p>Open an image to edit its source, upload a replacement, rename it or adjust alt text.</p>
        </div>
        <span className="studio-image-count">{items.length} image{items.length === 1 ? "" : "s"}</span>
      </div>

      <div className="studio-image-gallery-grid">
        {items.map((image, index) => (
          <article className="studio-image-tile" key={image.id}>
            <button
              aria-label={`Edit image ${index + 1}`}
              className="studio-image-tile-preview"
              style={{ backgroundImage: image.src ? `url(${JSON.stringify(image.src)})` : undefined }}
              type="button"
              onClick={() => setEditingId(image.id)}
            >
              {image.src ? null : <span>No image</span>}
              {index === 0 ? <strong>Primary</strong> : null}
            </button>
            <div className="studio-image-tile-meta">
              <button type="button" onClick={() => setEditingId(image.id)}>
                <span>{displayImageName(image, index)}</span>
                <small>{image.alt || "Alt text missing"}</small>
              </button>
              <div className="studio-image-tile-actions" aria-label={`Manage image ${index + 1}`}>
                <Button
                  aria-label="Move image up"
                  disabled={index === 0}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => moveImage(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  aria-label="Move image down"
                  disabled={index === items.length - 1}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => moveImage(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button aria-label="Edit image" size="icon" type="button" variant="ghost" onClick={() => setEditingId(image.id)}>
                  <Pencil className="size-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}

        <button className="studio-image-add-tile" type="button" onClick={addImage}>
          <ImagePlus className="size-6" />
          <span>Add image</span>
        </button>
      </div>

      {editingImage ? (
        <div className="studio-image-modal-backdrop" role="presentation">
          <section
            aria-label={`Edit gallery image ${editingIndex + 1}`}
            aria-modal="true"
            className="studio-image-modal"
            role="dialog"
          >
            <div className="studio-image-modal-header">
              <div>
                <span className="studio-eyebrow">product.media</span>
                <h2>Edit gallery image</h2>
              </div>
              <Button aria-label="Close image editor" size="icon" type="button" variant="ghost" onClick={() => setEditingId(null)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="studio-image-modal-body">
              <div
                aria-label={editingImage.alt || displayImageSource(editingImage)}
                className="studio-image-modal-preview"
                role="img"
                style={{ backgroundImage: editingImage.src ? `url(${JSON.stringify(editingImage.src)})` : undefined }}
              >
                {editingImage.src ? null : <span>No image selected</span>}
              </div>

              <div className="studio-image-modal-fields">
                <div className="grid gap-2">
                  <Label htmlFor={`${editingImage.id}-source`}>Image URL</Label>
                  <div className="studio-image-source-row">
                    <Input
                      id={`${editingImage.id}-source`}
                      placeholder={isInlineImageSource(editingImage.src) ? "Uploaded image stored in product data" : "/product-images/example.jpg"}
                      value={isInlineImageSource(editingImage.src) ? "" : editingImage.src}
                      onChange={(event) => updateImage(editingImage.id, "src", event.target.value)}
                    />
                    <input
                      accept="image/*"
                      className="sr-only"
                      id={`${editingImage.id}-upload`}
                      type="file"
                      onChange={(event) => {
                        void uploadImage(editingImage.id, event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                    <Button
                      aria-label="Upload image"
                      className="studio-image-upload-button"
                      size="icon"
                      title="Upload image"
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById(`${editingImage.id}-upload`)?.click()}
                    >
                      <ImagePlus className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${editingImage.id}-name`}>Name</Label>
                  <Input
                    id={`${editingImage.id}-name`}
                    placeholder="uploaded_image.webp"
                    value={displayImageName(editingImage, editingIndex)}
                    onChange={(event) => updateImage(editingImage.id, "fileName", normalizeUploadFileName(event.target.value))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${editingImage.id}-alt`}>Alt text</Label>
                  <Input
                    id={`${editingImage.id}-alt`}
                    placeholder="Describe the product image"
                    value={editingImage.alt}
                    onChange={(event) => updateImage(editingImage.id, "alt", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="studio-image-modal-actions">
              <Button type="button" variant="outline" onClick={() => removeImage(editingImage.id)}>
                <Trash2 className="size-4" />
                Remove
              </Button>
              <Button type="button" onClick={() => setEditingId(null)}>
                Done
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function imageAltFromFile(file: File) {
  return normalizeUploadFileName(file.name)
    .replace(/\.[^.]+$/, "")
    .replace(/_+/g, " ")
    .trim();
}

function displayImageSource(image: ProductImage) {
  if (!isInlineImageSource(image.src)) {
    return image.src;
  }

  return image.fileName || inlineFileNameFromAlt(image.alt, image.src);
}

function displayImageName(image: ProductImage, index: number) {
  if (image.fileName) {
    return image.fileName;
  }

  if (isInlineImageSource(image.src)) {
    return inlineFileNameFromAlt(image.alt, image.src);
  }

  if (image.src) {
    const [cleanSrc] = image.src.split(/[?#]/);
    const fileName = cleanSrc.split("/").filter(Boolean).at(-1);
    return fileName || `Image_${index + 1}`;
  }

  return `Image_${index + 1}`;
}

function inlineFileNameFromAlt(alt: string, src: string) {
  const extension = extensionFromInlineImageSource(src);
  const baseName = alt.trim() || "uploaded_image";

  return normalizeUploadFileName(`${baseName}.${extension}`);
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

function normalizeUploadFileName(fileName: string) {
  const cleanName = fileName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleanName || "uploaded_image";
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
