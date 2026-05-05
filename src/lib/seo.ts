import type { Metadata } from "next";

const fallbackSiteUrl = "https://project-5v5cr.vercel.app";

export const siteConfig = {
  name: "Eltronic",
  url: (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/+$/, ""),
  description:
    "Systems integration, rugged HMI displays, CAN-Bus data, full-stack software and connected equipment solutions.",
  email: "sales@eltronic.co.uk",
  phone: "+44 79 3523 9421",
  locale: "en_GB",
  keywords: [
    "Eltronic",
    "HMI displays",
    "CAN-Bus integration",
    "CAN data logging",
    "control systems",
    "systems integration",
    "embedded services",
    "IoT software",
    "full-stack software",
    "internal business systems",
    "API integration",
    "industrial automation",
    "mobile equipment controls",
  ],
};

export function absoluteUrl(path = "/") {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
}

export function createPageMetadata({
  description,
  path,
  title,
}: {
  description: string;
  path: string;
  title: string;
}): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    keywords: siteConfig.keywords,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    description: siteConfig.description,
    areaServed: "United Kingdom",
    knowsAbout: siteConfig.keywords,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
