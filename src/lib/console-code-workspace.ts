import { promises as fs } from "fs";
import path from "path";

export type RepoTreeNode = {
  children?: RepoTreeNode[];
  extension?: string;
  name: string;
  path: string;
  size?: number;
  type: "directory" | "file";
};

export type RepoFile = {
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

export class CodeWorkspaceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CodeWorkspaceError";
    this.status = status;
  }
}

const REPO_ROOT = process.cwd();
const MAX_FILE_BYTES = 512 * 1024;
const MAX_TREE_FILES = 1800;
const MAX_DEPTH = 9;

const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

const allowedExtensions = new Set([
  ".css",
  ".cjs",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".scss",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".webmanifest",
  ".xml",
  ".yaml",
  ".yml",
]);

const rootFiles = new Set([
  ".gitignore",
  "components.json",
  "eslint.config.mjs",
  "next.config.ts",
  "package.json",
  "payload.config.ts",
  "postcss.config.mjs",
  "README.md",
  "tsconfig.json",
  "vercel.json",
]);

const languageByExtension: Record<string, string> = {
  ".css": "css",
  ".cjs": "javascript",
  ".html": "html",
  ".js": "javascript",
  ".json": "json",
  ".jsx": "jsx",
  ".md": "markdown",
  ".mjs": "javascript",
  ".scss": "scss",
  ".svg": "svg",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".txt": "text",
  ".webmanifest": "json",
  ".xml": "xml",
  ".yaml": "yaml",
  ".yml": "yaml",
};

function isBlockedName(name: string) {
  return name.startsWith(".env") || name.endsWith(".pem") || name.endsWith(".key") || name.endsWith(".cert");
}

function isAllowedRoot(relativePath: string) {
  const firstSegment = relativePath.split("/")[0];

  return ["docs", "public", "scripts", "src"].includes(firstSegment) || rootFiles.has(relativePath);
}

function extensionFor(filePath: string) {
  const extension = path.extname(filePath);

  return filePath === ".gitignore" ? ".txt" : extension;
}

function isAllowedFile(relativePath: string) {
  const name = path.basename(relativePath);

  return !isBlockedName(name) && isAllowedRoot(relativePath) && allowedExtensions.has(extensionFor(relativePath));
}

async function resolveRepoPath(relativePath: string) {
  const normalizedPath = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (!normalizedPath || normalizedPath.includes("\0")) {
    throw new CodeWorkspaceError("Choose a file first.");
  }

  if (normalizedPath.split("/").some((segment) => segment === ".." || ignoredDirectories.has(segment) || isBlockedName(segment))) {
    throw new CodeWorkspaceError("That file is outside the code workspace.");
  }

  if (!isAllowedFile(normalizedPath)) {
    throw new CodeWorkspaceError("That file type is not available in the code workspace.");
  }

  const absolutePath = path.resolve(REPO_ROOT, normalizedPath);
  const realRoot = await fs.realpath(REPO_ROOT);
  const realPath = await fs.realpath(absolutePath);
  const relativeFromRoot = path.relative(realRoot, realPath);

  if (relativeFromRoot.startsWith("..") || path.isAbsolute(relativeFromRoot)) {
    throw new CodeWorkspaceError("That file is outside the project.");
  }

  return {
    absolutePath: realPath,
    relativePath: normalizedPath,
  };
}

async function walkDirectory(relativeDirectory: string, depth: number, counter: { files: number }): Promise<RepoTreeNode[]> {
  if (depth > MAX_DEPTH || counter.files >= MAX_TREE_FILES) {
    return [];
  }

  const absoluteDirectory = path.join(REPO_ROOT, relativeDirectory);
  const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true }).catch(() => []);
  const nodes: RepoTreeNode[] = [];

  for (const entry of entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) {
      return -1;
    }

    if (!a.isDirectory() && b.isDirectory()) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  })) {
    if (counter.files >= MAX_TREE_FILES || entry.isSymbolicLink() || isBlockedName(entry.name)) {
      continue;
    }

    const relativePath = path.posix.join(relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name) || !isAllowedRoot(relativePath)) {
        continue;
      }

      const children = await walkDirectory(relativePath, depth + 1, counter);

      nodes.push({
        children,
        name: entry.name,
        path: relativePath,
        type: "directory",
      });
      continue;
    }

    if (!entry.isFile() || !isAllowedFile(relativePath)) {
      continue;
    }

    const stats = await fs.stat(path.join(REPO_ROOT, relativePath)).catch(() => null);
    counter.files += 1;

    nodes.push({
      extension: extensionFor(relativePath).replace(".", ""),
      name: entry.name,
      path: relativePath,
      size: stats?.size,
      type: "file",
    });
  }

  return nodes;
}

export async function getRepoTree(): Promise<RepoTreeNode[]> {
  const counter = { files: 0 };
  const nodes: RepoTreeNode[] = [];

  for (const entry of ["src", "docs", "scripts", "public"]) {
    const children = await walkDirectory(entry, 1, counter);

    nodes.push({
      children,
      name: entry,
      path: entry,
      type: "directory",
    });
  }

  for (const file of Array.from(rootFiles).sort()) {
    const stats = await fs.stat(path.join(REPO_ROOT, file)).catch(() => null);

    if (!stats?.isFile()) {
      continue;
    }

    nodes.push({
      extension: extensionFor(file).replace(".", ""),
      name: file,
      path: file,
      size: stats.size,
      type: "file",
    });
  }

  return nodes;
}

export async function readRepoFile(requestedPath: string): Promise<RepoFile> {
  const { absolutePath, relativePath } = await resolveRepoPath(requestedPath);
  const stats = await fs.stat(absolutePath);

  if (!stats.isFile()) {
    throw new CodeWorkspaceError("That path is not a file.");
  }

  if (stats.size > MAX_FILE_BYTES) {
    throw new CodeWorkspaceError("That file is too large to open in the browser.", 413);
  }

  const content = await fs.readFile(absolutePath, "utf8");
  const extension = extensionFor(relativePath);

  return {
    content,
    extension: extension.replace(".", ""),
    language: languageByExtension[extension] ?? "text",
    modifiedAt: stats.mtime.toISOString(),
    name: path.basename(relativePath),
    path: relativePath,
    readOnly: true,
    readOnlyReason: "Source files are read-only here because Vercel deployments are immutable. Use Git for source changes, and CSS snippets for live styling overrides.",
    size: stats.size,
  };
}
