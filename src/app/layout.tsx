import type { Metadata } from "next";
import { Fira_Code, Tajawal } from "next/font/google";
import { StructuredData } from "@/components/site/structured-data";
import { organizationJsonLd, siteConfig, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const body = Tajawal({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-body",
});

const code = Fira_Code({
  subsets: ["latin"],
  variable: "--font-code",
});

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

export default function RootLayout({
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
        {children}
      </body>
    </html>
  );
}
