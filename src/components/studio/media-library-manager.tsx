"use client";

import { Grid3X3, List, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { deleteProductMediaAction } from "@/app/studio/actions";
import { ManagedImage } from "@/components/site/managed-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StudioMediaItem = {
  alt: string;
  id: string;
  productName: string;
  productSlug: string;
  sourceLabel: string;
  sourceType: "Upload" | "URL";
  src: string;
};

type MediaLibraryManagerProps = {
  inlineUploadCount: number;
  items: StudioMediaItem[];
  productsWithMediaCount: number;
};

type MediaView = "grid" | "table";

export function MediaLibraryManager({ inlineUploadCount, items, productsWithMediaCount }: MediaLibraryManagerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [view, setView] = useState<MediaView>("grid");
  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const selectedLabel = useMemo(() => {
    if (selectedCount === 0) {
      return "No images selected";
    }

    return `${selectedCount} selected`;
  }, [selectedCount]);

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }

  function setAllSelected(checked: boolean) {
    setSelectedIds(checked ? new Set(items.map((item) => item.id)) : new Set());
  }

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (selectedCount === 0) {
      event.preventDefault();
      return;
    }

    const confirmed = window.confirm(
      `Remove ${selectedCount} selected image${selectedCount === 1 ? "" : "s"} from the attached product galler${selectedCount === 1 ? "y" : "ies"}?`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteProductMediaAction} className="studio-media-manager" onSubmit={confirmDelete}>
      <input name="returnTo" type="hidden" value="/studio/media" />

      <div className="studio-media-toolbar">
        <div className="studio-media-stats" aria-label="Media totals">
          <span>
            <strong>{items.length}</strong>
            images
          </span>
          <span>
            <strong>{inlineUploadCount}</strong>
            uploads
          </span>
          <span>
            <strong>{productsWithMediaCount}</strong>
            products
          </span>
        </div>

        <div className="studio-media-controls">
          <div className="studio-media-view-toggle" aria-label="Media view">
            <button className={view === "grid" ? "active" : undefined} type="button" onClick={() => setView("grid")}>
              <Grid3X3 className="size-4" />
              Grid
            </button>
            <button className={view === "table" ? "active" : undefined} type="button" onClick={() => setView("table")}>
              <List className="size-4" />
              Table
            </button>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => setAllSelected(!allSelected)}>
            {allSelected ? "Clear all" : "Select all"}
          </Button>
          <Button type="submit" size="sm" variant="destructive" disabled={selectedCount === 0}>
            <Trash2 className="size-4" />
            Delete selected
          </Button>
          <span className="studio-media-selected-count">{selectedLabel}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="studio-media-empty">No product media has been added yet.</div>
      ) : view === "grid" ? (
        <div className="studio-media-grid">
          {items.map((item) => (
            <label className={cn("studio-media-tile", selectedIds.has(item.id) && "is-selected")} key={item.id}>
              <input
                checked={selectedIds.has(item.id)}
                className="studio-media-checkbox"
                name="mediaIds"
                type="checkbox"
                value={item.id}
                onChange={(event) => toggleSelected(item.id, event.target.checked)}
              />
              <span className="studio-media-preview">
                <ManagedImage
                  alt={item.alt}
                  className="studio-media-image"
                  fill
                  sizes="(max-width: 900px) 28vw, 12vw"
                  src={item.src}
                />
              </span>
              <span className="studio-media-tile-body">
                <strong title={item.sourceLabel}>{item.sourceLabel}</strong>
                <small title={item.productName}>{item.productName}</small>
                <em>{item.sourceType}</em>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="studio-media-table-wrap">
          <table className="studio-media-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Preview</th>
                <th>Image</th>
                <th>Product</th>
                <th>Type</th>
                <th>Alt text</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className={selectedIds.has(item.id) ? "is-selected" : undefined} key={item.id}>
                  <td>
                    <input
                      checked={selectedIds.has(item.id)}
                      className="studio-media-checkbox"
                      name="mediaIds"
                      type="checkbox"
                      value={item.id}
                      onChange={(event) => toggleSelected(item.id, event.target.checked)}
                    />
                  </td>
                  <td>
                    <span className="studio-media-row-preview">
                      <ManagedImage
                        alt={item.alt}
                        className="studio-media-image"
                        fill
                        sizes="3rem"
                        src={item.src}
                      />
                    </span>
                  </td>
                  <td>
                    <strong className="studio-media-table-source" title={item.sourceLabel}>
                      {item.sourceLabel}
                    </strong>
                  </td>
                  <td>{item.productName}</td>
                  <td>{item.sourceType}</td>
                  <td>{item.alt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </form>
  );
}
