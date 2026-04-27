#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

const envFiles = [".env.local", ".env.development.local"];

for (const envFile of envFiles) {
  loadEnvFile(envFile);
}

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const postgresConnectionString = getPostgresConnectionString();

if (postgresConnectionString) {
  await checkPostgresStorage(postgresConnectionString);
  process.exit(0);
}

if (url && token) {
  await checkRedisStorage(url, token);
  process.exit(0);
}

if (!postgresConnectionString && (!url || !token)) {
  console.error("Storage is not configured yet.");
  console.error("");
  console.error("Connect Neon/Postgres or Upstash/Vercel Redis to the Vercel project, then pull env vars locally:");
  console.error("  npx vercel env pull .env.local");
  console.error("  npm run storage:check");
  console.error("");
  console.error("Expected one of these env values or pairs:");
  console.error("  DATABASE_URL");
  console.error("  POSTGRES_URL");
  console.error("  <database-name>_DATABASE_URL");
  console.error("  KV_REST_API_URL + KV_REST_API_TOKEN");
  console.error("  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN");
  process.exit(1);
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
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
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

  const preferredSuffixes = ["DATABASE_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];

  for (const suffix of preferredSuffixes) {
    const key = Object.keys(process.env).find((envKey) => envKey.endsWith(`_${suffix}`));
    const value = key ? process.env[key] : undefined;

    if (value) {
      return value;
    }
  }

  return null;
}

async function checkPostgresStorage(connectionString) {
  const sql = neon(connectionString);
  const key = `storage-check-${Date.now()}`;
  const payload = {
    checkedAt: new Date().toISOString(),
    source: "scripts/check-storage.mjs",
  };

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS eltronic_storage_checks (
        id text PRIMARY KEY,
        data jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql.query(
      "INSERT INTO eltronic_storage_checks (id, data) VALUES ($1, $2::jsonb)",
      [key, JSON.stringify(payload)],
    );
    const rows = await sql.query("SELECT data FROM eltronic_storage_checks WHERE id = $1 LIMIT 1", [key]);
    await sql.query("DELETE FROM eltronic_storage_checks WHERE id = $1", [key]);

    const storedPayload = rows[0]?.data;

    if (!storedPayload || storedPayload.checkedAt !== payload.checkedAt) {
      throw new Error("Postgres returned an unexpected value from the write/read test.");
    }

    console.log("Storage check passed.");
    console.log("The app can write to Neon/Postgres with the current environment variables.");
  } catch (error) {
    console.error("Storage check failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function checkRedisStorage(redisUrl, redisToken) {
  const redis = new Redis({ url: redisUrl, token: redisToken });
  const key = `eltronic:storage-check:${Date.now()}`;
  const payload = {
    checkedAt: new Date().toISOString(),
    source: "scripts/check-storage.mjs",
  };

  try {
    await redis.set(key, payload, { ex: 120 });
    const storedPayload = await redis.get(key);
    await redis.del(key);

    if (!storedPayload || storedPayload.checkedAt !== payload.checkedAt) {
      throw new Error("Redis returned an unexpected value from the write/read test.");
    }

    console.log("Storage check passed.");
    console.log("The app can write to Upstash/Vercel Redis with the current environment variables.");
  } catch (error) {
    console.error("Storage check failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
