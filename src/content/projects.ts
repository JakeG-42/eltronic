export type ProjectCaseStudy = {
  challenge: string;
  date: string;
  images: Array<{
    alt: string;
    src: string;
  }>;
  intro: string;
  metaDescription: string;
  outcomes: string[];
  published: boolean;
  services: string[];
  slug: string;
  summary: string;
  title: string;
  updatedAt?: string;
};

export const projectCaseStudies: ProjectCaseStudy[] = [];

export function getPublishedProjectCaseStudies() {
  return projectCaseStudies.filter((project) => project.published);
}

export function getProjectCaseStudyBySlug(slug: string) {
  return getPublishedProjectCaseStudies().find((project) => project.slug === slug);
}
