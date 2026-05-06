import importedArticles from "./articles-imported.json";

export type ArticleStatus = "draft" | "published";

export type Article = {
  author: string;
  body: string;
  category: string;
  excerpt: string;
  featured?: boolean;
  heroImage?: string;
  homepageFeatured?: boolean;
  publishedAt: string;
  relatedProductSlugs?: string[];
  slug: string;
  sourceFileName?: string;
  sourceFileUrl?: string;
  status: ArticleStatus;
  tags?: string[];
  title: string;
  updatedAt?: string;
};

const demoPlatformArticle: Article = {
  slug: "from-can-bus-to-cloud-smart-mobile-machinery-demo-platform",
  title: "From CAN-Bus to Cloud: Smart Mobile Machinery Demo Platform",
  excerpt:
    "A portable demonstrator concept showing how HMI, CAN control, telematics, sensors, safety and cloud dashboards can work together in one customer-ready system.",
  category: "Demo Platform",
  status: "published",
  publishedAt: "2026-05-06T11:30:00.000Z",
  updatedAt: "2026-05-06T11:30:00.000Z",
  author: "Eltronic",
  tags: ["CAN-Bus", "Cloud", "HMI", "Telematics", "Prototype"],
  relatedProductSlugs: ["autopi-can-fd-pro", "topcon-opus-a3e", "topcon-opus-a3s", "eltronic-iq-can-bus-module"],
  homepageFeatured: true,
  featured: true,
  body: `A compact mobile demonstration platform is one of the clearest ways to show what Eltronic can deliver: not just individual products, but a complete connected system that moves from machine data to operator interface to cloud dashboard.

## The concept

The demonstrator would sit on a small aluminium frame and combine practical hardware with production-style software:

- TOPCON HMI
- AutoPi
- Teltonika connectivity
- ECU/CAN controller
- Actuators
- Joystick
- Beacon or warning light
- Sensors
- Camera
- Safety inputs
- Cloud dashboard

## Why it matters

This type of demonstrator is professional, portable and easy to explain. It can be taken to customers, shown in sales meetings, filmed for short videos, used on LinkedIn, referenced in proposals and linked directly from the website.

The highest-value part is not the frame itself. The value is in the integration, software, UX, cloud connectivity and presentation layer that makes the whole system feel coherent.

## What it proves

- CAN-Bus and CAN-FD integration
- Operator screen design
- Remote telemetry
- Cloud dashboards
- Safety and status monitoring
- Sensor and camera integration
- Mobile machinery control workflows
- Practical prototype delivery

This is exactly the kind of working system that helps customers understand what Eltronic does: connecting hardware, software, data and real-world machinery into one usable solution.`,
};

export const seedArticles: Article[] = [demoPlatformArticle, ...(importedArticles as Article[])];

export const articleCategories = Array.from(new Set(seedArticles.map((article) => article.category))).sort((a, b) =>
  a.localeCompare(b),
);
