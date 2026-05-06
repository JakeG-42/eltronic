import type { MetadataRoute } from "next";

import { getPublishedProjectCaseStudies } from "@/content/projects";
import { absoluteUrl } from "@/lib/seo";
import { getArticles, getProductImages, getProducts } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

const staticRoutes: Array<{
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  path: string;
  priority: number;
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/articles", priority: 0.82, changeFrequency: "weekly" },
  { path: "/solutions", priority: 0.85, changeFrequency: "monthly" },
  { path: "/software-it", priority: 0.85, changeFrequency: "monthly" },
  { path: "/web-connected-platforms", priority: 0.82, changeFrequency: "monthly" },
  { path: "/sectors", priority: 0.75, changeFrequency: "monthly" },
  { path: "/data-specification", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.65, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, projects, articles] = await Promise.all([getProducts(), getPublishedProjectCaseStudies(), getArticles()]);
  const projectIndexRoute =
    projects.length > 0
      ? [
          {
            url: absoluteUrl("/projects"),
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
        ]
      : [];

  const productRoutes = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.82,
    images: getProductImages(product).map((image) => sitemapImageUrl(image.src)).filter((src): src is string => Boolean(src)),
  }));

  const projectRoutes = projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.78,
    images: project.images.map((image) => absoluteUrl(image.src)),
  }));

  const articleRoutes = articles.map((article) => ({
    url: absoluteUrl(`/articles/${article.slug}`),
    lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: article.homepageFeatured || article.featured ? 0.76 : 0.68,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...projectIndexRoute,
    ...productRoutes,
    ...articleRoutes,
    ...projectRoutes,
  ];
}

function sitemapImageUrl(src: string) {
  if (/^(data|blob):/i.test(src)) {
    return null;
  }

  return absoluteUrl(src);
}
