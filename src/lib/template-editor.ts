import { readFile, writeFile } from "fs/promises";
import path from "path";

export type TemplateFileGroup =
  | "Public pages"
  | "Theme components"
  | "Content and data"
  | "Admin templates"
  | "Global styles";

export type TemplateFile = {
  path: string;
  label: string;
  group: TemplateFileGroup;
  language: "tsx" | "ts" | "css" | "json" | "md";
  description: string;
  publicRoute?: string;
};

export const templateFiles: TemplateFile[] = [
  {
    path: "src/app/(site)/page.tsx",
    label: "Home page",
    group: "Public pages",
    language: "tsx",
    publicRoute: "/",
    description: "Main public landing page and homepage section rendering.",
  },
  {
    path: "src/app/(site)/about/page.tsx",
    label: "About page",
    group: "Public pages",
    language: "tsx",
    publicRoute: "/about",
    description: "Company positioning page.",
  },
  {
    path: "src/app/(site)/solutions/page.tsx",
    label: "Solutions page",
    group: "Public pages",
    language: "tsx",
    publicRoute: "/solutions",
    description: "HMI, CAN-Bus and control-system integration page.",
  },
  {
    path: "src/app/(site)/software-it/page.tsx",
    label: "Software & Systems page",
    group: "Public pages",
    language: "tsx",
    publicRoute: "/software-it",
    description: "Software, internal systems and integration services page.",
  },
  {
    path: "src/app/(site)/products/page.tsx",
    label: "Products archive",
    group: "Public pages",
    language: "tsx",
    publicRoute: "/products",
    description: "Product listing page.",
  },
  {
    path: "src/app/(site)/products/[slug]/page.tsx",
    label: "Product detail template",
    group: "Public pages",
    language: "tsx",
    description: "Dynamic product page template.",
  },
  {
    path: "src/app/(site)/contact/page.tsx",
    label: "Contact page",
    group: "Public pages",
    language: "tsx",
    publicRoute: "/contact",
    description: "Quote/contact page and public enquiry form.",
  },
  {
    path: "src/components/site/site-shell.tsx",
    label: "Site shell",
    group: "Theme components",
    language: "tsx",
    description: "Public navigation, footer and shared site chrome.",
  },
  {
    path: "src/components/site/ambient-background.tsx",
    label: "Ambient background",
    group: "Theme components",
    language: "tsx",
    description: "Subtle public background glyph layer.",
  },
  {
    path: "src/components/site/technical-visuals.tsx",
    label: "Technical visuals",
    group: "Theme components",
    language: "tsx",
    description: "Code-native SVG visuals used across public pages.",
  },
  {
    path: "src/components/site/product-media-gallery.tsx",
    label: "Product gallery",
    group: "Theme components",
    language: "tsx",
    description: "Interactive product image gallery and zoom overlay.",
  },
  {
    path: "src/content/site.ts",
    label: "Site content modules",
    group: "Content and data",
    language: "ts",
    description: "Services, sectors, workflow and resource module copy.",
  },
  {
    path: "src/content/site-builder.ts",
    label: "Builder defaults",
    group: "Content and data",
    language: "ts",
    description: "Default settings for the Studio Website Builder.",
  },
  {
    path: "src/content/products.ts",
    label: "Product seed data",
    group: "Content and data",
    language: "ts",
    description: "Seed product catalogue used before managed edits exist.",
  },
  {
    path: "src/app/studio/(admin)/builder/page.tsx",
    label: "Website Builder screen",
    group: "Admin templates",
    language: "tsx",
    publicRoute: "/studio/builder",
    description: "Studio page builder controls.",
  },
  {
    path: "src/components/studio/product-form.tsx",
    label: "Product editor form",
    group: "Admin templates",
    language: "tsx",
    description: "Current Studio product editor.",
  },
  {
    path: "src/components/studio/classic/woocommerce-product-editor.tsx",
    label: "Classic product editor",
    group: "Admin templates",
    language: "tsx",
    description: "WordPress/WooCommerce-style product editor.",
  },
  {
    path: "src/components/studio/studio-shell.tsx",
    label: "Studio shell",
    group: "Admin templates",
    language: "tsx",
    description: "Studio sidebar, top bar and classic admin shell switcher.",
  },
  {
    path: "src/app/globals.css",
    label: "Global stylesheet",
    group: "Global styles",
    language: "css",
    description: "Public theme, Studio, classic admin and builder styles.",
  },
];

export function getTemplateFiles() {
  return templateFiles;
}

export function getTemplateFile(filePath?: string | null) {
  return templateFiles.find((file) => file.path === filePath) ?? templateFiles[0];
}

export function canWriteTemplateFiles() {
  return process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production";
}

export async function readTemplateFile(filePath?: string | null) {
  const file = getTemplateFile(filePath);

  return {
    file,
    content: await readFile(resolveTemplatePath(file.path), "utf8"),
    canWrite: canWriteTemplateFiles(),
  };
}

export async function writeTemplateFile(filePath: string, content: string) {
  if (!canWriteTemplateFiles()) {
    throw new Error("Template file editing is only enabled in local development.");
  }

  const file = getTemplateFile(filePath);

  if (file.path !== filePath) {
    throw new Error("This file is not available in the template editor.");
  }

  await writeFile(resolveTemplatePath(file.path), content.replace(/\r\n/g, "\n"));
}

function resolveTemplatePath(filePath: string) {
  if (!filePath.startsWith("src/")) {
    throw new Error("Template files must live inside the src directory.");
  }

  return path.join(process.cwd(), "src", filePath.slice("src/".length));
}
