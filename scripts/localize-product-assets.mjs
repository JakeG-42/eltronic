#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

const TOPCON_PRODUCTS_PATH = path.join(process.cwd(), "src", "content", "topcon-products.json");
const PRODUCTS_TS_PATH = path.join(process.cwd(), "src", "content", "products.ts");
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "eltronic-data.json");
const PUBLIC_MEDIA_ROOT = path.join(process.cwd(), "public", "media");
const DATA_KEY = "eltronic:managed-data:v1";
const POSTGRES_TABLE_NAME = "eltronic_managed_data";
const shouldUpdateLocalData = process.argv.includes("--update-local-data");
const shouldSyncManagedData = process.argv.includes("--sync-managed-data");
const shouldDryRun = process.argv.includes("--dry-run");

for (const envFile of [".env.local", ".env.development.local"]) {
  loadEnvFile(envFile);
}

const extraProductDocumentUrls = [
  {
    slug: "autopi-can-fd-pro",
    url: "https://www.autopi.io/static/pdf/autopi_CAN_FD_Pro_datasheet.pdf",
  },
];

const replacements = new Map();
const replacementsByUrl = new Map();
const downloadLog = [];

const topconProducts = JSON.parse(await readFile(TOPCON_PRODUCTS_PATH, "utf8"));
const nextTopconProducts = await localizeProducts(topconProducts);

for (const item of extraProductDocumentUrls) {
  await localizeAsset(item.url, item.slug, "files");
}

if (!shouldDryRun) {
  await writeFile(TOPCON_PRODUCTS_PATH, `${JSON.stringify(nextTopconProducts, null, 2)}\n`);
  await rewriteProductsTs();

  if (shouldUpdateLocalData && existsSync(LOCAL_DATA_PATH)) {
    await rewriteLocalManagedData();
  }

  if (shouldSyncManagedData) {
    await rewriteManagedStorageData();
  }
}

console.log(`Assets downloaded or reused: ${downloadLog.length}`);
console.log(`URL replacements: ${replacements.size}`);
for (const item of downloadLog.slice(0, 12)) {
  console.log(`- ${item.publicPath}`);
}
if (downloadLog.length > 12) {
  console.log(`...and ${downloadLog.length - 12} more`);
}
if (shouldDryRun) {
  console.log("Dry run only. Re-run without --dry-run to write files and content.");
}

async function localizeProducts(products) {
  const nextProducts = [];

  for (const product of products) {
    const nextProduct = structuredClone(product);

    if (nextProduct.image?.src) {
      const localImage = await localizeAsset(nextProduct.image.src, nextProduct.slug, "images");

      if (localImage) {
        nextProduct.image.src = localImage.publicPath;
        nextProduct.image.fileName = localImage.fileName;
      }
    }

    if (Array.isArray(nextProduct.images)) {
      nextProduct.images = await Promise.all(
        nextProduct.images.map(async (image) => {
          if (!image?.src) {
            return image;
          }

          const localImage = await localizeAsset(image.src, nextProduct.slug, "images");

          return localImage
            ? {
                ...image,
                fileName: localImage.fileName,
                src: localImage.publicPath,
              }
            : image;
        }),
      );
    }

    if (Array.isArray(nextProduct.documents)) {
      nextProduct.documents = await Promise.all(
        nextProduct.documents.map(async (document) => {
          if (!document?.url) {
            return document;
          }

          const localDocument = await localizeAsset(document.url, nextProduct.slug, "files");

          return localDocument
            ? {
                ...document,
                url: localDocument.publicPath,
              }
            : document;
        }),
      );
    }

    nextProducts.push(nextProduct);
  }

  return nextProducts;
}

async function localizeAsset(url, slug, kind) {
  if (!/^https?:\/\//i.test(url)) {
    return null;
  }

  const replacementKey = `${slug}:${url}`;

  if (replacements.has(replacementKey)) {
    return replacements.get(replacementKey);
  }

  const parsedUrl = new URL(url);
  const sourceName = decodeURIComponent(path.posix.basename(parsedUrl.pathname)) || `${kind}-${hashUrl(url)}`;
  const fileName = normalizeFileName(sourceName, hashUrl(url));
  const folder = path.join(PUBLIC_MEDIA_ROOT, "products", normalizePathSegment(slug), kind);
  const destination = path.join(folder, fileName);
  const publicPath = `/media/products/${normalizePathSegment(slug)}/${kind}/${fileName}`;

  if (!shouldDryRun) {
    await mkdir(folder, { recursive: true });

    if (!(await fileExists(destination))) {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Unable to download ${url}: ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(destination, buffer);
    }
  }

  const replacement = { fileName, publicPath };
  replacements.set(replacementKey, replacement);
  replacementsByUrl.set(url, replacement);
  downloadLog.push(replacement);
  return replacement;
}

async function rewriteProductsTs() {
  let content = await readFile(PRODUCTS_TS_PATH, "utf8");

  for (const { url } of extraProductDocumentUrls) {
    const replacement = replacementsByUrl.get(url);

    if (replacement) {
      content = content.replaceAll(url, replacement.publicPath);
    }
  }

  await writeFile(PRODUCTS_TS_PATH, content);
}

async function rewriteLocalManagedData() {
  const data = JSON.parse(await readFile(LOCAL_DATA_PATH, "utf8"));

  if (!Array.isArray(data.products)) {
    return;
  }

  data.products = data.products.map((product) => replaceProductUrls(product));
  data.updatedAt = new Date().toISOString();
  await writeFile(LOCAL_DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

async function rewriteManagedStorageData() {
  const storage = getStorage();
  const data = await storage.read();

  if (!data || !Array.isArray(data.products)) {
    throw new Error("No existing managed product data was found to update.");
  }

  const nextData = {
    ...data,
    products: data.products.map((product) => replaceProductUrls(product)),
    updatedAt: new Date().toISOString(),
  };

  await storage.write(nextData);
  console.log(`Managed storage updated: ${storage.name}`);
}

function replaceProductUrls(product) {
  const nextProduct = structuredClone(product);

  if (nextProduct.image?.src) {
    const replacement = getReplacementForProductUrl(nextProduct.slug, nextProduct.image.src);
    if (replacement) {
      nextProduct.image.src = replacement.publicPath;
      nextProduct.image.fileName = replacement.fileName;
    }
  }

  if (Array.isArray(nextProduct.images)) {
    nextProduct.images = nextProduct.images.map((image) => {
      const replacement = getReplacementForProductUrl(nextProduct.slug, image.src);
      return replacement
        ? {
            ...image,
            fileName: replacement.fileName,
            src: replacement.publicPath,
          }
        : image;
    });
  }

  if (Array.isArray(nextProduct.documents)) {
    nextProduct.documents = nextProduct.documents.map((document) => {
      const replacement = getReplacementForProductUrl(nextProduct.slug, document.url);
      return replacement
        ? {
            ...document,
            url: replacement.publicPath,
          }
        : document;
    });
  }

  return nextProduct;
}

function getReplacementForProductUrl(slug, url) {
  return replacements.get(`${slug}:${url}`) ?? replacementsByUrl.get(url);
}

async function fileExists(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

function normalizeFileName(fileName, fallbackHash) {
  const extension = path.extname(fileName);
  const baseName = fileName.slice(0, fileName.length - extension.length);
  const cleanBaseName = normalizePathSegment(baseName) || `asset_${fallbackHash}`;
  const cleanExtension = extension
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "")
    .slice(0, 16);

  return `${cleanBaseName}${cleanExtension}`;
}

function normalizePathSegment(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^\.+|\.+$/g, "");
}

function hashUrl(url) {
  return createHash("sha256").update(url).digest("base64url").slice(0, 8);
}

function getStorage() {
  const postgresConnectionString = getPostgresConnectionString();
  const redisConfig = getRedisConfig();

  if (postgresConnectionString) {
    const sql = neon(postgresConnectionString);

    return {
      name: "Neon/Postgres",
      async read() {
        await ensurePostgresDataTable(sql);
        const rows = await sql.query(`SELECT data FROM ${POSTGRES_TABLE_NAME} WHERE id = $1 LIMIT 1`, [DATA_KEY]);
        const rowData = rows[0]?.data;

        return typeof rowData === "string" ? JSON.parse(rowData) : rowData;
      },
      async write(nextData) {
        await ensurePostgresDataTable(sql);
        await sql.query(
          `
            INSERT INTO eltronic_managed_data (id, data, updated_at)
            VALUES ($1, $2::jsonb, now())
            ON CONFLICT (id)
            DO UPDATE SET data = EXCLUDED.data, updated_at = now()
          `,
          [DATA_KEY, JSON.stringify(nextData)],
        );
      },
    };
  }

  if (redisConfig) {
    const redis = new Redis(redisConfig);

    return {
      name: "Upstash/Vercel KV",
      read() {
        return redis.get(DATA_KEY);
      },
      write(nextData) {
        return redis.set(DATA_KEY, nextData);
      },
    };
  }

  return {
    name: "local JSON",
    async read() {
      if (!existsSync(LOCAL_DATA_PATH)) {
        return null;
      }

      return JSON.parse(await readFile(LOCAL_DATA_PATH, "utf8"));
    },
    async write(nextData) {
      await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
      await writeFile(LOCAL_DATA_PATH, `${JSON.stringify(nextData, null, 2)}\n`);
    },
  };
}

async function ensurePostgresDataTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS eltronic_managed_data (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  return url && token ? { url, token } : null;
}

function getPostgresConnectionString() {
  const directConnection =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (directConnection) {
    return directConnection;
  }

  for (const suffix of ["DATABASE_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"]) {
    const key = Object.keys(process.env).find((envKey) => envKey.endsWith(`_${suffix}`));
    const value = key ? process.env[key] : undefined;

    if (value) {
      return value;
    }
  }

  return null;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = unquoteEnvValue(trimmedLine.slice(separatorIndex + 1).trim());

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function unquoteEnvValue(value) {
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}
