import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { ConsoleUsers } from "./src/payload/collections/ConsoleUsers.ts";
import { CodeSnippets } from "./src/payload/collections/CodeSnippets.ts";
import { Documents } from "./src/payload/collections/Documents.ts";
import { Media } from "./src/payload/collections/Media.ts";
import { Menus } from "./src/payload/collections/Menus.ts";
import { PageTemplates } from "./src/payload/collections/PageTemplates.ts";
import { Pages } from "./src/payload/collections/Pages.ts";
import { Posts } from "./src/payload/collections/Posts.ts";
import { ProductCategories } from "./src/payload/collections/ProductCategories.ts";
import { Products } from "./src/payload/collections/Products.ts";
import { Themes } from "./src/payload/collections/Themes.ts";
import { Footer } from "./src/payload/globals/Footer.ts";
import { Navigation } from "./src/payload/globals/Navigation.ts";
import { SiteSettings } from "./src/payload/globals/SiteSettings.ts";
import { ThemeSettings } from "./src/payload/globals/ThemeSettings.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function getLocalEnv() {
  const envPath = path.resolve(dirname, ".env.local");

  if (!existsSync(envPath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");

        if (separatorIndex === -1) {
          return null;
        }

        const key = line.slice(0, separatorIndex);
        let value = line.slice(separatorIndex + 1).trim();

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        return [key, value] as const;
      })
      .filter((entry): entry is readonly [string, string] => Boolean(entry)),
  );
}

const localEnv = getLocalEnv();

function getEnvValue(key: string) {
  return process.env[key] ?? localEnv[key];
}

function getPayloadDatabaseUrl() {
  const directConnection =
    getEnvValue("PAYLOAD_DATABASE_URL") ??
    getEnvValue("DATABASE_URL") ??
    getEnvValue("POSTGRES_URL") ??
    getEnvValue("DATABASE_URL_UNPOOLED") ??
    getEnvValue("POSTGRES_URL_NON_POOLING");

  if (directConnection) {
    return directConnection;
  }

  const preferredSuffixes = ["DATABASE_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];
  const envKeys = new Set([...Object.keys(localEnv), ...Object.keys(process.env)]);

  for (const suffix of preferredSuffixes) {
    const key = Array.from(envKeys).find((envKey) => envKey.endsWith(`_${suffix}`));
    const value = key ? getEnvValue(key) : undefined;

    if (value) {
      return value;
    }
  }

  return "";
}

function getPayloadSecret() {
  const configuredSecret =
    getEnvValue("PAYLOAD_SECRET") ??
    getEnvValue("ELTRONIC_ADMIN_SECRET") ??
    getEnvValue("AUTH_SECRET") ??
    getEnvValue("NEXTAUTH_SECRET");

  if (configuredSecret) {
    return configuredSecret;
  }

  return process.env.NODE_ENV === "production" ? "" : "local-development-payload-secret";
}

export default buildConfig({
  admin: {
    components: {
      views: {
        wysiwyg: {
          Component: "/components/visual-builder/WysiwygPageView#WysiwygPageView",
          exact: true,
          meta: {
            title: "WYSIWYG Builder",
          },
          path: "/wysiwyg/:id",
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname, "src/app/(payload)"),
      importMapFile: path.resolve(dirname, "src/app/(payload)/console/importMap.js"),
    },
    meta: {
      titleSuffix: "- Eltronic Console",
    },
    user: ConsoleUsers.slug,
  },
  collections: [Products, ProductCategories, Pages, Posts, Themes, PageTemplates, CodeSnippets, Menus, Media, Documents, ConsoleUsers],
  db: postgresAdapter({
    pool: {
      connectionString: getPayloadDatabaseUrl(),
    },
    push: false,
    schemaName: process.env.PAYLOAD_DATABASE_SCHEMA ?? "payload",
  }),
  graphQL: {
    disable: true,
  },
  editor: lexicalEditor(),
  globals: [ThemeSettings, SiteSettings, Navigation, Footer],
  routes: {
    admin: "/console",
    api: "/console-api",
    graphQL: "/console-api/graphql",
    graphQLPlayground: "/console-api/graphql-playground",
  },
  secret: getPayloadSecret(),
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});
