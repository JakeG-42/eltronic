import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import {
  normalizeProductTemplate,
  productModuleDefinitions,
  products as seededProducts,
  type Product,
  type ProductDocument,
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
import {
  createSeedAdminUsers,
  hashAdminPassword,
  normalizeAdminRole,
  normalizeAdminStatus,
  normalizeAdminUsers,
  toPublicAdminUser,
  verifyAdminPassword,
  type AdminRole,
  type AdminUser,
  type AdminUserStatus,
} from "@/lib/admin-user-model";

const DATA_KEY = "eltronic:managed-data:v1";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "eltronic-data.json");
const POSTGRES_TABLE_NAME = "eltronic_managed_data";
const BLOCKED_SUBMISSION_DEDUPE_WINDOW_MS = 5000;
const DEFAULT_CONTACT_NOTIFICATION_TO = "jakub@gajosz.com";

export type ContactSubmissionStatus = "new" | "reviewed" | "replied" | "archived" | "blocked";
export type ContactSubmissionType = "enquiry" | "captcha_failed" | "honeypot_spam";
export type ContactNotificationMode = "immediate" | "daily_digest" | "weekly_digest" | "off";

export type ContactNotificationSettings = {
  lastDigestSentAt?: string;
  mode: ContactNotificationMode;
  recipients: string[];
};

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

export type ContactSubmissionWriteResult = {
  created: boolean;
  submission: ContactSubmission;
};

type ManagedData = {
  adminUsers: AdminUser[];
  contactNotifications: ContactNotificationSettings;
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

function getPostgresConnectionString() {
  const directConnection =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (directConnection) {
    return directConnection;
  }

  return getPrefixedPostgresConnectionString();
}

function getPrefixedPostgresConnectionString() {
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

function createEmptyData(): ManagedData {
  return {
    adminUsers: createSeedAdminUsers(),
    contactNotifications: getDefaultContactNotificationSettings(),
    products: normalizeProducts(seededProducts),
    siteBuilder: normalizeSiteBuilderSettings(),
    submissions: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeData(data: Partial<ManagedData> | null | undefined): ManagedData {
  return {
    adminUsers: normalizeAdminUsers(data?.adminUsers),
    contactNotifications: normalizeContactNotificationSettings(data?.contactNotifications),
    products:
      Array.isArray(data?.products) && data.products.length > 0
        ? normalizeProducts(data.products)
        : normalizeProducts(seededProducts),
    siteBuilder: normalizeSiteBuilderSettings(data?.siteBuilder),
    submissions: Array.isArray(data?.submissions) ? normalizeSubmissions(data.submissions) : [],
    updatedAt: typeof data?.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
}

function getDefaultContactNotificationSettings(): ContactNotificationSettings {
  return {
    mode: "immediate",
    recipients: getDefaultContactNotificationRecipients(),
  };
}

function getDefaultContactNotificationRecipients() {
  const envRecipients = parseContactNotificationRecipients(process.env.CONTACT_NOTIFICATION_TO);

  return envRecipients.length > 0 ? envRecipients : [DEFAULT_CONTACT_NOTIFICATION_TO];
}

function parseContactNotificationRecipients(value?: string) {
  return (value ?? "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function normalizeContactNotificationSettings(settings?: {
  lastDigestSentAt?: unknown;
  mode?: unknown;
  recipients?: unknown;
} | null): ContactNotificationSettings {
  const defaults = getDefaultContactNotificationSettings();
  const recipients = Array.isArray(settings?.recipients)
    ? settings.recipients.map((recipient) => recipient.trim()).filter(Boolean)
    : defaults.recipients;

  return {
    lastDigestSentAt: typeof settings?.lastDigestSentAt === "string" ? settings.lastDigestSentAt : undefined,
    mode: normalizeContactNotificationMode(settings?.mode),
    recipients: recipients.length > 0 ? recipients : defaults.recipients,
  };
}

function normalizeProducts(products: Product[]) {
  return products.map((storedProduct) => {
    const product = normalizeLaunchProductContent(storedProduct);
    const images = getProductImages(product);

    return {
      ...product,
      template: normalizeProductTemplate(product.template),
      image: images[0] ?? product.image,
      images,
      documents: normalizeProductDocuments(product.documents),
      tags: Array.isArray(product.tags) ? product.tags.filter(Boolean) : [],
      modules: normalizeProductModules(product.modules),
    };
  });
}

function normalizeLaunchProductContent(product: Product): Product {
  if (product.slug !== "eltronic-iq-can-bus-module") {
    return product;
  }

  const containsUnfinishedCopy =
    product.highlights.some((highlight) => /owned product page|technical data sections/i.test(highlight)) ||
    product.variants?.some((variant) => /to be updated|tbu/i.test(`${variant.details} ${variant.articleNumber}`));

  if (!containsUnfinishedCopy) {
    return product;
  }

  return {
    ...product,
    summary:
      "Application-specific CAN-Bus I/O expansion for control projects that need extra inputs, outputs or interface points.",
    description:
      "The I&Q CAN-Bus I/O Module supports control-system expansion where additional equipment inputs, outputs and CAN connectivity need to be specified around the application, enclosure, operator interface and support requirements.",
    highlights: [
      "CAN-Bus I/O expansion for application-specific control projects",
      "Useful where additional signals, operator controls or interface points need to be brought into a wider system",
      "Configuration, housing and connection details are confirmed during technical enquiry",
    ],
    specifications: [
      { label: "Product family", value: "Eltronic CAN-Bus I/O expansion" },
      { label: "Interface", value: "CAN-Bus control-system integration" },
      { label: "Housing", value: "Specified around the operating environment" },
      { label: "User interface", value: "Defined during project scoping" },
      { label: "Configuration", value: "Confirmed against I/O, wiring and support requirements" },
    ],
    variants: undefined,
  };
}

function normalizeProductDocuments(documents?: ProductDocument[]) {
  if (!Array.isArray(documents)) {
    return undefined;
  }

  const normalizedDocuments = documents.filter(
    (document, index, list) =>
      document.label &&
      document.url &&
      list.findIndex((item) => item.url === document.url && (item.url === "/contact" || item.label === document.label)) ===
        index,
  );

  return normalizedDocuments.length > 0 ? normalizedDocuments : undefined;
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
  const savedHero = settings?.home?.hero;

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
      hero: normalizeBuilderHero(savedHero),
      sections: defaults.home.sections.map((defaultSection) =>
        normalizeBuilderSection(defaultSection, sectionsByKey.get(defaultSection.key)),
      ),
    },
  };
}

const legacyBuilderHeroValues = {
  lede: [
    "Intelligent HMI displays, CAN data logging, custom harnesses and full-stack software integration for mobile equipment, fixed installations and specialist vehicles.",
    "Intelligent HMI displays, CAN data logging, custom harnesses and software integration for mobile equipment, fixed installations and specialist vehicles.",
  ],
  primaryCtaHref: ["/products"],
  primaryCtaLabel: ["Browse products"],
  rolePhrases: [
    "systems integrator|systems consultant|control systems partner|software systems engineer",
    "systems integrator|systems consultant|control systems partner|software integration support",
  ],
  secondaryCtaHref: ["/contact"],
  secondaryCtaLabel: ["Start an enquiry"],
  visualLabel: ["HMI, CAN-Bus and control-system architecture"],
};

const legacyBuilderSectionValues: Partial<
  Record<
    SiteBuilderSection["key"],
    Partial<Record<"ctaLabel" | "panelEyebrow" | "panelSummary" | "panelTitle" | "summary" | "title", string[]>>
  >
> = {
  products: {
    summary: ["A focused selection of displays, data logging tools and control modules for quote-led equipment projects."],
    title: ["Featured products"],
  },
  sectors: {
    panelTitle: ["Application sectors"],
    summary: [
      "Agriculture, construction, logistics and industrial automation each have different pressures around reliability, operator feedback and maintainable control systems.",
    ],
    title: ["Application sectors"],
  },
  services: {
    ctaLabel: ["Explore solutions"],
    summary: [
      "Rugged HMIs, CAN data capture and bespoke integration work come together around the operator, environment and project requirement.",
    ],
    title: ["Application-ready systems"],
  },
  software: {
    ctaLabel: ["Explore Software & Systems"],
    panelEyebrow: ["software.systems"],
    panelSummary: [
      "From shipping and CRM integrations to MQTT services, HTTP APIs, internal servers, dashboards and connected hardware workflows, Eltronic helps reduce errors, manual admin and wasted time.",
    ],
    panelTitle: ["Internal platforms, data and connected devices."],
    summary: [
      "Full-stack internal platforms, API integration, embedded services and technical consultancy for more efficient operations.",
      "Bespoke internal systems, API integration, embedded services and practical consulting for more efficient operations.",
    ],
    title: ["Software, systems and device integration", "Software and systems integration"],
  },
  workflow: {
    summary: [
      "The engineering can be detailed. The customer experience should still feel clear, structured and easy to move through.",
    ],
    title: ["Complex projects, made straightforward"],
  },
};

function normalizeBuilderHero(hero?: Partial<SiteBuilderSettings["home"]["hero"]>) {
  const defaults = defaultSiteBuilderSettings.home.hero;
  const rolePhrases = normalizeRolePhrases(hero?.rolePhrases);

  return {
    ...defaults,
    ...hero,
    lede: replaceLegacyBuilderValue(hero?.lede, defaults.lede, legacyBuilderHeroValues.lede),
    primaryCtaHref: replaceLegacyBuilderValue(
      hero?.primaryCtaHref,
      defaults.primaryCtaHref,
      legacyBuilderHeroValues.primaryCtaHref,
    ),
    primaryCtaLabel: replaceLegacyBuilderValue(
      hero?.primaryCtaLabel,
      defaults.primaryCtaLabel,
      legacyBuilderHeroValues.primaryCtaLabel,
    ),
    rolePhrases:
      legacyBuilderHeroValues.rolePhrases.includes(rolePhrases.join("|")) ? defaults.rolePhrases : rolePhrases,
    secondaryCtaHref: replaceLegacyBuilderValue(
      hero?.secondaryCtaHref,
      defaults.secondaryCtaHref,
      legacyBuilderHeroValues.secondaryCtaHref,
    ),
    secondaryCtaLabel: replaceLegacyBuilderValue(
      hero?.secondaryCtaLabel,
      defaults.secondaryCtaLabel,
      legacyBuilderHeroValues.secondaryCtaLabel,
    ),
    visualLabel: replaceLegacyBuilderValue(hero?.visualLabel, defaults.visualLabel, legacyBuilderHeroValues.visualLabel),
    visualVariant: normalizeHeroVisualVariant(hero?.visualVariant),
  };
}

function normalizeBuilderSection(
  defaultSection: SiteBuilderSection,
  section?: Partial<SiteBuilderSection>,
): SiteBuilderSection {
  const legacyValues = legacyBuilderSectionValues[defaultSection.key] ?? {};

  return {
    ...defaultSection,
    ...section,
    key: defaultSection.key,
    label: defaultSection.label,
    ctaLabel: replaceLegacyOptionalBuilderValue(section?.ctaLabel, defaultSection.ctaLabel, legacyValues.ctaLabel),
    enabled: section?.enabled ?? defaultSection.enabled,
    order: normalizeOrder(section?.order, defaultSection.order),
    panelEyebrow: replaceLegacyOptionalBuilderValue(
      section?.panelEyebrow,
      defaultSection.panelEyebrow,
      legacyValues.panelEyebrow,
    ),
    panelSummary: replaceLegacyOptionalBuilderValue(
      section?.panelSummary,
      defaultSection.panelSummary,
      legacyValues.panelSummary,
    ),
    panelTitle: replaceLegacyOptionalBuilderValue(section?.panelTitle, defaultSection.panelTitle, legacyValues.panelTitle),
    summary: replaceLegacyBuilderValue(section?.summary, defaultSection.summary, legacyValues.summary),
    title: replaceLegacyBuilderValue(section?.title, defaultSection.title, legacyValues.title),
  };
}

function replaceLegacyBuilderValue(value: unknown, fallback: string, legacyValues?: string[]) {
  const text = typeof value === "string" ? value : fallback;

  return legacyValues?.includes(text) ? fallback : text;
}

function replaceLegacyOptionalBuilderValue(value: unknown, fallback?: string, legacyValues?: string[]) {
  if (typeof value !== "string") {
    return fallback;
  }

  return legacyValues?.includes(value) ? fallback : value;
}

function getRedisClient() {
  const config = getRedisConfig();

  if (!config) {
    return null;
  }

  return new Redis(config);
}

function getPostgresClient() {
  const connectionString = getPostgresConnectionString();

  if (!connectionString) {
    return null;
  }

  return neon(connectionString);
}

type NeonSql = NeonQueryFunction<false, false>;

async function ensurePostgresDataTable(sql: NeonSql) {
  await sql`
    CREATE TABLE IF NOT EXISTS eltronic_managed_data (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

async function readPostgresManagedData(sql: NeonSql) {
  await ensurePostgresDataTable(sql);

  const rows = (await sql.query(`SELECT data FROM ${POSTGRES_TABLE_NAME} WHERE id = $1 LIMIT 1`, [
    DATA_KEY,
  ])) as Array<{ data: ManagedData | string | null }>;

  const rowData = rows[0]?.data;

  if (typeof rowData === "string") {
    return normalizeData(JSON.parse(rowData) as ManagedData);
  }

  return normalizeData(rowData);
}

async function writePostgresManagedData(sql: NeonSql, data: ManagedData) {
  await ensurePostgresDataTable(sql);
  await sql.query(
    `
      INSERT INTO eltronic_managed_data (id, data, updated_at)
      VALUES ($1, $2::jsonb, now())
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `,
    [DATA_KEY, JSON.stringify(data)],
  );
}

function canWriteLocalData() {
  return process.env.NODE_ENV !== "production" || process.env.ELTRONIC_ALLOW_LOCAL_WRITES === "true";
}

export function hasPersistentStorage() {
  return Boolean(getPostgresConnectionString() || getRedisConfig());
}

export function getStorageMode() {
  if (getPostgresConnectionString()) {
    return "Neon/Postgres";
  }

  if (getRedisConfig()) {
    return "Upstash/Vercel KV";
  }

  if (canWriteLocalData()) {
    return "local JSON";
  }

  return "read-only fallback";
}

async function readManagedData(): Promise<ManagedData> {
  const postgres = getPostgresClient();

  if (postgres) {
    return readPostgresManagedData(postgres);
  }

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
  const postgres = getPostgresClient();
  const redis = getRedisClient();
  const nextData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (postgres) {
    await writePostgresManagedData(postgres, nextData);
    return;
  }

  if (redis) {
    await redis.set(DATA_KEY, nextData);
    return;
  }

  if (!canWriteLocalData()) {
    throw new Error(
      "Persistent storage is not configured. Add DATABASE_URL for Neon/Postgres or KV_REST_API_URL and KV_REST_API_TOKEN for Redis before writing admin data.",
    );
  }

  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, `${JSON.stringify(nextData, null, 2)}\n`);
}

export async function getProducts() {
  const data = await readManagedData();
  return data.products;
}

export async function getAdminUsers() {
  const data = await readManagedData();
  return data.adminUsers;
}

export async function getPublicAdminUsers() {
  const users = await getAdminUsers();
  return users.map(toPublicAdminUser).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getAdminUserById(id: string) {
  const users = await getAdminUsers();
  return users.find((user) => user.id === id);
}

export async function findAdminUserByIdentifier(identifier: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const users = await getAdminUsers();

  return users.find(
    (user) => user.username.toLowerCase() === normalizedIdentifier || user.email.toLowerCase() === normalizedIdentifier,
  );
}

export async function saveAdminUser(input: {
  displayName: string;
  email: string;
  id?: string;
  password?: string;
  role: AdminRole;
  status: AdminUserStatus;
  username: string;
}) {
  const data = await readManagedData();
  const now = new Date().toISOString();
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedUsername = input.username.trim().toLowerCase() || normalizedEmail;
  const existing = input.id ? data.adminUsers.find((user) => user.id === input.id) : undefined;

  if (!normalizedEmail || !normalizedUsername || !input.displayName.trim()) {
    throw new Error("Name, email and username are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("A valid email address is required.");
  }

  const duplicate = data.adminUsers.find(
    (user) =>
      user.id !== input.id &&
      (user.email.toLowerCase() === normalizedEmail || user.username.toLowerCase() === normalizedUsername),
  );

  if (duplicate) {
    throw new Error("Another user already uses that email or username.");
  }

  if (!existing && !input.password) {
    throw new Error("A password is required for new users.");
  }

  const nextUser: AdminUser = {
    createdAt: existing?.createdAt ?? now,
    displayName: input.displayName.trim(),
    email: normalizedEmail,
    id: existing?.id ?? crypto.randomUUID(),
    passwordHash: input.password ? hashAdminPassword(input.password) : existing?.passwordHash ?? "",
    role: normalizeAdminRole(input.role),
    sessionVersion: input.password ? crypto.randomUUID() : existing?.sessionVersion ?? crypto.randomUUID(),
    status: normalizeAdminStatus(input.status),
    updatedAt: now,
    username: normalizedUsername,
  };

  const nextUsers = existing
    ? data.adminUsers.map((user) => (user.id === existing.id ? nextUser : user))
    : [...data.adminUsers, nextUser];

  ensureElevatedAdminRemains(nextUsers);
  await writeManagedData({
    ...data,
    adminUsers: nextUsers,
  });

  return toPublicAdminUser(nextUser);
}

export async function updateOwnAdminAccount(input: {
  currentPassword?: string;
  displayName: string;
  email: string;
  id: string;
  newPassword?: string;
  username: string;
}) {
  const existing = await getAdminUserById(input.id);

  if (!existing) {
    throw new Error("Your account could not be found.");
  }

  if (input.newPassword && !input.currentPassword) {
    throw new Error("Enter your current password before setting a new password.");
  }

  if (input.newPassword && !verifyAdminPassword(input.currentPassword ?? "", existing.passwordHash)) {
    throw new Error("Current password did not match.");
  }

  return saveAdminUser({
    displayName: input.displayName,
    email: input.email,
    id: input.id,
    password: input.newPassword,
    role: existing.role,
    status: existing.status,
    username: input.username,
  });
}

export async function deleteAdminUser(id: string) {
  const data = await readManagedData();
  const nextUsers = data.adminUsers.filter((user) => user.id !== id);

  if (nextUsers.length === data.adminUsers.length) {
    throw new Error("User not found.");
  }

  ensureElevatedAdminRemains(nextUsers);
  await writeManagedData({
    ...data,
    adminUsers: nextUsers,
  });
}

export async function getSiteBuilderSettings() {
  const data = await readManagedData();
  return data.siteBuilder;
}

export async function getContactNotificationSettings() {
  const data = await readManagedData();
  return data.contactNotifications;
}

export async function updateContactNotificationSettings(settings: ContactNotificationSettings) {
  const data = await readManagedData();

  await writeManagedData({
    ...data,
    contactNotifications: normalizeContactNotificationSettings({
      ...settings,
      lastDigestSentAt: data.contactNotifications.lastDigestSentAt,
    }),
  });
}

export async function getContactDigestSubmissions() {
  const data = await readManagedData();
  const settings = data.contactNotifications;
  const now = new Date();
  const windowMs = settings.mode === "weekly_digest" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const since = settings.lastDigestSentAt ? new Date(settings.lastDigestSentAt) : new Date(now.getTime() - windowMs);

  return data.submissions
    .filter((submission) => new Date(submission.createdAt) > since)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markContactDigestSent(sentAt = new Date().toISOString()) {
  const data = await readManagedData();

  await writeManagedData({
    ...data,
    contactNotifications: normalizeContactNotificationSettings({
      ...data.contactNotifications,
      lastDigestSentAt: sentAt,
    }),
  });
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

export function getProductMediaReferenceId(productSlug: string, src: string) {
  const sourceHash = createHash("sha256").update(src).digest("base64url").slice(0, 18);

  return `${productSlug}:${sourceHash}`;
}

export function getProductImages(product: Product): ProductImage[] {
  const images = Array.isArray(product.images)
    ? product.images.filter((image) => image.src && isPublicProductImage(image.src))
    : [];
  const mergedImages =
    images.length > 0
      ? images
      : [product.image].filter((image) => image?.src && isPublicProductImage(image.src));

  return mergedImages
    .filter((image, index, gallery) => gallery.findIndex((item) => item.src === image.src) === index)
    .map((image) => ({
      src: image.src,
      alt: image.alt || product.name,
      fileName: image.fileName,
    }));
}

function isPublicProductImage(src: string) {
  return !src.startsWith("/product-gallery/") && !src.startsWith("/product-images/placeholders/");
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

export async function deleteProductMediaReferences(mediaIds: string[]) {
  const targetIds = new Set(mediaIds.map((id) => id.trim()).filter(Boolean));

  if (targetIds.size === 0) {
    return { deleted: 0, skipped: 0 };
  }

  const data = await readManagedData();
  let deleted = 0;
  let skipped = 0;

  const products = data.products.map((product) => {
    const currentImages = getProductImages(product);
    const nextImages = currentImages.filter(
      (image) => !targetIds.has(getProductMediaReferenceId(product.slug, image.src)),
    );
    const removedCount = currentImages.length - nextImages.length;

    if (removedCount === 0) {
      return product;
    }

    if (nextImages.length === 0) {
      skipped += removedCount;
      return product;
    }

    deleted += removedCount;

    return {
      ...product,
      image: nextImages[0],
      images: nextImages,
    };
  });

  if (deleted > 0) {
    await writeManagedData({
      ...data,
      products,
    });
  }

  return { deleted, skipped };
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
}): Promise<ContactSubmissionWriteResult> {
  const data = await readManagedData();
  const product = input.productSlug
    ? data.products.find((item) => item.slug === input.productSlug)
    : undefined;
  const now = new Date().toISOString();
  const normalizedSubmission = {
    company: input.company?.trim() || undefined,
    email: input.email?.trim() || "blocked@example.invalid",
    message: input.message?.trim() || "Blocked before a valid enquiry was created.",
    name: input.name?.trim() || "Blocked visitor",
    productSlug: input.productSlug || undefined,
    rejectionReason: input.rejectionReason,
    type: input.type,
  };
  const recentDuplicate = data.submissions.find((submission) => {
    if (submission.type !== normalizedSubmission.type || submission.status !== "blocked") {
      return false;
    }

    return (
      submission.email === normalizedSubmission.email &&
      submission.message === normalizedSubmission.message &&
      submission.name === normalizedSubmission.name &&
      submission.productSlug === normalizedSubmission.productSlug &&
      submission.rejectionReason === normalizedSubmission.rejectionReason &&
      Date.parse(now) - Date.parse(submission.createdAt) <= BLOCKED_SUBMISSION_DEDUPE_WINDOW_MS
    );
  });

  if (recentDuplicate) {
    return {
      created: false,
      submission: recentDuplicate,
    };
  }

  const submission: ContactSubmission = {
    id: crypto.randomUUID(),
    name: normalizedSubmission.name,
    company: normalizedSubmission.company,
    email: normalizedSubmission.email,
    productSlug: normalizedSubmission.productSlug,
    productName: product?.name,
    message: normalizedSubmission.message,
    status: "blocked",
    type: normalizedSubmission.type,
    rejectionReason: normalizedSubmission.rejectionReason,
    source: "website",
    createdAt: now,
    updatedAt: now,
  };

  await writeManagedData({
    ...data,
    submissions: [submission, ...data.submissions],
  });

  return {
    created: true,
    submission,
  };
}

export async function updateSubmissionStatus(id: string, status: ContactSubmissionStatus) {
  await updateSubmissionStatuses([id], status);
}

export async function updateSubmissionStatuses(ids: string[], status: ContactSubmissionStatus) {
  const data = await readManagedData();
  const selectedIds = new Set(ids.filter(Boolean));

  if (selectedIds.size === 0) {
    return;
  }

  await writeManagedData({
    ...data,
    submissions: data.submissions.map((submission) =>
      selectedIds.has(submission.id)
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
  await deleteSubmissions([id]);
}

export async function deleteSubmissions(ids: string[]) {
  const data = await readManagedData();
  const selectedIds = new Set(ids.filter(Boolean));

  if (selectedIds.size === 0) {
    return;
  }

  await writeManagedData({
    ...data,
    submissions: data.submissions.filter((submission) => !selectedIds.has(submission.id)),
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
  return normalizeProductTemplate(value);
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

export function contactNotificationSettingsFromFormData(formData: FormData): ContactNotificationSettings {
  return normalizeContactNotificationSettings({
    mode: String(formData.get("notificationMode") ?? "immediate"),
    recipients: String(formData.get("notificationRecipients") ?? "")
      .split(",")
      .map((recipient) => recipient.trim())
      .filter(Boolean),
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
  const serializedImages = parseSerializedProductImages(formData.get("galleryImagesJson"), fallbackAlt);

  if (serializedImages.length > 0) {
    return serializedImages;
  }

  const sources = formData.getAll("imageSrc").map((value) => String(value ?? "").trim());
  const alts = formData.getAll("imageAlt").map((value) => String(value ?? "").trim());
  const fileNames = formData.getAll("imageFileName").map((value) => String(value ?? "").trim());

  return sources
    .map((src, index) => {
      const image: ProductImage = {
        src,
        alt: alts[index] || fallbackAlt,
      };
      const fileName = normalizeStoredImageFileName(fileNames[index]);

      if (fileName) {
        image.fileName = fileName;
      }

      return image;
    })
    .filter((image) => image.src);
}

function parseSerializedProductImages(value: FormDataEntryValue | null, fallbackAlt: string): ProductImage[] {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((image): ProductImage | null => {
        if (!image || typeof image !== "object") {
          return null;
        }

        const source = "src" in image ? String(image.src ?? "").trim() : "";
        const alt = "alt" in image ? String(image.alt ?? "").trim() : "";
        const fileName = "fileName" in image ? String(image.fileName ?? "").trim() : "";

        if (!source) {
          return null;
        }

        const nextImage: ProductImage = {
          src: source,
          alt: alt || fallbackAlt,
        };
        const normalizedFileName = normalizeStoredImageFileName(fileName);

        if (normalizedFileName) {
          nextImage.fileName = normalizedFileName;
        }

        return nextImage;
      })
      .filter((image): image is ProductImage => Boolean(image));
  } catch {
    return [];
  }
}

function normalizeStoredImageFileName(fileName: string | undefined) {
  if (!fileName) {
    return undefined;
  }

  const normalized = fileName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || undefined;
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

function ensureElevatedAdminRemains(users: AdminUser[]) {
  const hasActiveElevatedUser = users.some(
    (user) => user.status === "active" && (user.role === "super_admin" || user.role === "admin"),
  );

  if (!hasActiveElevatedUser) {
    throw new Error("At least one active super admin or admin must remain.");
  }
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

function normalizeContactNotificationMode(value: unknown): ContactNotificationMode {
  if (
    value === "immediate" ||
    value === "daily_digest" ||
    value === "weekly_digest" ||
    value === "off"
  ) {
    return value;
  }

  return "immediate";
}
