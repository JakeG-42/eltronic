#!/usr/bin/env node

import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const DEFAULT_SOURCE_DIR = "/Users/jake/Documents/Eltronic_resources";
const sourceDir = process.argv.slice(2).find((argument) => !argument.startsWith("--")) ?? DEFAULT_SOURCE_DIR;
const outputPath = path.join(process.cwd(), "src", "content", "articles-imported.json");
const mediaRoot = path.join(process.cwd(), "public", "media", "articles");

const topconProductSlugs = [
  "topcon-opus-a3e",
  "topcon-opus-a3s",
  "topcon-opus-a6e",
  "topcon-opus-a6s",
  "topcon-opus-a8e",
  "topcon-opus-a8s",
  "topcon-opus-b2-plus-e",
  "topcon-opus-b2-plus-s",
  "topcon-opus-b2e",
  "topcon-opus-b2s",
  "topcon-opus-b3e",
  "topcon-opus-b4e",
  "topcon-opus-b6e",
  "topcon-opus-c-series",
];

const articlePlans = {
  AutoPi_Applications_and_Benefits_Article: {
    category: "Telematics",
    homepageFeatured: true,
    relatedProductSlugs: ["autopi-can-fd-pro"],
    tags: ["AutoPi", "Telematics", "Remote diagnostics", "Cloud connectivity"],
  },
  "CAN-FD_vs_CAN2_Mobile_Machinery": {
    category: "CAN-Bus",
    relatedProductSlugs: ["autopi-can-fd-pro", "topcon-opus-a3e", "topcon-opus-a3s"],
    tags: ["CAN-FD", "CAN 2.0", "Mobile machinery", "Diagnostics"],
  },
  ELTRONIC_partnership_article: {
    category: "Company",
    homepageFeatured: true,
    relatedProductSlugs: ["autopi-can-fd-pro", "eltronic-iq-can-bus-module", "topcon-opus-b6e"],
    tags: ["Systems integration", "Partnership", "HMI", "Telematics"],
  },
  ELTRONIC_success_stories_updated: {
    category: "Company",
    relatedProductSlugs: ["eltronic-iq-can-bus-module", "autopi-can-fd-pro"],
    tags: ["Case studies", "Agriculture", "Off-highway", "Prototypes"],
  },
  How_to_Log_CAN_Traffic_to_AWS: {
    category: "Cloud Integration",
    homepageFeatured: true,
    relatedProductSlugs: ["autopi-can-fd-pro"],
    tags: ["AWS", "CAN logging", "Cloud dashboards", "Telemetry"],
  },
  J1939_Telematics_Off_Highway_Machinery: {
    category: "Telematics",
    relatedProductSlugs: ["autopi-can-fd-pro"],
    tags: ["J1939", "Off-highway", "Remote diagnostics", "Fleet data"],
  },
  OPUS_A3_Integration_with_Cloud_Telemetry: {
    category: "HMI Systems",
    relatedProductSlugs: ["topcon-opus-a3e", "topcon-opus-a3s", "autopi-can-fd-pro"],
    tags: ["OPUS A3", "Cloud telemetry", "HMI", "CAN-Bus"],
  },
  Remote_Firmware_Updates_over_CANBus: {
    category: "CAN-Bus",
    relatedProductSlugs: ["autopi-can-fd-pro", "eltronic-iq-can-bus-module"],
    tags: ["Firmware", "CAN-Bus", "Remote support", "Lifecycle"],
  },
  Rugged_HMI_Systems_Harsh_Environments: {
    category: "HMI Systems",
    relatedProductSlugs: topconProductSlugs,
    tags: ["Rugged HMI", "Harsh environments", "Operator interface", "OEM"],
  },
  Safety_Considerations_for_Mobile_Machinery_Electronics: {
    category: "Functional Safety",
    relatedProductSlugs: ["eltronic-iq-can-bus-module", "topcon-opus-b6e"],
    tags: ["Safety", "Mobile machinery", "Electronics", "Risk"],
  },
  TOPCON_OPUS_HMI_Benefits_Article: {
    category: "HMI Systems",
    homepageFeatured: true,
    relatedProductSlugs: topconProductSlugs,
    tags: ["TOPCON OPUS", "HMI", "OEM", "Mobile machinery"],
  },
  Using_AutoPi_Remote_Diagnostics_Agriculture: {
    category: "Telematics",
    relatedProductSlugs: ["autopi-can-fd-pro"],
    tags: ["AutoPi", "Agriculture", "Remote diagnostics", "Maintenance"],
  },
  Why_OEMs_Move_from_Proprietary_Systems_to_CANopen: {
    category: "CAN-Bus",
    relatedProductSlugs: ["eltronic-iq-can-bus-module", "topcon-opus-b6e"],
    tags: ["CANopen", "OEM", "Interoperability", "Open systems"],
  },
};

if (!existsSync(sourceDir)) {
  throw new Error(`Source directory not found: ${sourceDir}`);
}

const files = execFileSync("find", [sourceDir, "-maxdepth", "1", "-type", "f", "-name", "*.docx"], {
  encoding: "utf8",
})
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean)
  .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

const articles = [];

for (const [index, filePath] of files.entries()) {
  const parsed = parseDocxArticle(filePath);
  const baseName = path.basename(filePath, ".docx");
  const plan = articlePlans[baseName] ?? {};
  const slug = slugify(parsed.title || baseName);
  const cleanFileName = normalizeFileName(path.basename(filePath));
  const folder = path.join(mediaRoot, slug);
  const publicSourceFileUrl = `/media/articles/${slug}/${cleanFileName}`;

  await mkdir(folder, { recursive: true });
  await copyFile(filePath, path.join(folder, cleanFileName));

  articles.push({
    slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    category: plan.category ?? inferCategory(parsed.title, parsed.body),
    status: "published",
    publishedAt: new Date(Date.UTC(2026, 4, 6, 12, index)).toISOString(),
    updatedAt: new Date().toISOString(),
    author: "Eltronic",
    tags: plan.tags ?? inferTags(parsed.title, parsed.body),
    relatedProductSlugs: plan.relatedProductSlugs ?? [],
    homepageFeatured: Boolean(plan.homepageFeatured),
    featured: Boolean(plan.homepageFeatured),
    sourceFileName: path.basename(filePath),
    sourceFileUrl: publicSourceFileUrl,
    heroImage: "",
    body: parsed.body,
  });
}

await writeFile(outputPath, `${JSON.stringify(articles, null, 2)}\n`);
console.log(`Imported ${articles.length} article${articles.length === 1 ? "" : "s"} into ${outputPath}`);

function parseDocxArticle(filePath) {
  const rawText = execFileSync("textutil", ["-convert", "txt", "-stdout", filePath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const lines = rawText
    .replace(/\u2028/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const dedupedLines = [];

  for (const line of lines) {
    if (dedupedLines.length === 1 && dedupedLines[0] === line) {
      continue;
    }

    dedupedLines.push(line);
  }

  const title = dedupedLines[0] ?? path.basename(filePath, ".docx");
  const bodyLines = dedupedLines.slice(1);
  const body = markdownFromLines(bodyLines);
  const excerpt = firstParagraph(bodyLines);

  return { title, excerpt, body };
}

function markdownFromLines(lines) {
  return lines
    .flatMap((line) => {
      if (line.startsWith("•")) {
        return [line.replace(/^•\s*/, "- ")];
      }

      if (line.includes("•")) {
        const [prefix, ...items] = line.split("•").map((item) => item.trim()).filter(Boolean);
        return [prefix, ...items.map((item) => `- ${item}`)];
      }

      if (line.endsWith(":") && line.length < 80) {
        return [`**${line}**`];
      }

      if (looksLikeHeading(line)) {
        return [`## ${line}`];
      }

      return [line];
    })
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

function looksLikeHeading(line) {
  return (
    line.length < 86 &&
    !/[.!?]$/.test(line) &&
    !line.startsWith("- ") &&
    !line.includes(" — ") &&
    !/^At ELTRONIC/i.test(line) &&
    line.split(/\s+/).length <= 9
  );
}

function firstParagraph(lines) {
  const paragraph = lines.find((line) => line.length > 90 && !line.startsWith("•")) ?? lines[0] ?? "";
  return truncate(paragraph.replace(/•/g, "").replace(/\s+/g, " "), 240);
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}...`;
}

function inferCategory(title, body) {
  const source = `${title} ${body}`.toLowerCase();

  if (source.includes("autopi") || source.includes("j1939") || source.includes("telematics")) return "Telematics";
  if (source.includes("cloud") || source.includes("aws")) return "Cloud Integration";
  if (source.includes("hmi") || source.includes("opus")) return "HMI Systems";
  if (source.includes("safety")) return "Functional Safety";
  if (source.includes("can")) return "CAN-Bus";
  return "Company";
}

function inferTags(title, body) {
  const source = `${title} ${body}`.toLowerCase();
  const tags = [];

  for (const [needle, label] of [
    ["autopi", "AutoPi"],
    ["topcon", "TOPCON"],
    ["opus", "OPUS HMI"],
    ["j1939", "J1939"],
    ["can-fd", "CAN-FD"],
    ["canopen", "CANopen"],
    ["cloud", "Cloud"],
    ["aws", "AWS"],
    ["safety", "Safety"],
    ["agric", "Agriculture"],
  ]) {
    if (source.includes(needle)) {
      tags.push(label);
    }
  }

  return tags.length > 0 ? tags : ["Eltronic"];
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFileName(fileName) {
  const extension = path.extname(fileName);
  const baseName = fileName.slice(0, fileName.length - extension.length);

  return `${baseName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")}${extension.toLowerCase()}`;
}
