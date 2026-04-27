import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import {
  productModuleDefinitions,
  products as seededProducts,
  type Product,
  type ProductImage,
  type ProductModules,
  type ProductTemplate,
  type ProductVariant,
} from "@/content/products";
import {
  defaultSiteBuilderSettings,
  type SiteBackgroundStyle,
  type SiteBuilderSection,
  type SiteBuilderSettings,
  type SiteHeroVisualVariant,
  type SiteThemePreset,
  type SiteVisualDensity,
} from "@/content/site-builder";

const DATA_KEY = "eltronic:managed-data:v1";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "eltronic-data.json");

export type ContactSubmissionStatus = "new" | "reviewed" | "replied" | "archived" | "blocked";
export type ContactSubmissionType = "enquiry" | "captcha_failed" | "honeypot_spam";

export type ContactSubmission = {
  id: string;
  name: string;
  company?: string;
  email: string;
  productSlug?: string;
  productName?: string;
  message: string;
  status: ContactSubmissionStatus;
  type: ContactSubmissionType;
  rejectionReason?: string;
  source: "website";
  createdAt: string;
  updatedAt: string;
};

type ManagedData = {
  products: Product[];
  siteBuilder: SiteBuilderSettings;
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
    products: normalizeProducts(seededProducts),
    siteBuilder: normalizeSiteBuilderSettings(),
    submissions: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeData(data: Partial<ManagedData> | null | undefined): ManagedData {
  return {
    products:
      Array.isArray(data?.products) && data.products.length > 0
        ? normalizeProducts(data.products)
        : normalizeProducts(seededProducts),
    siteBuilder: normalizeSiteBuilderSettings(data?.siteBuilder),
    submissions: Array.isArray(data?.submissions) ? normalizeSubmissions(data.submissions) : [],
    updatedAt: typeof data?.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
}

function normalizeProducts(products: Product[]) {
  return products.map((product) => {
    const images = getProductImages(product);

    return {
      ...product,
      image: images[0] ?? product.image,
      images,
      tags: Array.isArray(product.tags) ? product.tags.filter(Boolean) : [],
      modules: normalizeProductModules(product.modules),
    };
  });
}

function normalizeProductModules(modules?: Partial<ProductModules>): ProductModules {
  return productModuleDefinitions.reduce((current, module) => {
    current[module.key] = modules?.[module.key] ?? true;
    return current;
  }, {} as ProductModules);
}

function normalizeSubmissions(submissions: ContactSubmission[]): ContactSubmission[] {
  return submissions.map((submission) => ({
    ...submission,
    status: normalizeSubmissionStatus(submission.status),
    type: normalizeSubmissionType(submission.type),
  }));
}

function normalizeSiteBuilderSettings(settings?: Partial<SiteBuilderSettings> | null): SiteBuilderSettings {
  const defaults = defaultSiteBuilderSettings;
  const sectionsByKey = new Map(
    (Array.isArray(settings?.home?.sections) ? settings.home.sections : []).map((section) => [section.key, section]),
  );

  return {
    theme: {
      preset: normalizeThemePreset(settings?.theme?.preset),
      accentColor: normalizeHexColor(settings?.theme?.accentColor, defaults.theme.accentColor),
      secondaryColor: normalizeHexColor(settings?.theme?.secondaryColor, defaults.theme.secondaryColor),
      highlightColor: normalizeHexColor(settings?.theme?.highlightColor, defaults.theme.highlightColor),
      backgroundStyle: normalizeBackgroundStyle(settings?.theme?.backgroundStyle),
      visualDensity: normalizeVisualDensity(settings?.theme?.visualDensity),
    },
    home: {
      hero: {
        ...defaults.home.hero,
        ...settings?.home?.hero,
        rolePhrases: normalizeRolePhrases(settings?.home?.hero?.rolePhrases),
        visualVariant: normalizeHeroVisualVariant(settings?.home?.hero?.visualVariant),
      },
      sections: defaults.home.sections.map((defaultSection) =>
        normalizeBuilderSection(defaultSection, sectionsByKey.get(defaultSection.key)),
      ),
    },
  };
}

function normalizeBuilderSection(
  defaultSection: SiteBuilderSection,
  section?: Partial<SiteBuilderSection>,
): SiteBuilderSection {
  return {
    ...defaultSection,
    ...section,
    key: defaultSection.key,
    label: defaultSection.label,
    enabled: section?.enabled ?? defaultSection.enabled,
    order: normalizeOrder(section?.order, defaultSection.order),
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

export async function getSiteBuilderSettings() {
  const data = await readManagedData();
  return data.siteBuilder;
}

export async function updateSiteBuilderSettings(settings: SiteBuilderSettings) {
  const data = await readManagedData();

  await writeManagedData({
    ...data,
    siteBuilder: normalizeSiteBuilderSettings(settings),
  });
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

export function getProductImages(product: Product): ProductImage[] {
  const images = Array.isArray(product.images)
    ? product.images.filter((image) => image.src && !image.src.startsWith("/product-gallery/"))
    : [];
  const mergedImages =
    images.length > 0
      ? images
      : [product.image].filter((image) => image?.src && !image.src.startsWith("/product-gallery/"));

  return mergedImages
    .filter((image, index, gallery) => gallery.findIndex((item) => item.src === image.src) === index)
    .map((image) => ({
      src: image.src,
      alt: image.alt || product.name,
    }));
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
    type: "enquiry",
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

export async function createBlockedContactSubmission(input: {
  name?: string;
  company?: string;
  email?: string;
  productSlug?: string;
  message?: string;
  rejectionReason: string;
  type: Exclude<ContactSubmissionType, "enquiry">;
}) {
  const data = await readManagedData();
  const product = input.productSlug
    ? data.products.find((item) => item.slug === input.productSlug)
    : undefined;
  const now = new Date().toISOString();
  const submission: ContactSubmission = {
    id: crypto.randomUUID(),
    name: input.name?.trim() || "Blocked visitor",
    company: input.company?.trim() || undefined,
    email: input.email?.trim() || "blocked@example.invalid",
    productSlug: input.productSlug || undefined,
    productName: product?.name,
    message: input.message?.trim() || "Blocked before a valid enquiry was created.",
    status: "blocked",
    type: input.type,
    rejectionReason: input.rejectionReason,
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

export function siteBuilderFromFormData(formData: FormData): SiteBuilderSettings {
  const defaults = defaultSiteBuilderSettings;

  return normalizeSiteBuilderSettings({
    theme: {
      preset: String(formData.get("themePreset") ?? defaults.theme.preset) as SiteThemePreset,
      accentColor: String(formData.get("accentColor") ?? defaults.theme.accentColor),
      secondaryColor: String(formData.get("secondaryColor") ?? defaults.theme.secondaryColor),
      highlightColor: String(formData.get("highlightColor") ?? defaults.theme.highlightColor),
      backgroundStyle: String(formData.get("backgroundStyle") ?? defaults.theme.backgroundStyle) as SiteBackgroundStyle,
      visualDensity: String(formData.get("visualDensity") ?? defaults.theme.visualDensity) as SiteVisualDensity,
    },
    home: {
      hero: {
        brand: getFormText(formData, "heroBrand", defaults.home.hero.brand),
        titleSuffix: getFormText(formData, "heroTitleSuffix", defaults.home.hero.titleSuffix),
        rolePhrases: parseLines(formData.get("heroRolePhrases")),
        lede: getFormText(formData, "heroLede", defaults.home.hero.lede),
        primaryCtaLabel: getFormText(formData, "heroPrimaryCtaLabel", defaults.home.hero.primaryCtaLabel),
        primaryCtaHref: getFormText(formData, "heroPrimaryCtaHref", defaults.home.hero.primaryCtaHref),
        secondaryCtaLabel: getFormText(formData, "heroSecondaryCtaLabel", defaults.home.hero.secondaryCtaLabel),
        secondaryCtaHref: getFormText(formData, "heroSecondaryCtaHref", defaults.home.hero.secondaryCtaHref),
        visualLabel: getFormText(formData, "heroVisualLabel", defaults.home.hero.visualLabel),
        visualVariant: String(formData.get("heroVisualVariant") ?? defaults.home.hero.visualVariant) as SiteHeroVisualVariant,
      },
      sections: defaults.home.sections.map((section) => {
        const key = section.key;

        return {
          ...section,
          enabled: formData.get(`sectionEnabled:${key}`) === "on",
          order: Number(formData.get(`sectionOrder:${key}`) ?? section.order),
          eyebrow: getFormText(formData, `sectionEyebrow:${key}`, section.eyebrow),
          title: getFormText(formData, `sectionTitle:${key}`, section.title),
          summary: getFormText(formData, `sectionSummary:${key}`, section.summary),
          ctaLabel: getOptionalFormText(formData, `sectionCtaLabel:${key}`, section.ctaLabel),
          ctaHref: getOptionalFormText(formData, `sectionCtaHref:${key}`, section.ctaHref),
          panelEyebrow: getOptionalFormText(formData, `sectionPanelEyebrow:${key}`, section.panelEyebrow),
          panelTitle: getOptionalFormText(formData, `sectionPanelTitle:${key}`, section.panelTitle),
          panelSummary: getOptionalFormText(formData, `sectionPanelSummary:${key}`, section.panelSummary),
        };
      }),
    },
  });
}

export function productFromFormData(formData: FormData): Product {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const documents = parseRows(formData.get("documents"), 2).map(([label, url]) => ({ label, url }));
  const variants = parseProductVariants(formData.get("variants"));
  const parsedImages = parseProductImages(formData, name);
  const legacyImages = parseRows(formData.get("images"), 2).map(([src, alt]) => ({
    src,
    alt: alt || name,
  }));
  const fallbackImage = {
    src: String(formData.get("imageSrc") ?? "").trim(),
    alt: String(formData.get("imageAlt") || name).trim(),
  };
  const images =
    parsedImages.length > 0
      ? parsedImages
      : legacyImages.length > 0
        ? legacyImages
        : [fallbackImage].filter((image) => image.src);
  const primaryImage = images[0] ?? fallbackImage;

  return {
    slug,
    name,
    category: String(formData.get("category") ?? "").trim(),
    family: String(formData.get("family") ?? "").trim(),
    template: parseProductTemplate(formData.get("template")),
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim() || undefined,
    price: String(formData.get("price") ?? "").trim() || undefined,
    tags: parseTags(formData.get("tags")),
    modules: parseProductModules(formData),
    image: primaryImage,
    images,
    summary: String(formData.get("summary") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    highlights: parseLines(formData.get("highlights")),
    specifications: parseRows(formData.get("specifications"), 2).map(([label, value]) => ({ label, value })),
    documents: documents.length > 0 ? documents : undefined,
    variants: variants.length > 0 ? variants : undefined,
    enquiryPrompt: String(formData.get("enquiryPrompt") ?? "").trim(),
  };
}

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseProductModules(formData: FormData): ProductModules {
  const enabledModules = new Set(formData.getAll("enabledModules").map((value) => String(value)));

  return productModuleDefinitions.reduce((current, module) => {
    current[module.key] = enabledModules.has(module.key);
    return current;
  }, {} as ProductModules);
}

function parseProductVariants(value: FormDataEntryValue | null): ProductVariant[] {
  return parseLines(value)
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .map((cells) => {
      const [name, second = "", third = "", fourth = "", fifth = ""] = cells;

      if (cells.length >= 5) {
        return {
          name,
          sku: second || undefined,
          price: third || undefined,
          details: fourth,
          articleNumber: fifth || undefined,
        };
      }

      return {
        name,
        details: second,
        articleNumber: third || undefined,
      };
    })
    .filter((variant) => variant.name && (variant.details || variant.sku || variant.price || variant.articleNumber));
}

function parseProductImages(formData: FormData, fallbackAlt: string): ProductImage[] {
  const sources = formData.getAll("imageSrc").map((value) => String(value ?? "").trim());
  const alts = formData.getAll("imageAlt").map((value) => String(value ?? "").trim());

  return sources
    .map((src, index) => ({
      src,
      alt: alts[index] || fallbackAlt,
    }))
    .filter((image) => image.src);
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

function getFormText(formData: FormData, key: string, fallback: string) {
  return String(formData.get(key) ?? "").trim() || fallback;
}

function getOptionalFormText(formData: FormData, key: string, fallback?: string) {
  return String(formData.get(key) ?? "").trim() || fallback;
}

function normalizeHexColor(value: unknown, fallback: string) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function normalizeThemePreset(value: unknown): SiteThemePreset {
  const preset = String(value ?? "");

  if (preset === "halogen" || preset === "graphite" || preset === "clean") {
    return preset;
  }

  return "eltronic";
}

function normalizeBackgroundStyle(value: unknown): SiteBackgroundStyle {
  const style = String(value ?? "");

  if (style === "soft" || style === "minimal") {
    return style;
  }

  return "grid";
}

function normalizeVisualDensity(value: unknown): SiteVisualDensity {
  const density = String(value ?? "");

  if (density === "compact" || density === "spacious") {
    return density;
  }

  return "balanced";
}

function normalizeHeroVisualVariant(value: unknown): SiteHeroVisualVariant {
  const variant = String(value ?? "");

  if (variant === "network" || variant === "sectors" || variant === "data") {
    return variant;
  }

  return "display";
}

function normalizeRolePhrases(value: unknown) {
  if (Array.isArray(value)) {
    const roles = value.map((role) => String(role).trim()).filter(Boolean);
    return roles.length > 0 ? roles : defaultSiteBuilderSettings.home.hero.rolePhrases;
  }

  return defaultSiteBuilderSettings.home.hero.rolePhrases;
}

function normalizeOrder(value: unknown, fallback: number) {
  const order = Number(value);
  return Number.isFinite(order) && order > 0 ? order : fallback;
}

function normalizeSubmissionStatus(value: unknown): ContactSubmissionStatus {
  const status = String(value ?? "");

  if (status === "reviewed" || status === "replied" || status === "archived" || status === "blocked") {
    return status;
  }

  return "new";
}

function normalizeSubmissionType(value: unknown): ContactSubmissionType {
  const type = String(value ?? "");

  if (type === "captcha_failed" || type === "honeypot_spam") {
    return type;
  }

  return "enquiry";
}
