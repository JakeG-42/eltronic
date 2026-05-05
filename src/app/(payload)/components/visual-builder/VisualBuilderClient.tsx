"use client";

import { blocksPlugin, outlinePlugin, Puck, type PuckAction } from "@puckeditor/core";
import { ExternalLink, FilePlus2, Plus, X } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";

import { applyThemeToBuilderData, getDefaultBuilderTheme } from "@/payload/builder/metadata";
import { builderConfig } from "@/payload/builder/puck-config";
import type { BuilderData, BuilderMenu, BuilderPageTemplate, BuilderProduct, BuilderTheme } from "@/payload/builder/types";

type SaveState = "error" | "idle" | "saved" | "saving";

const ROOT_ZONE = "root:default-zone";

const editorPlugins = [
  {
    ...blocksPlugin(),
    label: "Add blocks",
  },
  {
    ...outlinePlugin(),
    label: "Current page",
  },
];

type VisualBuilderClientProps = {
  activeTemplateId: string;
  activeThemeId: string;
  builderData: BuilderData;
  featuredProducts: BuilderProduct[];
  menus: BuilderMenu[];
  pageTemplates: BuilderPageTemplate[];
  pageId: string;
  previewUrl: string;
  slug: string;
  themes: BuilderTheme[];
  title: string;
};

type HeaderActionsProps = {
  children?: ReactNode;
  creatingPage: boolean;
  dispatch: (action: PuckAction) => void;
  message: string;
  onOpenNewPage: () => void;
  onThemeChange: (themeId: string, data: BuilderData | undefined) => void;
  previewUrl: string;
  saveState: SaveState;
  selectedThemeId: string;
  state: {
    data?: BuilderData;
    indexes?: {
      zones?: Record<string, { contentIds?: unknown[] }>;
    };
  };
  themes: BuilderTheme[];
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function withPageTitle(data: BuilderData, title: string) {
  return {
    ...data,
    root: {
      ...data.root,
      props: {
        ...data.root.props,
        pageTitle: title,
      },
    },
  } as BuilderData;
}

function createStarterBuilderData(title: string, theme: BuilderTheme): BuilderData {
  const builderData = {
    content: [
      {
        props: {
          body: "Use Add blocks to build this page, then select each section to customise its text, spacing, colours and effects.",
          eyebrow: "New page",
          heading: title,
          id: "starter-section",
          primaryLabel: "Add content",
          primaryUrl: "#",
          secondaryLabel: "",
          secondaryUrl: "",
          variant: "panel",
        },
        type: "SectionBlock",
      },
    ],
    root: {
      props: {
        accentColor: "#8bd3ff",
        backgroundColor: "#020617",
        fontFamily: "display",
        pageTitle: title,
        sectionSpacing: "normal",
        surfaceColor: "23, 32, 51",
        surfaceOpacity: 0.78,
        textColor: "#f1f5f9",
        themePreset: "eltronicDark",
      },
    },
    zones: {},
  } as BuilderData;

  return applyThemeToBuilderData(builderData, theme);
}

function getCreatedPageId(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return "";
  }

  const record = value as Record<string, unknown>;

  if (typeof record.id === "number" || typeof record.id === "string") {
    return String(record.id);
  }

  if (typeof record.doc === "object" && record.doc !== null) {
    const doc = record.doc as Record<string, unknown>;

    if (typeof doc.id === "number" || typeof doc.id === "string") {
      return String(doc.id);
    }
  }

  return "";
}

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

function payloadRelationshipId(id: string) {
  return /^\d+$/.test(id) ? Number(id) : undefined;
}

function renderHeaderActions({
  children,
  creatingPage,
  dispatch,
  message,
  onOpenNewPage,
  onThemeChange,
  previewUrl,
  saveState,
  selectedThemeId,
  state,
  themes,
}: HeaderActionsProps) {
  return (
    <div className="visual-builder-actions">
      <label className="visual-builder-theme-select">
        <span>Theme</span>
        <select disabled={saveState === "saving"} onChange={(event) => onThemeChange(event.currentTarget.value, state.data)} value={selectedThemeId}>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>
      <button className="visual-builder-action" disabled={creatingPage} onClick={onOpenNewPage} type="button">
        <FilePlus2 aria-hidden="true" size={15} />
        <span>New page</span>
      </button>
      <a className="visual-builder-action" href="/console/globals/theme-settings" rel="noreferrer" target="_blank">
        <ExternalLink aria-hidden="true" size={14} />
        <span>Theme settings</span>
      </a>
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
  activeTemplateId,
  activeThemeId,
  builderData,
  featuredProducts,
  menus,
  pageTemplates,
  pageId,
  previewUrl,
  slug,
  themes,
  title,
}: VisualBuilderClientProps) {
  const defaultTheme = getDefaultBuilderTheme(themes);
  const activeTemplate = pageTemplates.find((template) => template.id === activeTemplateId);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [activeBuilderData, setActiveBuilderData] = useState(() => applyThemeToBuilderData(builderData, themes.find((theme) => theme.id === activeThemeId) ?? defaultTheme));
  const [selectedThemeId, setSelectedThemeId] = useState(activeThemeId || defaultTheme.id);
  const [creatingPage, setCreatingPage] = useState(false);
  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("new-page");
  const [newPageTemplateId, setNewPageTemplateId] = useState(activeTemplateId || "");
  const [newPageThemeId, setNewPageThemeId] = useState(activeTemplate?.themeId || activeThemeId || defaultTheme.id);
  const [newPageTitle, setNewPageTitle] = useState("New page");
  const [slugWasEdited, setSlugWasEdited] = useState(false);

  function themeForId(themeId: string) {
    return themes.find((theme) => theme.id === themeId) ?? defaultTheme;
  }

  function updateNewPageTitle(value: string) {
    setNewPageTitle(value);

    if (!slugWasEdited) {
      setNewPageSlug(normalizeSlug(value) || "new-page");
    }
  }

  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = newPageTitle.trim() || "New page";
    const nextSlug = normalizeSlug(newPageSlug || nextTitle) || "new-page";
    const selectedTemplate = pageTemplates.find((template) => template.id === newPageTemplateId);
    const selectedTheme = themeForId(newPageThemeId || selectedTemplate?.themeId || defaultTheme.id);
    const templateBuilderData = selectedTemplate?.builderData ? withPageTitle(selectedTemplate.builderData, nextTitle) : null;
    const nextBuilderData = templateBuilderData ? applyThemeToBuilderData(templateBuilderData, selectedTheme) : createStarterBuilderData(nextTitle, selectedTheme);
    const payloadThemeId = payloadRelationshipId(selectedTheme.id);

    setCreatingPage(true);
    setSaveState("saving");
    setMessage("Creating new draft page...");

    const response = await fetch("/console-api/pages", {
      body: JSON.stringify({
        builderData: nextBuilderData,
        layout: [
          {
            blockType: "hero",
            eyebrow: "New page",
            heading: nextTitle,
            lede: "Start building this page in the WYSIWYG editor.",
            primaryLink: {
              label: "",
              url: "",
            },
            secondaryLink: {
              label: "",
              url: "",
            },
          },
        ],
        pageTemplate: payloadRelationshipId(selectedTemplate?.id ?? ""),
        slug: nextSlug,
        status: "draft",
        summary: "",
        theme: payloadThemeId,
        title: nextTitle,
      }),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      setCreatingPage(false);
      setSaveState("error");
      setMessage(`New page failed: ${await response.text()}`);
      return;
    }

    const createdPage = (await response.json().catch(() => null)) as unknown;
    const createdPageId = getCreatedPageId(createdPage);

    if (!createdPageId) {
      setCreatingPage(false);
      setSaveState("error");
      setMessage("New page was created, but the editor could not find its ID. Open Pages in Console to locate it.");
      return;
    }

    setMessage("New page created. Opening the visual editor...");
    window.location.assign(`/console/wysiwyg/${createdPageId}`);
  }

  async function changeTheme(themeId: string, data: BuilderData | undefined) {
    const theme = themeForId(themeId);
    const nextBuilderData = applyThemeToBuilderData(data ?? activeBuilderData, theme);

    setSelectedThemeId(theme.id);
    setActiveBuilderData(nextBuilderData);
    setSaveState("saving");
    setMessage(`Switching to ${theme.name}...`);

    const response = await fetch(`/console-api/pages/${pageId}`, {
      body: JSON.stringify({
        builderData: nextBuilderData,
        theme: payloadRelationshipId(theme.id),
      }),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });

    if (!response.ok) {
      setSaveState("error");
      setMessage(`Theme switch failed: ${await response.text()}`);
      return;
    }

    setSaveState("saved");
    setMessage(`${theme.name} applied to this page.`);
  }

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

    setActiveBuilderData(data);
    setSaveState("saved");
    setMessage("Saved to Payload. Refresh the preview tab to see the published page update.");
  }

  return (
    <div className="visual-builder-view">
      <Puck
        config={builderConfig}
        data={activeBuilderData}
        headerPath={slug === "home" ? "/" : `/${slug}`}
        headerTitle={title}
        height="calc(100vh - 2rem)"
        iframe={{
          enabled: true,
          waitForStyles: true,
        }}
        key={`${pageId}-${selectedThemeId}`}
        metadata={{ featuredProducts, menus, pageTemplates, themes }}
        onPublish={save}
        plugins={editorPlugins}
        renderHeaderActions={(props) =>
          renderHeaderActions({
            ...props,
            creatingPage,
            message,
            onOpenNewPage: () => setIsNewPageOpen(true),
            onThemeChange: changeTheme,
            previewUrl,
            saveState,
            selectedThemeId,
            themes,
          })
        }
        ui={{ plugin: { current: "outline" } }}
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
      {isNewPageOpen ? (
        <div aria-labelledby="visual-builder-new-page-title" aria-modal="true" className="visual-builder-dialog" role="dialog">
          <form className="visual-builder-dialog-panel" onSubmit={createPage}>
            <div className="visual-builder-dialog-header">
              <div>
                <p>New page</p>
                <h2 id="visual-builder-new-page-title">Create a draft page</h2>
              </div>
              <button aria-label="Close new page dialog" onClick={() => setIsNewPageOpen(false)} type="button">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <label>
              <span>Page title</span>
              <input autoFocus onChange={(event) => updateNewPageTitle(event.currentTarget.value)} required type="text" value={newPageTitle} />
            </label>
            <label>
              <span>Template</span>
              <select
                onChange={(event) => {
                  const nextTemplateId = event.currentTarget.value;
                  const nextTemplate = pageTemplates.find((template) => template.id === nextTemplateId);

                  setNewPageTemplateId(nextTemplateId);

                  if (nextTemplate?.themeId) {
                    setNewPageThemeId(nextTemplate.themeId);
                  }
                }}
                value={newPageTemplateId}
              >
                <option value="">Blank starter</option>
                {pageTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Theme</span>
              <select onChange={(event) => setNewPageThemeId(event.currentTarget.value)} required value={newPageThemeId}>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Slug</span>
              <input
                onChange={(event) => {
                  setSlugWasEdited(true);
                  setNewPageSlug(normalizeSlug(event.currentTarget.value));
                }}
                required
                type="text"
                value={newPageSlug}
              />
            </label>
            <div className="visual-builder-dialog-actions">
              <button disabled={creatingPage} onClick={() => setIsNewPageOpen(false)} type="button">
                Cancel
              </button>
              <button disabled={creatingPage} type="submit">
                {creatingPage ? "Creating..." : "Create page"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
