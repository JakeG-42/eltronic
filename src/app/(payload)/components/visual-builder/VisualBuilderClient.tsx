"use client";

import { Puck, type PuckAction } from "@puckeditor/core";
import { ExternalLink, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";

import { builderConfig } from "@/payload/builder/puck-config";
import type { BuilderData, BuilderMenu, BuilderProduct } from "@/payload/builder/types";

type SaveState = "error" | "idle" | "saved" | "saving";

const ROOT_ZONE = "root:default-zone";

type VisualBuilderClientProps = {
  builderData: BuilderData;
  featuredProducts: BuilderProduct[];
  menus: BuilderMenu[];
  pageId: string;
  previewUrl: string;
  slug: string;
  title: string;
};

type HeaderActionsProps = {
  children?: ReactNode;
  dispatch: (action: PuckAction) => void;
  message: string;
  previewUrl: string;
  saveState: SaveState;
  state: {
    data?: BuilderData;
    indexes?: {
      zones?: Record<string, { contentIds?: unknown[] }>;
    };
  };
};

function getRootContentLength(state: HeaderActionsProps["state"]) {
  const indexedContent = state.indexes?.zones?.[ROOT_ZONE]?.contentIds;

  if (Array.isArray(indexedContent)) {
    return indexedContent.length;
  }

  return Array.isArray(state.data?.content) ? state.data.content.length : 0;
}

function insertSection(dispatch: (action: PuckAction) => void, state: HeaderActionsProps["state"]) {
  dispatch({
    componentType: "SectionBlock",
    destinationIndex: getRootContentLength(state),
    destinationZone: ROOT_ZONE,
    type: "insert",
  });
}

function renderHeaderActions({ children, dispatch, message, previewUrl, saveState, state }: HeaderActionsProps) {
  return (
    <div className="visual-builder-actions">
      <button className="visual-builder-action primary" onClick={() => insertSection(dispatch, state)} type="button">
        <Plus aria-hidden="true" size={15} />
        <span>Add section</span>
      </button>
      <a className="visual-builder-action" href={previewUrl} rel="noreferrer" target="_blank">
        <ExternalLink aria-hidden="true" size={14} />
        <span>Preview</span>
      </a>
      {message ? <span className={`visual-builder-header-status ${saveState}`}>{message}</span> : null}
      {children}
    </div>
  );
}

export function VisualBuilderClient({
  builderData,
  featuredProducts,
  menus,
  pageId,
  previewUrl,
  slug,
  title,
}: VisualBuilderClientProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  async function save(data: BuilderData) {
    setSaveState("saving");
    setMessage("Saving visual builder data...");

    const response = await fetch(`/console-api/pages/${pageId}`, {
      body: JSON.stringify({ builderData: data }),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });

    if (!response.ok) {
      setSaveState("error");
      setMessage(`Save failed: ${await response.text()}`);
      return;
    }

    setSaveState("saved");
    setMessage("Saved to Payload. Refresh the preview tab to see the published page update.");
  }

  return (
    <div className="visual-builder-view">
      <Puck
        config={builderConfig}
        data={builderData}
        headerPath={slug === "home" ? "/" : `/${slug}`}
        headerTitle={title}
        height="calc(100vh - 2rem)"
        iframe={{
          enabled: true,
          waitForStyles: true,
        }}
        metadata={{ featuredProducts, menus }}
        onPublish={save}
        renderHeaderActions={(props) =>
          renderHeaderActions({
            ...props,
            message,
            previewUrl,
            saveState,
          })
        }
        viewports={[
          {
            height: "auto",
            label: "Desktop",
            width: 1440,
          },
          {
            height: "auto",
            label: "Tablet",
            width: 820,
          },
          {
            height: "auto",
            label: "Mobile",
            width: 390,
          },
        ]}
      />
    </div>
  );
}
