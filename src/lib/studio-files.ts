import { createHash } from "node:crypto";
import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_MEDIA_ROOT = path.join(process.cwd(), "public", "media");
const PUBLIC_MEDIA_BASE = "/media";
const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

export type StudioFileKind = "archive" | "document" | "image" | "other" | "pdf";

export type StudioFileItem = {
  extension: string;
  folder: string;
  id: string;
  kind: StudioFileKind;
  name: string;
  publicPath: string;
  relativePath: string;
  size: number;
  updatedAt: string;
};

export type StudioFileWriteResult = {
  files: StudioFileItem[];
  skipped: number;
};

export async function getStudioFiles(): Promise<StudioFileItem[]> {
  try {
    const entries = await collectMediaFiles(PUBLIC_MEDIA_ROOT);
    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch (error) {
    if (isMissingDirectoryError(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveStudioUploadedFiles(files: File[], folder = "uploads"): Promise<StudioFileWriteResult> {
  const uploadFolder = normalizeFolderPath(folder) || "uploads";
  const destinationDir = resolveMediaPath(uploadFolder);
  const savedFiles: StudioFileItem[] = [];
  let skipped = 0;

  await mkdir(destinationDir, { recursive: true });

  for (const file of files) {
    if (!file || file.size === 0) {
      skipped += 1;
      continue;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`${file.name} is larger than the 40MB upload limit.`);
    }

    const fileName = normalizeFileName(file.name || "uploaded_file");
    const destination = await uniqueDestinationPath(destinationDir, fileName);
    const relativePath = toPublicRelativePath(path.relative(PUBLIC_MEDIA_ROOT, destination));
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(destination, buffer);
    savedFiles.push(await fileItemFromPath(destination, relativePath));
  }

  return {
    files: savedFiles,
    skipped,
  };
}

export async function deleteStudioFiles(relativePaths: string[]) {
  let deleted = 0;
  let skipped = 0;

  for (const relativePath of relativePaths) {
    try {
      const fullPath = resolveMediaPath(relativePath);
      const fileStats = await stat(fullPath);

      if (!fileStats.isFile()) {
        skipped += 1;
        continue;
      }

      await unlink(fullPath);
      deleted += 1;
    } catch (error) {
      if (isMissingDirectoryError(error)) {
        skipped += 1;
        continue;
      }

      throw error;
    }
  }

  return { deleted, skipped };
}

async function collectMediaFiles(directory: string): Promise<StudioFileItem[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map(async (entry) => {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          return collectMediaFiles(fullPath);
        }

        if (!entry.isFile()) {
          return [];
        }

        const relativePath = toPublicRelativePath(path.relative(PUBLIC_MEDIA_ROOT, fullPath));
        return [await fileItemFromPath(fullPath, relativePath)];
      }),
  );

  return files.flat();
}

async function fileItemFromPath(fullPath: string, relativePath: string): Promise<StudioFileItem> {
  const fileStats = await stat(fullPath);
  const name = path.basename(relativePath);
  const folder = path.posix.dirname(relativePath);
  const extension = path.extname(name).replace(/^\./, "").toLowerCase();

  return {
    extension,
    folder: folder === "." ? "" : folder,
    id: createHash("sha256").update(relativePath).digest("base64url").slice(0, 18),
    kind: fileKindFromExtension(extension),
    name,
    publicPath: `${PUBLIC_MEDIA_BASE}/${relativePath}`,
    relativePath,
    size: fileStats.size,
    updatedAt: fileStats.mtime.toISOString(),
  };
}

function fileKindFromExtension(extension: string): StudioFileKind {
  if (["avif", "gif", "jpeg", "jpg", "png", "svg", "webp"].includes(extension)) {
    return "image";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  if (["csv", "doc", "docx", "md", "txt", "xls", "xlsx"].includes(extension)) {
    return "document";
  }

  if (["7z", "gz", "rar", "tar", "zip"].includes(extension)) {
    return "archive";
  }

  return "other";
}

async function uniqueDestinationPath(directory: string, fileName: string) {
  const extension = path.extname(fileName);
  const baseName = fileName.slice(0, fileName.length - extension.length) || "uploaded_file";
  let candidate = path.join(directory, fileName);
  let index = 2;

  while (await pathExists(candidate)) {
    candidate = path.join(directory, `${baseName}-${index}${extension}`);
    index += 1;
  }

  return candidate;
}

async function pathExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (isMissingDirectoryError(error)) {
      return false;
    }

    throw error;
  }
}

function resolveMediaPath(relativePath: string) {
  const cleanPath = toPublicRelativePath(relativePath);
  const fullPath = path.resolve(PUBLIC_MEDIA_ROOT, cleanPath);

  if (fullPath !== PUBLIC_MEDIA_ROOT && !fullPath.startsWith(`${PUBLIC_MEDIA_ROOT}${path.sep}`)) {
    throw new Error("Invalid media path.");
  }

  return fullPath;
}

function normalizeFolderPath(folder: string) {
  return folder
    .split(/[\\/]+/)
    .map((segment) => normalizePathSegment(segment))
    .filter(Boolean)
    .join("/");
}

function normalizeFileName(fileName: string) {
  const extension = path.extname(fileName);
  const baseName = fileName.slice(0, fileName.length - extension.length);
  const cleanBaseName = normalizePathSegment(baseName) || "uploaded_file";
  const cleanExtension = extension
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "")
    .slice(0, 16);

  return `${cleanBaseName}${cleanExtension}`;
}

function normalizePathSegment(segment: string) {
  return segment
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^\.+|\.+$/g, "");
}

function toPublicRelativePath(relativePath: string) {
  return relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
}

function isMissingDirectoryError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}
