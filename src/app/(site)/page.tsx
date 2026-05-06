import Link from "next/link";
import type { CSSProperties } from "react";

import { HeroRoleTypewriter } from "@/components/site/hero-role-typewriter";
import { ManagedImage } from "@/components/site/managed-image";
import { TechnicalVisual } from "@/components/site/technical-visuals";
import type { Product } from "@/content/products";
import { sectorModules, serviceModules, workflowModules } from "@/content/site";
import type { SiteBuilderSection, SiteBuilderTheme } from "@/content/site-builder";
import { getFeaturedProducts, getSiteBuilderSettings } from "@/lib/managed-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredProducts, builder] = await Promise.all([getFeaturedProducts(), getSiteBuilderSettings()]);
  const visibleSections = [...builder.home.sections].filter((section) => section.enabled).sort((a, b) => a.order - b.order);
  const heroUsesCodeMark = builder.home.hero.visualVariant === "display";
  const heroVisualLabel = heroUsesCodeMark ? "Eltronic interactive code mark" : builder.home.hero.visualLabel;

  return (
    <main
      className={`page home-page builder-theme-${builder.theme.preset} builder-bg-${builder.theme.backgroundStyle} builder-density-${builder.theme.visualDensity}`}
      style={builderThemeStyle(builder.theme)}
    >
      <section className="hero">
        <div className="hero-copy">
          <h1 className="hero-title">
            <HeroRoleTypewriter roles={builder.home.hero.rolePhrases} />
            <span className="title-value gradient-text">{builder.home.hero.brand}</span>
            <span className="title-suffix">{builder.home.hero.titleSuffix}</span>
          </h1>
          <p className="lede">{builder.home.hero.lede}</p>
          <div className="actions">
            <Link className="button" href={builder.home.hero.primaryCtaHref}>
              {builder.home.hero.primaryCtaLabel}
            </Link>
            <Link className="button secondary" href={builder.home.hero.secondaryCtaHref}>
              {builder.home.hero.secondaryCtaLabel}
            </Link>
          </div>
        </div>

        <TechnicalVisual
          codeMark={heroUsesCodeMark}
          label={heroVisualLabel}
          variant={builder.home.hero.visualVariant}
        />
      </section>

      {visibleSections.map((section) => renderHomeSection(section, featuredProducts))}
    </main>
  );
}

function renderHomeSection(section: SiteBuilderSection, featuredProducts: Product[]) {
  if (section.key === "services") {
    return (
      <section className="section" key={section.key}>
        <div className="section-heading">
          <div>
            <span className="section-number">{section.eyebrow}</span>
            <h2>{section.title}</h2>
          </div>
          <p>{section.summary}</p>
        </div>
        <div className="capability-grid">
          {serviceModules.map((capability) => (
            <article className="capability-card panel" key={capability.title}>
              <span className="section-number">{capability.eyebrow}</span>
              <h3>{capability.title}</h3>
              <p>{capability.summary}</p>
            </article>
          ))}
        </div>
        {section.ctaHref && section.ctaLabel ? (
          <div className="actions">
            <Link className="button secondary" href={section.ctaHref}>
              {section.ctaLabel}
            </Link>
          </div>
        ) : null}
      </section>
    );
  }

  if (section.key === "products") {
    return (
      <section className="section" key={section.key}>
        <div className="section-heading">
          <div>
            <span className="section-number">{section.eyebrow}</span>
            <h2>{section.title}</h2>
          </div>
          <p>{section.summary}</p>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <Link className="product-card" href={`/products/${product.slug}`} key={product.slug}>
              <div className="product-media">
                <ManagedImage
                  src={product.image.src}
                  alt={product.image.alt}
                  fill
                  sizes="(max-width: 680px) 50vw, (max-width: 980px) 50vw, 33vw"
                />
              </div>
              <div className="product-content">
                <div className="tag-row">
                  <span className="tag">{product.family}</span>
                  <span className="tag warning">{product.category}</span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (section.key === "software") {
    return (
      <section className="section" key={section.key}>
        <div className="section-heading">
          <div>
            <span className="section-number">{section.eyebrow}</span>
            <h2>{section.title}</h2>
          </div>
          <p>{section.summary}</p>
        </div>
        <div className="cta-module">
          <div>
            <span className="section-number">{section.panelEyebrow}</span>
            <h2>{section.panelTitle}</h2>
            <p>{section.panelSummary}</p>
          </div>
          {section.ctaHref && section.ctaLabel ? (
            <Link className="button" href={section.ctaHref}>
              {section.ctaLabel}
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  if (section.key === "workflow") {
    return (
      <section className="section" key={section.key}>
        <div className="section-heading">
          <div>
            <span className="section-number">{section.eyebrow}</span>
            <h2>{section.title}</h2>
          </div>
          <p>{section.summary}</p>
        </div>
        <div className="process-grid">
          {workflowModules.map((step) => (
            <article className="process-card" key={step.step} tabIndex={0}>
              <strong>{step.step}</strong>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
              <small className="process-outcome">
                <span>Outcome</span>
                {step.outcome}
              </small>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="section" key={section.key}>
      <div className="split-module">
        <TechnicalVisual label="Eltronic sector map" variant="sectors" />
        <div>
          <span className="section-number">{section.panelEyebrow || section.eyebrow}</span>
          <h2>{section.panelTitle || section.title}</h2>
          <p className="lede">{section.summary}</p>
          <div className="tag-row">
            {sectorModules.map((sector) => (
              <span className="tag" key={sector.title}>
                {sector.title}
              </span>
            ))}
          </div>
          {section.ctaHref && section.ctaLabel ? (
            <div className="actions">
              <Link className="button" href={section.ctaHref}>
                {section.ctaLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type BuilderStyle = CSSProperties & Record<`--${string}`, string>;

function builderThemeStyle(theme: SiteBuilderTheme): BuilderStyle {
  return {
    "--primary": theme.accentColor,
    "--secondary": theme.secondaryColor,
    "--accent": theme.highlightColor,
    "--gradient-1": `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.secondaryColor} 58%, ${theme.highlightColor} 100%)`,
    "--gradient-2": `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${theme.accentColor} 100%)`,
    "--shadow-glow": `0 0 30px ${hexToRgba(theme.accentColor, 0.26)}`,
    "--halogen-edge": `linear-gradient(135deg, ${hexToRgba(theme.secondaryColor, 0.95)}, ${hexToRgba(theme.accentColor, 0.4)}, ${hexToRgba(theme.highlightColor, 0.55)})`,
  };
}

function hexToRgba(hex: string, alpha: number) {
  const cleanHex = hex.replace("#", "");
  const red = Number.parseInt(cleanHex.slice(0, 2), 16);
  const green = Number.parseInt(cleanHex.slice(2, 4), 16);
  const blue = Number.parseInt(cleanHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
