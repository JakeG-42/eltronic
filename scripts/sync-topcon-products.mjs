#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

const DATA_KEY = "eltronic:managed-data:v1";
const POSTGRES_TABLE_NAME = "eltronic_managed_data";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "eltronic-data.json");
const TOPCON_PRODUCTS_PATH = path.join(process.cwd(), "src", "content", "topcon-products.json");
const BACKUP_DIR = path.join(process.cwd(), ".data", "backups");
const isDryRun = process.argv.includes("--dry-run");

for (const envFile of [".env.local", ".env.development.local"]) {
  loadEnvFile(envFile);
}

const topconProducts = JSON.parse(await readFile(TOPCON_PRODUCTS_PATH, "utf8")).map((product) => ({
  ...product,
  template: "default",
}));
const storage = getStorage();
const data = await storage.read();

if (!data || !Array.isArray(data.products)) {
  throw new Error("No existing managed product data was found to update.");
}

const existingTopconProducts = data.products.filter(isTopconProduct);
const retainedProducts = data.products.filter((product) => !isTopconProduct(product));
const nextData = {
  ...data,
  products: [...retainedProducts, ...topconProducts],
  updatedAt: new Date().toISOString(),
};

console.log(`Storage: ${storage.name}`);
console.log(`Removed Topcon products: ${existingTopconProducts.length}`);
console.log(`Added Topcon products: ${topconProducts.length}`);
console.log(`Next product count: ${nextData.products.length}`);
console.log(topconProducts.map((product) => `- ${product.slug}`).join("\n"));

if (isDryRun) {
  console.log("Dry run only. Re-run without --dry-run to write the managed catalogue.");
  process.exit(0);
}

const backupPath = await writeBackup(data, storage.name);
console.log(`Backup: ${backupPath}`);
await storage.write(nextData);
console.log("Topcon product catalogue sync complete.");

function isTopconProduct(product) {
  const haystack = [
    product.slug,
    product.name,
    product.family,
    product.sourceUrl,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return product.slug?.startsWith("topcon-") || haystack.includes("topcon") || /\bopus\b/i.test(haystack);
}

async function writeBackup(dataToBackup, storageName) {
  await mkdir(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `topcon-product-import-${timestamp}.json`);
  await writeFile(
    backupPath,
    `${JSON.stringify({ backedUpAt: new Date().toISOString(), storage: storageName, data: dataToBackup }, null, 2)}\n`,
  );
  return backupPath;
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
