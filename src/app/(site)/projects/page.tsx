import Link from "next/link";
import { getPublishedProjectCaseStudies } from "@/content/projects";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Projects",
  description:
    "Project write-ups from Eltronic covering control systems, software integration, connected hardware and operational workflow improvements.",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getPublishedProjectCaseStudies();

  return (
    <main className="page">
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">projects.index</span>
            <h1>Project write-ups</h1>
          </div>
          <p>
            A home for practical examples of Eltronic work across control systems, full-stack software,
            connected devices, APIs, dashboards and operational improvements.
          </p>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="module-grid">
          {projects.map((project) => (
            <Link className="feature-module" href={`/projects/${project.slug}`} key={project.slug}>
              <span className="section-number">{project.date}</span>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
              <div className="tag-row">
                {project.services.slice(0, 4).map((service) => (
                  <span className="tag" key={service}>
                    {service}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="section">
          <article className="panel">
            <span className="section-number">case.studies</span>
            <h2>Project pages are ready for content.</h2>
            <p>
              Add project entries in <code>src/content/projects.ts</code> when the write-ups, photos and outcomes are
              ready. Published projects will automatically appear here and in the sitemap.
            </p>
            <div className="actions">
              <Link className="button" href="/contact">
                Discuss a project
              </Link>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
