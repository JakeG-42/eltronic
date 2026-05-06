"use client";

import { Archive, File, FileText, Grid3X3, ImageIcon, List, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";

import { deleteStudioFilesAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import type { StudioFileItem, StudioFileKind } from "@/lib/studio-files";
import { cn } from "@/lib/utils";

type FileLibraryManagerProps = {
  items: StudioFileItem[];
};

type FileView = "grid" | "table";

export function FileLibraryManager({ items }: FileLibraryManagerProps) {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => new Set());
  const [view, setView] = useState<FileView>("grid");
  const selectedCount = selectedPaths.size;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const selectedLabel = useMemo(() => {
    if (selectedCount === 0) {
      return "No files selected";
    }

    return `${selectedCount} selected`;
  }, [selectedCount]);

  function toggleSelected(relativePath: string, checked: boolean) {
    setSelectedPaths((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(relativePath);
      } else {
        next.delete(relativePath);
      }

      return next;
    });
  }

  function setAllSelected(checked: boolean) {
    setSelectedPaths(checked ? new Set(items.map((item) => item.relativePath)) : new Set());
  }

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (selectedCount === 0) {
      event.preventDefault();
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedCount} selected file${selectedCount === 1 ? "" : "s"} from local media storage?`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteStudioFilesAction} className="studio-media-manager" onSubmit={confirmDelete}>
      <input name="returnTo" type="hidden" value="/studio/files" />

      <div className="studio-media-toolbar">
        <div className="studio-media-stats" aria-label="File totals">
          <span>
            <strong>{items.length}</strong>
            files
          </span>
          <span>
            <strong>{items.filter((item) => item.kind === "image").length}</strong>
            images
          </span>
          <span>
            <strong>{items.filter((item) => item.kind === "pdf").length}</strong>
            PDFs
          </span>
          <span>
            <strong>{formatBytes(items.reduce((total, item) => total + item.size, 0))}</strong>
            stored
          </span>
        </div>

        <div className="studio-media-controls">
          <div className="studio-media-view-toggle" aria-label="Files view">
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
        <div className="studio-media-empty">No local media files have been added yet.</div>
      ) : view === "grid" ? (
        <div className="studio-media-grid">
          {items.map((item) => (
            <label className={cn("studio-media-tile", selectedPaths.has(item.relativePath) && "is-selected")} key={item.relativePath}>
              <input
                checked={selectedPaths.has(item.relativePath)}
                className="studio-media-checkbox"
                name="fileIds"
                type="checkbox"
                value={item.relativePath}
                onChange={(event) => toggleSelected(item.relativePath, event.target.checked)}
              />
              <span className="studio-media-preview studio-file-preview">
                <FilePreview item={item} />
              </span>
              <span className="studio-media-tile-body">
                <strong title={item.name}>{item.name}</strong>
                <small title={item.folder || "media root"}>{item.folder || "media root"}</small>
                <em>{item.kind}</em>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="studio-media-table-wrap">
          <table className="studio-media-table studio-file-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Preview</th>
                <th>File</th>
                <th>Type</th>
                <th>Size</th>
                <th>Modified</th>
                <th>Path</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className={selectedPaths.has(item.relativePath) ? "is-selected" : undefined} key={item.relativePath}>
                  <td>
                    <input
                      checked={selectedPaths.has(item.relativePath)}
                      className="studio-media-checkbox"
                      name="fileIds"
                      type="checkbox"
                      value={item.relativePath}
                      onChange={(event) => toggleSelected(item.relativePath, event.target.checked)}
                    />
                  </td>
                  <td>
                    <span className="studio-media-row-preview studio-file-row-preview">
                      <FilePreview item={item} compact />
                    </span>
                  </td>
                  <td>
                    <strong className="studio-media-table-source" title={item.name}>
                      {item.name}
                    </strong>
                  </td>
                  <td>{item.kind}</td>
                  <td>{formatBytes(item.size)}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                  <td>
                    <a className="studio-file-link" href={item.publicPath} target="_blank" rel="noreferrer">
                      {item.publicPath}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </form>
  );
}

function FilePreview({ compact = false, item }: { compact?: boolean; item: StudioFileItem }) {
  if (item.kind === "image") {
    return (
      <Image
        alt=""
        className="studio-file-thumbnail"
        height={compact ? 48 : 120}
        sizes={compact ? "48px" : "120px"}
        src={item.publicPath}
        unoptimized
        width={compact ? 48 : 120}
      />
    );
  }

  return (
    <span className={cn("studio-file-icon", compact && "compact")} aria-hidden="true">
      {renderFileIcon(item.kind, compact)}
    </span>
  );
}

function renderFileIcon(kind: StudioFileKind, compact: boolean) {
  const className = compact ? "size-5" : "size-7";

  if (kind === "pdf" || kind === "document") {
    return <FileText className={className} />;
  }

  if (kind === "archive") {
    return <Archive className={className} />;
  }

  if (kind === "image") {
    return <ImageIcon className={className} />;
  }

  return <File className={className} />;
}

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
