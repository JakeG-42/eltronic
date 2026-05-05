"use client";

import { ChevronRight, Copy, FileCode2, Folder, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RepoTreeNode = {
  children?: RepoTreeNode[];
  extension?: string;
  name: string;
  path: string;
  size?: number;
  type: "directory" | "file";
};

type RepoFile = {
  content: string;
  extension: string;
  language: string;
  modifiedAt: string;
  name: string;
  path: string;
  readOnly: boolean;
  readOnlyReason: string;
  size: number;
};

type TreeResponse = {
  readOnlyReason: string;
  rootName: string;
  tree: RepoTreeNode[];
};

function findFirstFile(nodes: RepoTreeNode[]): RepoTreeNode | null {
  for (const node of nodes) {
    if (node.type === "file") {
      return node;
    }

    const child = findFirstFile(node.children ?? []);

    if (child) {
      return child;
    }
  }

  return null;
}

function filterTree(nodes: RepoTreeNode[], query: string): RepoTreeNode[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return nodes;
  }

  return nodes
    .map((node) => {
      if (node.type === "file") {
        return node.path.toLowerCase().includes(normalizedQuery) ? node : null;
      }

      const children = filterTree(node.children ?? [], normalizedQuery);

      if (children.length || node.path.toLowerCase().includes(normalizedQuery)) {
        return {
          ...node,
          children,
        };
      }

      return null;
    })
    .filter((node): node is RepoTreeNode => Boolean(node));
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function apiErrorMessage(data: unknown, fallback: string) {
  return typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : fallback;
}

function isRepoFile(data: unknown): data is RepoFile {
  return typeof data === "object" && data !== null && "content" in data && "path" in data;
}

function isTreeResponse(data: unknown): data is TreeResponse {
  return typeof data === "object" && data !== null && "tree" in data && Array.isArray(data.tree);
}

function TreeNode({
  depth = 0,
  node,
  onSelect,
  selectedPath,
}: {
  depth?: number;
  node: RepoTreeNode;
  onSelect: (node: RepoTreeNode) => void;
  selectedPath: string;
}) {
  if (node.type === "directory") {
    return (
      <details className="code-workspace-tree-folder" open={depth < 2}>
        <summary style={{ paddingLeft: `${depth * 0.7}rem` }}>
          <ChevronRight aria-hidden="true" size={14} />
          <Folder aria-hidden="true" size={15} />
          <span>{node.name}</span>
        </summary>
        <div>
          {(node.children ?? []).map((child) => (
            <TreeNode depth={depth + 1} key={child.path} node={child} onSelect={onSelect} selectedPath={selectedPath} />
          ))}
        </div>
      </details>
    );
  }

  return (
    <button className={selectedPath === node.path ? "selected" : ""} onClick={() => onSelect(node)} style={{ paddingLeft: `${depth * 0.7 + 1.35}rem` }} type="button">
      <FileCode2 aria-hidden="true" size={15} />
      <span>{node.name}</span>
      {node.extension ? <small>{node.extension}</small> : null}
    </button>
  );
}

export function CodeWorkspaceClient() {
  const [error, setError] = useState("");
  const [file, setFile] = useState<RepoFile | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [readOnlyReason, setReadOnlyReason] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [tree, setTree] = useState<RepoTreeNode[]>([]);

  const filteredTree = useMemo(() => filterTree(tree, query), [query, tree]);

  async function loadFile(path: string) {
    if (!path) {
      return;
    }

    setIsFileLoading(true);
    setError("");

    const response = await fetch(`/api/console-code/file?path=${encodeURIComponent(path)}`, {
      credentials: "same-origin",
    });
    const data = (await response.json().catch(() => null)) as RepoFile | { error?: string } | null;

    if (!response.ok || !isRepoFile(data)) {
      setError(apiErrorMessage(data, "Unable to open that file."));
      setIsFileLoading(false);
      return;
    }

    setFile(data);
    setSelectedPath(data.path);
    setIsFileLoading(false);
  }

  async function loadTree() {
    setIsTreeLoading(true);
    setError("");

    const response = await fetch("/api/console-code/files", {
      credentials: "same-origin",
    });
    const data = (await response.json().catch(() => null)) as TreeResponse | { error?: string } | null;

    if (!response.ok || !isTreeResponse(data)) {
      setError(apiErrorMessage(data, "Unable to load the code workspace."));
      setIsTreeLoading(false);
      return;
    }

    setTree(data.tree);
    setReadOnlyReason(data.readOnlyReason);
    setIsTreeLoading(false);

    const firstFile = findFirstFile(data.tree);

    if (firstFile) {
      await loadFile(firstFile.path);
    }
  }

  async function copyFile() {
    if (!file?.content || !navigator.clipboard) {
      return;
    }

    setIsCopying(true);
    await navigator.clipboard.writeText(file.content).catch(() => null);
    window.setTimeout(() => setIsCopying(false), 900);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadTree(), 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="code-workspace">
      <section className="code-workspace-header">
        <div>
          <p>Theme</p>
          <h1>Code workspace</h1>
        </div>
        <div className="code-workspace-header-actions">
          <Link href="/console/collections/code-snippets">Custom CSS snippets</Link>
          <button disabled={isTreeLoading} onClick={loadTree} type="button">
            <RefreshCw aria-hidden="true" size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      <section className="code-workspace-grid">
        <aside className="code-workspace-sidebar">
          <label className="code-workspace-search">
            <Search aria-hidden="true" size={15} />
            <input onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search files" type="search" value={query} />
          </label>

          <div className="code-workspace-tree" data-loading={isTreeLoading || undefined}>
            {isTreeLoading ? <p>Loading files...</p> : null}
            {!isTreeLoading && filteredTree.length === 0 ? <p>No files matched.</p> : null}
            {filteredTree.map((node) => (
              <TreeNode key={node.path} node={node} onSelect={(nextNode) => void loadFile(nextNode.path)} selectedPath={selectedPath} />
            ))}
          </div>
        </aside>

        <article className="code-workspace-editor">
          <div className="code-workspace-filebar">
            <div>
              <p>{file?.path ?? "No file selected"}</p>
              {file ? (
                <span>
                  {file.language} / {formatBytes(file.size)} / updated {new Date(file.modifiedAt).toLocaleString()}
                </span>
              ) : null}
            </div>
            <button disabled={!file?.content || isCopying} onClick={copyFile} type="button">
              <Copy aria-hidden="true" size={15} />
              <span>{isCopying ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {error ? <p className="code-workspace-error">{error}</p> : null}
          <textarea aria-label="File code" readOnly spellCheck={false} value={isFileLoading ? "Loading file..." : file?.content ?? ""} />
          <div className="code-workspace-note">
            <strong>Read-only repo browser</strong>
            <span>{file?.readOnlyReason || readOnlyReason}</span>
          </div>
        </article>
      </section>
    </main>
  );
}
