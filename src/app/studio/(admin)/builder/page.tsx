import Link from "next/link";
import type { ReactNode } from "react";
import { Eye, LayoutPanelTop, Paintbrush, Save } from "lucide-react";

import { saveSiteBuilderAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { themePresetOptions, type SiteBuilderSection } from "@/content/site-builder";
import { getSiteBuilderSettings } from "@/lib/managed-data";

type BuilderPageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Website Builder | Eltronic Studio",
};

export default async function StudioBuilderPage({ searchParams }: BuilderPageProps) {
  const [settings, params] = await Promise.all([getSiteBuilderSettings(), searchParams]);
  const sortedSections = [...settings.home.sections].sort((a, b) => a.order - b.order);

  return (
    <form action={saveSiteBuilderAction} className="builder-shell">
      <input name="returnTo" type="hidden" value="/studio/builder" />

      <section className="studio-page-header builder-header">
        <p>
          A focused site builder for the public homepage. It controls theme treatment, hero content,
          section visibility and section order without adding a public admin toolbar.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/" target="_blank">
              <Eye className="size-4" />
              Preview site
            </Link>
          </Button>
          <Button type="submit">
            <Save className="size-4" />
            Save builder
          </Button>
        </div>
      </section>

      {params?.saved ? (
        <div className="studio-storage-alert builder-success">Website builder settings saved.</div>
      ) : null}
      {params?.error ? <div className="studio-storage-alert">{params.error}</div> : null}

      <div className="builder-grid">
        <div className="builder-controls">
          <BuilderDisclosure
            description="Theme presets, colour accents and overall density for the public homepage."
            icon={<Paintbrush className="size-4" />}
            title="Theme and canvas"
          >
            <div className="builder-field-grid">
              <Field label="Theme preset">
                <select className="builder-select" defaultValue={settings.theme.preset} name="themePreset">
                  {themePresetOptions.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Background style">
                <select className="builder-select" defaultValue={settings.theme.backgroundStyle} name="backgroundStyle">
                  <option value="grid">Technical grid</option>
                  <option value="soft">Soft atmosphere</option>
                  <option value="minimal">Minimal</option>
                </select>
              </Field>
              <Field label="Visual density">
                <select className="builder-select" defaultValue={settings.theme.visualDensity} name="visualDensity">
                  <option value="compact">Compact</option>
                  <option value="balanced">Balanced</option>
                  <option value="spacious">Spacious</option>
                </select>
              </Field>
            </div>

            <div className="builder-color-row">
              <ColorField label="Accent" name="accentColor" value={settings.theme.accentColor} />
              <ColorField label="Secondary" name="secondaryColor" value={settings.theme.secondaryColor} />
              <ColorField label="Highlight" name="highlightColor" value={settings.theme.highlightColor} />
            </div>

            <div className="builder-preset-notes">
              {themePresetOptions.map((preset) => (
                <span key={preset.key}>
                  <strong>{preset.label}</strong>
                  {preset.description}
                </span>
              ))}
            </div>
          </BuilderDisclosure>

          <BuilderDisclosure
            defaultOpen
            description="Main homepage hero content, CTAs and technical visual."
            icon={<LayoutPanelTop className="size-4" />}
            title="Homepage hero"
          >
            <div className="builder-field-grid">
              <Field label="Brand word">
                <Input defaultValue={settings.home.hero.brand} name="heroBrand" />
              </Field>
              <Field label="Title suffix">
                <Input defaultValue={settings.home.hero.titleSuffix} name="heroTitleSuffix" />
              </Field>
            </div>
            <Field label="Typewriter phrases">
              <Textarea
                className="min-h-28"
                defaultValue={settings.home.hero.rolePhrases.join("\n")}
                name="heroRolePhrases"
              />
            </Field>
            <Field label="Lead copy">
              <Textarea className="min-h-28" defaultValue={settings.home.hero.lede} name="heroLede" />
            </Field>
            <div className="builder-field-grid">
              <Field label="Primary CTA label">
                <Input defaultValue={settings.home.hero.primaryCtaLabel} name="heroPrimaryCtaLabel" />
              </Field>
              <Field label="Primary CTA href">
                <Input defaultValue={settings.home.hero.primaryCtaHref} name="heroPrimaryCtaHref" />
              </Field>
              <Field label="Secondary CTA label">
                <Input defaultValue={settings.home.hero.secondaryCtaLabel} name="heroSecondaryCtaLabel" />
              </Field>
              <Field label="Secondary CTA href">
                <Input defaultValue={settings.home.hero.secondaryCtaHref} name="heroSecondaryCtaHref" />
              </Field>
            </div>
            <div className="builder-field-grid">
              <Field label="Visual label">
                <Input defaultValue={settings.home.hero.visualLabel} name="heroVisualLabel" />
              </Field>
              <Field label="Visual module">
                <select className="builder-select" defaultValue={settings.home.hero.visualVariant} name="heroVisualVariant">
                  <option value="display">Code mark</option>
                  <option value="network">Network integration</option>
                  <option value="sectors">Sector map</option>
                  <option value="data">Data/specification</option>
                </select>
              </Field>
            </div>
          </BuilderDisclosure>

          <BuilderDisclosure
            defaultOpen
            description="Enable, reorder and edit the current homepage blocks."
            icon={<LayoutPanelTop className="size-4" />}
            title="Homepage sections"
          >
            <div className="builder-section-list">
              {settings.home.sections.map((section) => (
                <SectionControls key={section.key} section={section} />
              ))}
            </div>
          </BuilderDisclosure>
        </div>

        <aside className="builder-preview-panel">
          <Card>
            <CardHeader>
              <CardTitle>Builder preview</CardTitle>
              <CardDescription>Compact structural preview of what the public homepage will show.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="builder-preview-window">
                <div className="builder-preview-hero">
                  <span>{settings.home.hero.rolePhrases[0]}</span>
                  <strong>{settings.home.hero.brand}</strong>
                  <p>{settings.home.hero.lede}</p>
                  <div>
                    <small>{settings.home.hero.primaryCtaLabel}</small>
                    <small>{settings.home.hero.secondaryCtaLabel}</small>
                  </div>
                </div>
                <div className="builder-preview-sections">
                  {sortedSections.map((section) => (
                    <article className={!section.enabled ? "is-disabled" : undefined} key={section.key}>
                      <span>{section.eyebrow}</span>
                      <strong>{section.title}</strong>
                      <small>{section.enabled ? "Visible" : "Hidden"} · Order {section.order}</small>
                    </article>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}

function BuilderDisclosure({
  children,
  defaultOpen = false,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <details className="studio-form-section studio-form-disclosure builder-disclosure" open={defaultOpen}>
      <summary className="studio-form-section-summary">
        <span>
          <span className="builder-summary-icon">{icon}</span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <span className="studio-disclosure-state">Toggle</span>
      </summary>
      <div className="studio-form-section-body">{children}</div>
    </details>
  );
}

function SectionControls({ section }: { section: SiteBuilderSection }) {
  return (
    <article className="builder-section-card">
      <label className="studio-module-toggle">
        <input defaultChecked={section.enabled} name={`sectionEnabled:${section.key}`} type="checkbox" />
        <span>
          <strong>{section.label}</strong>
          <small>Show or hide this block on the public homepage.</small>
        </span>
      </label>

      <div className="builder-field-grid">
        <Field label="Order">
          <Input defaultValue={section.order} min={1} name={`sectionOrder:${section.key}`} type="number" />
        </Field>
        <Field label="Eyebrow / number">
          <Input defaultValue={section.eyebrow} name={`sectionEyebrow:${section.key}`} />
        </Field>
      </div>
      <Field label="Section title">
        <Input defaultValue={section.title} name={`sectionTitle:${section.key}`} />
      </Field>
      <Field label="Section summary">
        <Textarea className="min-h-24" defaultValue={section.summary} name={`sectionSummary:${section.key}`} />
      </Field>
      <div className="builder-field-grid">
        <Field label="CTA label">
          <Input defaultValue={section.ctaLabel} name={`sectionCtaLabel:${section.key}`} />
        </Field>
        <Field label="CTA href">
          <Input defaultValue={section.ctaHref} name={`sectionCtaHref:${section.key}`} />
        </Field>
      </div>
      {section.key === "software" || section.key === "sectors" ? (
        <>
          <div className="builder-field-grid">
            <Field label="Panel eyebrow">
              <Input defaultValue={section.panelEyebrow} name={`sectionPanelEyebrow:${section.key}`} />
            </Field>
            <Field label="Panel title">
              <Input defaultValue={section.panelTitle} name={`sectionPanelTitle:${section.key}`} />
            </Field>
          </div>
          <Field label="Panel summary">
            <Textarea className="min-h-24" defaultValue={section.panelSummary} name={`sectionPanelSummary:${section.key}`} />
          </Field>
        </>
      ) : null}
    </article>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ColorField({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <label className="builder-color-field">
      <span>{label}</span>
      <input defaultValue={value} name={name} type="color" />
      <Input defaultValue={value} name={`${name}Preview`} readOnly type="text" />
    </label>
  );
}
