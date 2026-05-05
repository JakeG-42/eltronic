"use client";

import type { DefaultCellComponentProps } from "payload";
import { Paintbrush } from "lucide-react";

export function WysiwygCell({ rowData }: DefaultCellComponentProps) {
  const id = rowData?.id;

  if (!id) {
    return null;
  }

  return (
    <a
      aria-label={`Open WYSIWYG builder for ${rowData.title ?? "page"}`}
      className="wysiwyg-cell-button"
      href={`/console/wysiwyg/${id}`}
      onClick={(event) => event.stopPropagation()}
      rel="noreferrer"
      target="_blank"
      title="Open WYSIWYG builder"
    >
      <Paintbrush aria-hidden="true" size={15} strokeWidth={2.2} />
      <span>WYSIWYG</span>
    </a>
  );
}
