import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { products as seededProducts, type Product, type ProductTemplate } from "@/content/products";

const DATA_KEY = "eltronic:managed-data:v1";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "eltronic-data.json");

export type ContactSubmissionStatus = "new" | "reviewed" | "replied" | "archived";

export type ContactSubmission = {
  id: string;
  name: string;
  company?: string;
  email: string;
  productSlug?: string;
  productName?: string;
  message: string;
  status: ContactSubmissionStatus;
  source: "website";
  createdAt: string;
  updatedAt: string;
};

type ManagedData = {
  products: Product[];
  submissions: ContactSubmission[];
  updatedAt: string;
};

const featuredProductSlugs = [
  "autopi-can-fd-pro",
  "topcon-opus-b6e",
  "topcon-opus-a8s",
  "eltronic-iq-can-bus-module",
];

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function createEmptyData(): ManagedData {
  return {
    products: seededProducts,
    submissions: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeData(data: Partial<ManagedData> | null | undefined): ManagedData {
  return {
    products: Array.isArray(data?.products) && data.products.length > 0 ? data.products : seededProducts,
    submissions: Array.isArray(data?.submissions) ? data.submissions : [],
    updatedAt: typeof data?.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
}

function getRedisClient() {
  const config = getRedisConfig();

  if (!config) {
    return null;
  }

  return new Redis(config);
}

function canWriteLocalData() {
  return process.env.NODE_ENV !== "production" || process.env.ELTRONIC_ALLOW_LOCAL_WRITES === "true";
}

export function hasPersistentStorage() {
  return Boolean(getRedisConfig());
}

export function getStorageMode() {
  if (hasPersistentStorage()) {
    return "Upstash/Vercel KV";
  }

  if (canWriteLocalData()) {
    return "local JSON";
  }

  return "read-only fallback";
}

async function readManagedData(): Promise<ManagedData> {
  const redis = getRedisClient();

  if (redis) {
    const remoteData = await redis.get<ManagedData>(DATA_KEY);
    return normalizeData(remoteData);
  }

  try {
    const file = await readFile(LOCAL_DATA_PATH, "utf8");
    return normalizeData(JSON.parse(file) as ManagedData);
  } catch {
    return createEmptyData();
  }
}

async function writeManagedData(data: ManagedData) {
  const redis = getRedisClient();
  const nextData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (redis) {
    await redis.set(DATA_KEY, nextData);
    return;
  }

  if (!canWriteLocalData()) {
    throw new Error(
      "Persistent storage is not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN on Vercel before writing admin data.",
    );
  }

  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, `${JSON.stringify(nextData, null, 2)}\n`);
}

export async function getProducts() {
  const data = await readManagedData();
  return data.products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

export async function getProductFamilies() {
  const products = await getProducts();
  return Array.from(new Set(products.map((product) => product.family)));
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  const featured = featuredProductSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));

  return featured.length > 0 ? featured : products.slice(0, 4);
}

export async function upsertProduct(product: Product, previousSlug?: string) {
  const data = await readManagedData();
  const slugToReplace = previousSlug || product.slug;
  const withoutExisting = data.products.filter((item) => item.slug !== slugToReplace && item.slug !== product.slug);

  await writeManagedData({
    ...data,
    products: [...withoutExisting, product].sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export async function deleteProduct(slug: string) {
  const data = await readManagedData();

  await writeManagedData({
    ...data,
    products: data.products.filter((product) => product.slug !== slug),
  });
}

export async function getSubmissions() {
  const data = await readManagedData();
  return [...data.submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createContactSubmission(input: {
  name: string;
  company?: string;
  email: string;
  productSlug?: string;
  message: string;
}) {
  const data = await readManagedData();
  const product = input.productSlug
    ? data.products.find((item) => item.slug === input.productSlug)
    : undefined;
  const now = new Date().toISOString();
  const submission: ContactSubmission = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    company: input.company?.trim() || undefined,
    email: input.email.trim(),
    productSlug: input.productSlug || undefined,
    productName: product?.name,
    message: input.message.trim(),
    status: "new",
    source: "website",
    createdAt: now,
    updatedAt: now,
  };

  await writeManagedData({
    ...data,
    submissions: [submission, ...data.submissions],
  });

  return submission;
}

export async function updateSubmissionStatus(id: string, status: ContactSubmissionStatus) {
  const data = await readManagedData();

  await writeManagedData({
    ...data,
    submissions: data.submissions.map((submission) =>
      submission.id === id
        ? {
            ...submission,
            status,
            updatedAt: new Date().toISOString(),
          }
        : submission,
    ),
  });
}

export async function deleteSubmission(id: string) {
  const data = await readManagedData();

  await writeManagedData({
    ...data,
    submissions: data.submissions.filter((submission) => submission.id !== id),
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseProductTemplate(value: FormDataEntryValue | null): ProductTemplate {
  const template = String(value ?? "");

  if (template === "data-logger" || template === "module") {
    return template;
  }

  return "hmi";
}

export function productFromFormData(formData: FormData): Product {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const documents = parseRows(formData.get("documents"), 2).map(([label, url]) => ({ label, url }));
  const variants = parseRows(formData.get("variants"), 3).map(([variantName, details, articleNumber]) => ({
    name: variantName,
    details,
    articleNumber: articleNumber || undefined,
  }));

  return {
    slug,
    name,
    category: String(formData.get("category") ?? "").trim(),
    family: String(formData.get("family") ?? "").trim(),
    template: parseProductTemplate(formData.get("template")),
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim(),
    image: {
      src: String(formData.get("imageSrc") ?? "").trim(),
      alt: String(formData.get("imageAlt") || name).trim(),
    },
    summary: String(formData.get("summary") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    highlights: parseLines(formData.get("highlights")),
    specifications: parseRows(formData.get("specifications"), 2).map(([label, value]) => ({ label, value })),
    documents: documents.length > 0 ? documents : undefined,
    variants: variants.length > 0 ? variants : undefined,
    enquiryPrompt: String(formData.get("enquiryPrompt") ?? "").trim(),
  };
}

function parseRows(value: FormDataEntryValue | null, columns: number) {
  return parseLines(value)
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .concat(Array.from({ length: columns }, () => "")),
    )
    .map((cells) => cells.slice(0, columns))
    .filter((cells) => cells[0] && cells[1]);
}
