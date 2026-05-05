import type { Metadata } from "next";

import { SiteShell } from "@/components/site/site-shell";
import { StructuredData } from "@/components/site/structured-data";
import { body, code } from "@/app/fonts";
import { organizationJsonLd, siteConfig, websiteJsonLd } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Eltronic | Systems Integration, HMI & Software Engineering",
    template: "%s | Eltronic",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "technology",
  keywords: siteConfig.keywords,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "Eltronic | Systems Integration, HMI & Software Engineering",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary_large_image",
    title: "Eltronic | Systems Integration, HMI & Software Engineering",
    description: siteConfig.description,
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${code.variable}`}>
        <StructuredData
          data={{ "@context": "https://schema.org", "@graph": [organizationJsonLd(), websiteJsonLd()] }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
