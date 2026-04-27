import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/site/structured-data";
import { getProjectCaseStudyBySlug, getPublishedProjectCaseStudies } from "@/content/projects";
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, siteConfig } from "@/lib/seo";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPublishedProjectCaseStudies().map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectCaseStudyBySlug(slug);

  if (!project) {
    return {};
  }

  return createPageMetadata({
    title: project.title,
    description: project.metaDescription,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectCaseStudyBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="page">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: project.title,
            description: project.metaDescription,
            datePublished: project.date,
            author: {
              "@type": "Organization",
              name: siteConfig.name,
            },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
            },
            mainEntityOfPage: absoluteUrl(`/projects/${project.slug}`),
            image: project.images.map((image) => absoluteUrl(image.src)),
          },
        ]}
      />

      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">project.case-study</p>
          <h1>{project.title}</h1>
          <p className="lede">{project.intro}</p>
          <div className="actions">
            <Link className="button" href="/contact">
              Discuss similar work
            </Link>
            <Link className="button secondary" href="/projects">
              Back to projects
            </Link>
          </div>
        </div>
      </section>

      <section className="detail-layout">
        <div className="stack">
          <article className="panel">
            <span className="section-number">challenge</span>
            <h2>What needed to be solved</h2>
            <p>{project.challenge}</p>
          </article>

          <article className="panel">
            <span className="section-number">outcomes</span>
            <h2>Outcome</h2>
            <ul className="highlight-list">
              {project.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="stack">
          <section className="panel">
            <h2>Services involved</h2>
            <div className="tag-row">
              {project.services.map((service) => (
                <span className="tag" key={service}>
                  {service}
                </span>
              ))}
            </div>
          </section>

          {project.images.length > 0 ? (
            <section className="panel">
              <h2>Project images</h2>
              <div className="project-media-grid">
                {project.images.map((image) => (
                  <Image
                    alt={image.alt}
                    className="project-media-image"
                    height={220}
                    key={image.src}
                    src={image.src}
                    width={320}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
