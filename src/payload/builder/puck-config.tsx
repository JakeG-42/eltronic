import type { CSSProperties, ReactNode } from "react";
import type { CustomFieldRender } from "@puckeditor/core";
import Link from "next/link";

import type {
  BuilderAdvancedStyle,
  BuilderConfig,
  BuilderBorderControls,
  BuilderColorControls,
  BuilderEffectControls,
  BuilderHoverEffect,
  BuilderHoverControls,
  BuilderMenu,
  BuilderProduct,
  BuilderSectionShadow,
  BuilderRootProps,
  BuilderSectionEffect,
  BuilderSectionWidth,
  BuilderSpacingControls,
  BuilderTypographyControls,
} from "./types";

const alignmentOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
] as const;

const columnOptions = [
  { label: "2 columns", value: "2" },
  { label: "3 columns", value: "3" },
  { label: "4 columns", value: "4" },
] as const;

const effectOptions = [
  { label: "None", value: "none" },
  { label: "Glow", value: "glow" },
  { label: "Lift", value: "lift" },
  { label: "Border pulse", value: "borderPulse" },
] as const;

const borderStyleOptions = [
  { label: "None", value: "none" },
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
] as const;

const fontOptions = [
  { label: "Display", value: "display" },
  { label: "Sans", value: "sans" },
  { label: "Technical code", value: "code" },
] as const;

const fontWeightOptions = [
  { label: "Regular", value: "regular" },
  { label: "Medium", value: "medium" },
  { label: "Bold", value: "bold" },
  { label: "Heavy", value: "heavy" },
] as const;

const hoverOptions = [
  { label: "None", value: "none" },
  { label: "Lift", value: "lift" },
  { label: "Glow", value: "glow" },
  { label: "Brighten", value: "brighten" },
  { label: "Scale", value: "scale" },
  { label: "Border colour", value: "border" },
] as const;

const scrollOptions = [
  { label: "None", value: "none" },
  { label: "Fade up", value: "fadeUp" },
  { label: "Slide left", value: "slideLeft" },
  { label: "Scale in", value: "scaleIn" },
] as const;

const shadowOptions = [
  { label: "None", value: "none" },
  { label: "Soft", value: "soft" },
  { label: "Strong", value: "strong" },
] as const;

const widthOptions = [
  { label: "Narrow", value: "narrow" },
  { label: "Default", value: "default" },
  { label: "Wide", value: "wide" },
  { label: "Full width", value: "full" },
] as const;

const menuOrientationOptions = [
  { label: "Horizontal", value: "horizontal" },
  { label: "Vertical", value: "vertical" },
] as const;

function rangeField({ fallback, label, max, min, step }: { fallback: number; label: string; max: number; min: number; step: number }) {
  const render: CustomFieldRender<number | undefined> = ({ field, id, onChange, readOnly, value }) => {
    const numberValue = typeof value === "number" && Number.isFinite(value) ? value : fallback;

    return (
      <label className="puck-range-field" htmlFor={id}>
        <span>
          {field.label}
          <strong>{numberValue}%</strong>
        </span>
        <input
          disabled={readOnly}
          id={id}
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          step={step}
          type="range"
          value={numberValue}
        />
      </label>
    );
  };

  return {
    label,
    render,
    type: "custom",
  } as const;
}

function toggleField(label: string) {
  const render: CustomFieldRender<boolean | undefined> = ({ field, id, onChange, readOnly, value }) => {
    const checked = Boolean(value);

    return (
      <label className="puck-toggle-field" htmlFor={id}>
        <span>{field.label}</span>
        <input disabled={readOnly} id={id} onChange={(event) => onChange(event.currentTarget.checked)} type="checkbox" checked={checked} />
      </label>
    );
  };

  return {
    label,
    render,
    type: "custom",
  } as const;
}

const sharedDesignFields = {
  colorControls: {
    label: "Colours",
    objectFields: {
      accentColor: { label: "Accent", placeholder: "#8bd3ff", type: "text" },
      backgroundColor: { label: "Section background", placeholder: "rgba(23, 32, 51, 0.78)", type: "text" },
      surfaceColor: { label: "Cards/media surface", placeholder: "rgba(23, 32, 51, 0.78)", type: "text" },
      textColor: { label: "Text", placeholder: "#f1f5f9", type: "text" },
    },
    type: "object",
  },
  typographyControls: {
    label: "Typography",
    objectFields: {
      fontFamily: { label: "Font", options: fontOptions, type: "select" },
      fontWeight: { label: "Heading weight", options: fontWeightOptions, type: "select" },
      headingSize: { label: "Heading size (rem)", max: 7, min: 0.8, step: 0.1, type: "number" },
      subheadingSize: { label: "Subheading size (rem)", max: 3, min: 0.7, step: 0.05, type: "number" },
      bodySize: { label: "Body size (rem)", max: 2, min: 0.65, step: 0.05, type: "number" },
      eyebrowSize: { label: "Eyebrow size (rem)", max: 1.6, min: 0.55, step: 0.05, type: "number" },
      lineHeight: { label: "Line height", max: 2.2, min: 0.9, step: 0.05, type: "number" },
      textAlign: { label: "Text alignment", options: alignmentOptions, type: "select" },
    },
    type: "object",
  },
  spacingControls: {
    label: "Spacing",
    objectFields: {
      sectionWidth: { label: "Section width", options: widthOptions, type: "select" },
      sectionPaddingTop: { label: "Padding top (rem)", max: 10, min: 0, step: 0.25, type: "number" },
      sectionPaddingBottom: { label: "Padding bottom (rem)", max: 10, min: 0, step: 0.25, type: "number" },
      sectionPaddingX: { label: "Padding sides (rem)", max: 8, min: 0, step: 0.25, type: "number" },
      elementPadding: { label: "Card/CTA padding (rem)", max: 5, min: 0, step: 0.1, type: "number" },
      elementGap: { label: "Gap (rem)", max: 5, min: 0, step: 0.1, type: "number" },
    },
    type: "object",
  },
  borderControls: {
    label: "Borders",
    objectFields: {
      sectionBorderStyle: { label: "Section style", options: borderStyleOptions, type: "select" },
      sectionBorderWidth: { label: "Section width (px)", max: 12, min: 0, step: 1, type: "number" },
      sectionBorderRadius: { label: "Section radius (px)", max: 80, min: 0, step: 1, type: "number" },
      sectionBorderColor: { label: "Section colour", placeholder: "rgba(139, 211, 255, 0.24)", type: "text" },
      elementBorderStyle: { label: "Element style", options: borderStyleOptions, type: "select" },
      elementBorderWidth: { label: "Element width (px)", max: 12, min: 0, step: 1, type: "number" },
      elementBorderRadius: { label: "Element radius (px)", max: 80, min: 0, step: 1, type: "number" },
      elementBorderColor: { label: "Element colour", placeholder: "rgba(139, 211, 255, 0.24)", type: "text" },
    },
    type: "object",
  },
  effectControls: {
    label: "Effects",
    objectFields: {
      effect: { label: "Section effect", options: effectOptions, type: "select" },
      sectionShadow: { label: "Shadow", options: shadowOptions, type: "select" },
      opacity: { label: "Opacity", max: 1, min: 0.2, step: 0.05, type: "number" },
      scrollAnimation: { label: "On scroll", options: scrollOptions, type: "select" },
    },
    type: "object",
  },
  hoverControls: {
    label: "Hover",
    objectFields: {
      hoverEffect: { label: "Effect", options: hoverOptions, type: "select" },
      hoverScaleMode: {
        label: "Scale direction",
        options: [
          { label: "Enlarge", value: "enlarge" },
          { label: "Shrink", value: "shrink" },
        ],
        type: "select",
      },
      hoverScaleAmount: rangeField({ fallback: 2, label: "Scale amount", max: 24, min: 1, step: 1 }),
      hoverBackgroundColor: { label: "Background", placeholder: "rgba(139, 211, 255, 0.12)", type: "text" },
      hoverTextColor: { label: "Text", placeholder: "#ffffff", type: "text" },
      hoverBorderColor: { label: "Border", placeholder: "#8bd3ff", type: "text" },
    },
    type: "object",
  },
} as const;

const defaultDesign: Required<BuilderAdvancedStyle> = {
  accentColor: "#8bd3ff",
  backgroundColor: "",
  bodySize: 1,
  elementBorderColor: "",
  elementBorderRadius: 8,
  elementBorderStyle: "solid",
  elementBorderWidth: 1,
  elementGap: 1,
  elementPadding: 1.15,
  effect: "none",
  eyebrowSize: 0.76,
  fontFamily: "display",
  fontWeight: "heavy",
  headingSize: 3.2,
  hoverBackgroundColor: "",
  hoverBorderColor: "",
  hoverEffect: "none",
  hoverScaleAmount: 2,
  hoverScaleMode: "enlarge",
  hoverTextColor: "",
  lineHeight: 1.7,
  opacity: 1,
  scrollAnimation: "none",
  sectionBorderColor: "",
  sectionBorderRadius: 0,
  sectionBorderStyle: "none",
  sectionBorderWidth: 0,
  sectionPaddingBottom: 0,
  sectionPaddingTop: 0,
  sectionPaddingX: 0,
  sectionShadow: "none",
  sectionWidth: "default",
  subheadingSize: 1.12,
  surfaceColor: "",
  textAlign: "left",
  textColor: "",
  borderControls: {
    elementBorderColor: "",
    elementBorderRadius: 8,
    elementBorderStyle: "solid",
    elementBorderWidth: 1,
    sectionBorderColor: "",
    sectionBorderRadius: 0,
    sectionBorderStyle: "none",
    sectionBorderWidth: 0,
  },
  colorControls: {
    accentColor: "#8bd3ff",
    backgroundColor: "",
    surfaceColor: "",
    textColor: "",
  },
  effectControls: {
    effect: "none",
    opacity: 1,
    scrollAnimation: "none",
    sectionShadow: "none",
  },
  hoverControls: {
    hoverBackgroundColor: "",
    hoverBorderColor: "",
    hoverEffect: "none",
    hoverScaleAmount: 2,
    hoverScaleMode: "enlarge",
    hoverTextColor: "",
  },
  spacingControls: {
    elementGap: 1,
    elementPadding: 1.15,
    sectionPaddingBottom: 0,
    sectionPaddingTop: 0,
    sectionPaddingX: 0,
    sectionWidth: "default",
  },
  typographyControls: {
    bodySize: 1,
    eyebrowSize: 0.76,
    fontFamily: "display",
    fontWeight: "heavy",
    headingSize: 3.2,
    lineHeight: 1.7,
    subheadingSize: 1.12,
    textAlign: "left",
  },
};

const fontWeightMap = {
  bold: 700,
  heavy: 850,
  medium: 600,
  regular: 400,
} as const;

const sectionWidthMap: Record<BuilderSectionWidth, string> = {
  default: "1180px",
  full: "100%",
  narrow: "820px",
  wide: "1400px",
};

function mergeControlGroup<T extends object>(value: T | undefined): Partial<T> {
  return typeof value === "object" && value !== null ? value : {};
}

function getDesign(style: BuilderAdvancedStyle = {}) {
  const borders = mergeControlGroup<BuilderBorderControls>(style.borderControls);
  const colors = mergeControlGroup<BuilderColorControls>(style.colorControls);
  const effects = mergeControlGroup<BuilderEffectControls>(style.effectControls);
  const hover = mergeControlGroup<BuilderHoverControls>(style.hoverControls);
  const spacing = mergeControlGroup<BuilderSpacingControls>(style.spacingControls);
  const typography = mergeControlGroup<BuilderTypographyControls>(style.typographyControls);

  return {
    accentColor: colors.accentColor ?? style.accentColor,
    backgroundColor: colors.backgroundColor ?? style.backgroundColor,
    bodySize: typography.bodySize ?? style.bodySize,
    elementBorderColor: borders.elementBorderColor ?? style.elementBorderColor,
    elementBorderRadius: borders.elementBorderRadius ?? style.elementBorderRadius,
    elementBorderStyle: borders.elementBorderStyle ?? style.elementBorderStyle,
    elementBorderWidth: borders.elementBorderWidth ?? style.elementBorderWidth,
    elementGap: spacing.elementGap ?? style.elementGap,
    elementPadding: spacing.elementPadding ?? style.elementPadding,
    effect: effects.effect ?? style.effect,
    eyebrowSize: typography.eyebrowSize ?? style.eyebrowSize,
    fontFamily: typography.fontFamily ?? style.fontFamily,
    fontWeight: typography.fontWeight ?? style.fontWeight,
    headingSize: typography.headingSize ?? style.headingSize,
    hoverBackgroundColor: hover.hoverBackgroundColor ?? style.hoverBackgroundColor,
    hoverBorderColor: hover.hoverBorderColor ?? style.hoverBorderColor,
    hoverEffect: hover.hoverEffect ?? style.hoverEffect,
    hoverScaleAmount: hover.hoverScaleAmount ?? style.hoverScaleAmount,
    hoverScaleMode: hover.hoverScaleMode ?? style.hoverScaleMode,
    hoverTextColor: hover.hoverTextColor ?? style.hoverTextColor,
    lineHeight: typography.lineHeight ?? style.lineHeight,
    opacity: effects.opacity ?? style.opacity,
    scrollAnimation: effects.scrollAnimation ?? style.scrollAnimation,
    sectionBorderColor: borders.sectionBorderColor ?? style.sectionBorderColor,
    sectionBorderRadius: borders.sectionBorderRadius ?? style.sectionBorderRadius,
    sectionBorderStyle: borders.sectionBorderStyle ?? style.sectionBorderStyle,
    sectionBorderWidth: borders.sectionBorderWidth ?? style.sectionBorderWidth,
    sectionPaddingBottom: spacing.sectionPaddingBottom ?? style.sectionPaddingBottom,
    sectionPaddingTop: spacing.sectionPaddingTop ?? style.sectionPaddingTop,
    sectionPaddingX: spacing.sectionPaddingX ?? style.sectionPaddingX,
    sectionShadow: effects.sectionShadow ?? style.sectionShadow,
    sectionWidth: spacing.sectionWidth ?? style.sectionWidth,
    subheadingSize: typography.subheadingSize ?? style.subheadingSize,
    surfaceColor: colors.surfaceColor ?? style.surfaceColor,
    textAlign: typography.textAlign ?? style.textAlign,
    textColor: colors.textColor ?? style.textColor,
  };
}

function cssRem(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `${value}rem` : undefined;
}

function cssPx(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `${value}px` : undefined;
}

function cssNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : undefined;
}

function getSectionStyle(style: BuilderAdvancedStyle = {}) {
  const design = getDesign(style);
  const hoverScaleAmount = typeof design.hoverScaleAmount === "number" && Number.isFinite(design.hoverScaleAmount) ? design.hoverScaleAmount : 2;
  const hoverScale = design.hoverScaleMode === "shrink" ? 1 - hoverScaleAmount / 100 : 1 + hoverScaleAmount / 100;

  return {
    "--builder-accent": design.accentColor || "var(--primary)",
    "--builder-body-size": cssRem(design.bodySize),
    "--builder-element-border-color": design.elementBorderColor || "color-mix(in srgb, var(--builder-accent) 18%, transparent)",
    "--builder-element-border-radius": cssPx(design.elementBorderRadius),
    "--builder-element-border-style": design.elementBorderStyle ?? "solid",
    "--builder-element-border-width": cssPx(design.elementBorderWidth),
    "--builder-element-gap": cssRem(design.elementGap),
    "--builder-element-padding": cssRem(design.elementPadding),
    "--builder-eyebrow-size": cssRem(design.eyebrowSize),
    "--builder-font-weight": design.fontWeight ? fontWeightMap[design.fontWeight] : undefined,
    "--builder-heading-size": cssRem(design.headingSize),
    "--builder-hover-bg": design.hoverBackgroundColor || "color-mix(in srgb, var(--builder-accent) 14%, var(--builder-section-bg))",
    "--builder-hover-border": design.hoverBorderColor || "color-mix(in srgb, var(--builder-accent) 64%, transparent)",
    "--builder-hover-scale": cssNumber(hoverScale),
    "--builder-hover-text": design.hoverTextColor || "var(--builder-section-text)",
    "--builder-line-height": cssNumber(design.lineHeight),
    "--builder-section-border-color": design.sectionBorderColor || "color-mix(in srgb, var(--builder-accent) 24%, transparent)",
    "--builder-section-border-radius": cssPx(design.sectionBorderRadius),
    "--builder-section-border-style": design.sectionBorderStyle ?? "none",
    "--builder-section-border-width": cssPx(design.sectionBorderWidth),
    "--builder-section-bg": design.backgroundColor || "transparent",
    "--builder-section-padding-bottom": cssRem(design.sectionPaddingBottom),
    "--builder-section-padding-top": cssRem(design.sectionPaddingTop),
    "--builder-section-padding-x": cssRem(design.sectionPaddingX),
    "--builder-section-text": design.textColor || "var(--text-primary)",
    "--builder-section-width": sectionWidthMap[design.sectionWidth ?? "default"],
    "--builder-subheading-size": cssRem(design.subheadingSize),
    "--builder-surface-fill": design.surfaceColor || "rgba(var(--builder-surface), var(--builder-surface-opacity))",
    opacity: design.opacity ?? 1,
  } as CSSProperties;
}

function getSectionClassName(style: BuilderAdvancedStyle = {}, className = "") {
  const design = getDesign(style);
  const effect: BuilderSectionEffect = design.effect ?? "none";
  const hoverEffect: BuilderHoverEffect = design.hoverEffect ?? "none";
  const sectionShadow: BuilderSectionShadow = design.sectionShadow ?? "none";
  const sectionWidth: BuilderSectionWidth = design.sectionWidth ?? "default";

  return [
    "puck-section",
    `puck-align-${design.textAlign ?? "left"}`,
    `puck-font-${design.fontFamily ?? "display"}`,
    `puck-effect-${effect}`,
    `puck-hover-${hoverEffect}`,
    `puck-scroll-${design.scrollAnimation ?? "none"}`,
    `puck-shadow-${sectionShadow}`,
    `puck-width-${sectionWidth}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function arrayValue<T>(value: T[] | unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function BuilderButton({ link, secondary = false }: { link: { label?: string; url?: string }; secondary?: boolean }) {
  if (!link.label || !link.url) {
    return null;
  }

  return (
    <a className={`puck-button ${secondary ? "secondary" : ""}`} href={link.url}>
      {link.label}
    </a>
  );
}

function BuilderMedia({ alt, url }: { alt?: string; url?: string }) {
  if (!url) {
    return (
      <div className="puck-media-placeholder">
        <span>Visual</span>
      </div>
    );
  }

  // Puck needs to render arbitrary editor-provided image URLs inside its canvas.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt || ""} className="puck-media" src={url} />;
}

function getFeaturedProducts(metadata: Record<string, unknown>): BuilderProduct[] {
  const products = metadata.featuredProducts;

  if (!Array.isArray(products)) {
    return [];
  }

  return products.filter((product): product is BuilderProduct => {
    return (
      typeof product === "object" &&
      product !== null &&
      "name" in product &&
      "slug" in product &&
      typeof product.name === "string" &&
      typeof product.slug === "string"
    );
  });
}

function getBuilderMenus(metadata: Record<string, unknown>): BuilderMenu[] {
  const menus = metadata.menus;

  if (!Array.isArray(menus)) {
    return [];
  }

  return menus.filter((menu): menu is BuilderMenu => {
    return (
      typeof menu === "object" &&
      menu !== null &&
      "handle" in menu &&
      "title" in menu &&
      "items" in menu &&
      typeof menu.handle === "string" &&
      typeof menu.title === "string" &&
      Array.isArray(menu.items)
    );
  });
}

function getMenuOptions(metadata: Record<string, unknown>) {
  const menus = getBuilderMenus(metadata);

  if (!menus.length) {
    return [{ label: "Primary navigation", value: "primary" }];
  }

  return menus.map((menu) => ({
    label: menu.title,
    value: menu.handle,
  }));
}

function getMenu(metadata: Record<string, unknown>, handle: string | undefined) {
  const menus = getBuilderMenus(metadata);
  return menus.find((menu) => menu.handle === handle) ?? menus[0] ?? null;
}

function withFullWidth<T extends BuilderAdvancedStyle & { fullWidth?: boolean }>(props: T): T {
  if (!props.fullWidth) {
    return props;
  }

  return {
    ...props,
    sectionWidth: "full",
    spacingControls: {
      ...props.spacingControls,
      sectionWidth: "full",
    },
  };
}

function Root({ children, ...props }: BuilderRootProps & { children: ReactNode }) {
  return (
    <main
      className={`puck-eltronic-page puck-theme-${props.themePreset ?? "eltronicDark"} puck-density-${
        props.sectionSpacing ?? "normal"
      } puck-font-${props.fontFamily ?? "display"}`}
      style={
        {
          "--builder-accent": props.accentColor || "#8bd3ff",
          "--builder-bg": props.backgroundColor || "#020617",
          "--builder-page-padding-bottom": cssRem(props.pagePaddingBottom),
          "--builder-page-padding-top": cssRem(props.pagePaddingTop),
          "--builder-surface": props.surfaceColor || "23, 32, 51",
          "--builder-surface-fill": `rgba(${props.surfaceColor || "23, 32, 51"}, ${props.surfaceOpacity ?? 0.78})`,
          "--builder-surface-opacity": String(props.surfaceOpacity ?? 0.78),
          "--builder-text": props.textColor || "#f1f5f9",
        } as CSSProperties
      }
    >
      {children}
    </main>
  );
}

export const builderConfig: BuilderConfig = {
  categories: {
    commerce: {
      components: ["ProductGridBlock"],
      title: "Commerce",
    },
    content: {
      components: ["SectionBlock", "RichTextBlock", "ImageTextBlock", "CardGridBlock", "SpecTableBlock", "CallToActionBlock"],
      defaultExpanded: true,
      title: "Content",
    },
    media: {
      components: ["GalleryBlock", "DownloadsBlock"],
      title: "Media",
    },
    navigation: {
      components: ["SiteHeaderBlock", "MenuBlock"],
      defaultExpanded: true,
      title: "Navigation",
    },
    structure: {
      components: ["HeroBlock"],
      defaultExpanded: true,
      title: "Structure",
    },
  },
  components: {
    CallToActionBlock: {
      defaultProps: {
        ...defaultDesign,
        accentColor: "#fbbf24",
        body: "Add a clear next step for visitors.",
        colorControls: { ...defaultDesign.colorControls, accentColor: "#fbbf24" },
        effect: "glow",
        effectControls: { ...defaultDesign.effectControls, effect: "glow" },
        elementPadding: 2.6,
        eyebrow: "Ready",
        heading: "Start the conversation",
        primaryLabel: "Contact Eltronic",
        primaryUrl: "/contact",
        secondaryLabel: "",
        secondaryUrl: "",
        spacingControls: { ...defaultDesign.spacingControls, elementPadding: 2.6 },
        textAlign: "center",
        typographyControls: { ...defaultDesign.typographyControls, textAlign: "center" },
        variant: "band",
      },
      fields: {
        eyebrow: { contentEditable: true, label: "Eyebrow", type: "text" },
        heading: { contentEditable: true, label: "Heading", type: "text" },
        body: { contentEditable: true, label: "Body", type: "textarea" },
        primaryLabel: { label: "Primary label", type: "text" },
        primaryUrl: { label: "Primary URL", type: "text" },
        secondaryLabel: { label: "Secondary label", type: "text" },
        secondaryUrl: { label: "Secondary URL", type: "text" },
        variant: {
          label: "Layout",
          options: [
            { label: "Band", value: "band" },
            { label: "Card", value: "card" },
            { label: "Full bleed", value: "fullBleed" },
          ],
          type: "select",
        },
        ...sharedDesignFields,
      },
      label: "CTA",
      render: (props) => (
        <section className={getSectionClassName(props, `puck-cta puck-cta-${props.variant ?? "band"}`)} style={getSectionStyle(props)}>
          {props.eyebrow ? <span className="puck-kicker">{props.eyebrow}</span> : null}
          <h2>{props.heading}</h2>
          {props.body ? <p>{props.body}</p> : null}
          <div className="puck-actions">
            <BuilderButton link={{ label: props.primaryLabel, url: props.primaryUrl }} />
            <BuilderButton link={{ label: props.secondaryLabel, url: props.secondaryUrl }} secondary />
          </div>
        </section>
      ),
    },
    CardGridBlock: {
      defaultProps: {
        ...defaultDesign,
        cards: [
          {
            body: "Describe the value this block provides.",
            title: "Reusable card",
            url: "",
          },
        ],
        columns: "3",
        heading: "Content grid",
        intro: "Use cards to group related services, benefits, or process steps.",
      },
      fields: {
        heading: { contentEditable: true, label: "Heading", type: "text" },
        intro: { contentEditable: true, label: "Intro", type: "textarea" },
        columns: { label: "Columns", options: columnOptions, type: "select" },
        cards: {
          arrayFields: {
            body: { label: "Body", type: "textarea" },
            title: { label: "Title", type: "text" },
            url: { label: "URL", type: "text" },
          },
          defaultItemProps: {
            body: "Card body",
            title: "New card",
            url: "",
          },
          getItemSummary: (item) => item.title || "Card",
          label: "Cards",
          type: "array",
        },
        ...sharedDesignFields,
      },
      label: "Card grid",
      render: (props) => {
        const cards = arrayValue<NonNullable<typeof props.cards>[number]>(props.cards);

        return (
          <section className={getSectionClassName(props)} style={getSectionStyle(props)}>
            <div className="puck-section-heading">
              <h2>{textValue(props.heading, "Content grid")}</h2>
              {textValue(props.intro) ? <p>{textValue(props.intro)}</p> : null}
            </div>
            <div className={`puck-card-grid puck-columns-${props.columns ?? "3"}`}>
              {cards.map((card, index) => (
                <article className="puck-card" key={`${textValue(card.title, "card")}-${index}`}>
                  <h3>{textValue(card.title, "Card")}</h3>
                  {textValue(card.body) ? <p>{textValue(card.body)}</p> : null}
                  {textValue(card.url) ? <a href={textValue(card.url)}>View</a> : null}
                </article>
              ))}
            </div>
          </section>
        );
      },
    },
    DownloadsBlock: {
      defaultProps: {
        ...defaultDesign,
        documents: [
          {
            description: "Optional download detail.",
            title: "Document",
            url: "",
          },
        ],
        heading: "Downloads",
      },
      fields: {
        heading: { contentEditable: true, label: "Heading", type: "text" },
        documents: {
          arrayFields: {
            description: { label: "Description", type: "textarea" },
            title: { label: "Title", type: "text" },
            url: { label: "URL", type: "text" },
          },
          defaultItemProps: {
            description: "",
            title: "New document",
            url: "",
          },
          getItemSummary: (item) => item.title || "Document",
          label: "Documents",
          type: "array",
        },
        ...sharedDesignFields,
      },
      label: "Downloads",
      render: (props) => {
        const documents = arrayValue<NonNullable<typeof props.documents>[number]>(props.documents);

        return (
          <section className={getSectionClassName(props)} style={getSectionStyle(props)}>
            <div className="puck-section-heading">
              <h2>{textValue(props.heading, "Downloads")}</h2>
            </div>
            <div className="puck-card-grid puck-columns-3">
              {documents.map((document, index) => (
                <a className="puck-card" href={textValue(document.url, "#") || "#"} key={`${textValue(document.title, "document")}-${index}`}>
                  <h3>{textValue(document.title, "Document")}</h3>
                  {textValue(document.description) ? <p>{textValue(document.description)}</p> : null}
                </a>
              ))}
            </div>
          </section>
        );
      },
    },
    GalleryBlock: {
      defaultProps: {
        ...defaultDesign,
        heading: "Gallery",
        images: [],
      },
      fields: {
        heading: { contentEditable: true, label: "Heading", type: "text" },
        images: {
          arrayFields: {
            alt: { label: "Alt text", type: "text" },
            url: { label: "Image URL", type: "text" },
          },
          defaultItemProps: {
            alt: "",
            url: "",
          },
          getItemSummary: (item) => item.alt || item.url || "Image",
          label: "Images",
          type: "array",
        },
        ...sharedDesignFields,
      },
      label: "Gallery",
      render: (props) => {
        const images = arrayValue<NonNullable<typeof props.images>[number]>(props.images);

        return (
          <section className={getSectionClassName(props)} style={getSectionStyle(props)}>
            {textValue(props.heading) ? (
              <div className="puck-section-heading">
                <h2>{textValue(props.heading)}</h2>
              </div>
            ) : null}
            <div className="puck-gallery">
              {images.map((image, index) => (
                <BuilderMedia alt={textValue(image.alt)} key={`${textValue(image.url)}-${index}`} url={textValue(image.url)} />
              ))}
            </div>
          </section>
        );
      },
    },
    SiteHeaderBlock: {
      defaultProps: {
        ...defaultDesign,
        brandLabel: "ELTRONIC",
        ctaLabel: "Contact",
        ctaUrl: "/contact",
        fullWidth: true,
        menuHandle: "primary",
        sectionPaddingX: 2,
        spacingControls: { ...defaultDesign.spacingControls, sectionPaddingX: 2 },
        sticky: false,
      },
      fields: {
        brandLabel: { contentEditable: true, label: "Brand label", type: "text" },
        menuHandle: { label: "Menu", options: [{ label: "Primary navigation", value: "primary" }], type: "select" },
        ctaLabel: { label: "CTA label", type: "text" },
        ctaUrl: { label: "CTA URL", type: "text" },
        fullWidth: toggleField("Full width header"),
        sticky: toggleField("Sticky header"),
        ...sharedDesignFields,
      },
      label: "Site header",
      resolveFields: (_data, params) => ({
        ...params.fields,
        menuHandle: {
          label: "Menu",
          options: getMenuOptions(params.metadata),
          type: "select",
        },
      }),
      render: (props) => {
        const menu = getMenu(props.puck.metadata, props.menuHandle);
        const headerProps = withFullWidth(props);

        return (
          <header className={getSectionClassName(headerProps, `puck-site-header ${props.sticky ? "puck-site-header-sticky" : ""}`)} style={getSectionStyle(headerProps)}>
            <Link className="puck-site-brand" href="/">
              {textValue(props.brandLabel, "ELTRONIC")}
            </Link>
            <nav aria-label={menu?.title ?? "Site menu"} className="puck-menu puck-menu-horizontal">
              {(menu?.items ?? []).map((item, index) => (
                <a href={item.url} key={`${item.label}-${index}`}>
                  {item.label}
                </a>
              ))}
            </nav>
            <BuilderButton link={{ label: props.ctaLabel, url: props.ctaUrl }} />
          </header>
        );
      },
    },
    HeroBlock: {
      defaultProps: {
        ...defaultDesign,
        bodySize: 1.16,
        elementGap: 1.6,
        effect: "glow",
        effectControls: { ...defaultDesign.effectControls, effect: "glow" },
        eyebrow: "Eltronic",
        headingSize: 5.2,
        heading: "Engineer a more connected operation",
        imageAlt: "",
        imageUrl: "",
        lede: "Build a clear technical story with reusable visual sections.",
        primaryLabel: "Contact",
        primaryUrl: "/contact",
        secondaryLabel: "View products",
        secondaryUrl: "/products",
        spacingControls: { ...defaultDesign.spacingControls, elementGap: 1.6 },
        typographyControls: { ...defaultDesign.typographyControls, bodySize: 1.16, headingSize: 5.2 },
      },
      fields: {
        eyebrow: { contentEditable: true, label: "Eyebrow", type: "text" },
        heading: { contentEditable: true, label: "Heading", type: "text" },
        lede: { contentEditable: true, label: "Lead text", type: "textarea" },
        imageUrl: { label: "Image URL", type: "text" },
        imageAlt: { label: "Image alt", type: "text" },
        primaryLabel: { label: "Primary label", type: "text" },
        primaryUrl: { label: "Primary URL", type: "text" },
        secondaryLabel: { label: "Secondary label", type: "text" },
        secondaryUrl: { label: "Secondary URL", type: "text" },
        ...sharedDesignFields,
      },
      label: "Hero",
      render: (props) => (
        <section className={getSectionClassName(props, "puck-hero")} style={getSectionStyle(props)}>
          <div className="puck-hero-copy">
            {props.eyebrow ? <span className="puck-kicker">{props.eyebrow}</span> : null}
            <h1>{props.heading}</h1>
            {props.lede ? <p>{props.lede}</p> : null}
            <div className="puck-actions">
              <BuilderButton link={{ label: props.primaryLabel, url: props.primaryUrl }} />
              <BuilderButton link={{ label: props.secondaryLabel, url: props.secondaryUrl }} secondary />
            </div>
          </div>
          <BuilderMedia alt={props.imageAlt || props.heading} url={props.imageUrl} />
        </section>
      ),
    },
    ImageTextBlock: {
      defaultProps: {
        ...defaultDesign,
        body: "Pair a short piece of content with an image or technical visual.",
        heading: "Image and text",
        imageAlt: "",
        imageSide: "right",
        imageUrl: "",
        linkLabel: "",
        linkUrl: "",
      },
      fields: {
        heading: { contentEditable: true, label: "Heading", type: "text" },
        body: { contentEditable: true, label: "Body", type: "textarea" },
        imageUrl: { label: "Image URL", type: "text" },
        imageAlt: { label: "Image alt", type: "text" },
        imageSide: {
          label: "Image side",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
          type: "select",
        },
        linkLabel: { label: "Link label", type: "text" },
        linkUrl: { label: "Link URL", type: "text" },
        ...sharedDesignFields,
      },
      label: "Image text",
      render: (props) => (
        <section className={getSectionClassName(props)} style={getSectionStyle(props)}>
          <div className={`puck-split ${props.imageSide === "left" ? "image-left" : ""}`}>
            <BuilderMedia alt={props.imageAlt || props.heading} url={props.imageUrl} />
            <div>
              <h2>{props.heading}</h2>
              {props.body ? <p>{props.body}</p> : null}
              <BuilderButton link={{ label: props.linkLabel, url: props.linkUrl }} secondary />
            </div>
          </div>
        </section>
      ),
    },
    MenuBlock: {
      defaultProps: {
        ...defaultDesign,
        heading: "Menu",
        menuHandle: "primary",
        orientation: "horizontal",
        showHeading: false,
      },
      fields: {
        heading: { contentEditable: true, label: "Heading", type: "text" },
        menuHandle: { label: "Menu", options: [{ label: "Primary navigation", value: "primary" }], type: "select" },
        orientation: { label: "Orientation", options: menuOrientationOptions, type: "select" },
        showHeading: toggleField("Show heading"),
        ...sharedDesignFields,
      },
      label: "Menu",
      resolveFields: (_data, params) => ({
        ...params.fields,
        menuHandle: {
          label: "Menu",
          options: getMenuOptions(params.metadata),
          type: "select",
        },
      }),
      render: (props) => {
        const menu = getMenu(props.puck.metadata, props.menuHandle);
        const items = menu?.items ?? [];

        return (
          <section className={getSectionClassName(props, "puck-menu-section")} style={getSectionStyle(props)}>
            {props.showHeading ? (
              <div className="puck-section-heading">
                <h2>{textValue(props.heading, menu?.title ?? "Menu")}</h2>
              </div>
            ) : null}
            <nav aria-label={menu?.title ?? "Menu"} className={`puck-menu puck-menu-${props.orientation ?? "horizontal"}`}>
              {items.map((item, index) => (
                <a href={item.url} key={`${item.label}-${index}`}>
                  {item.label}
                </a>
              ))}
            </nav>
          </section>
        );
      },
    },
    ProductGridBlock: {
      defaultProps: {
        ...defaultDesign,
        columns: "3",
        heading: "Featured products",
        intro: "Showcase selected Eltronic products.",
        mode: "featured",
      },
      fields: {
        heading: { contentEditable: true, label: "Heading", type: "text" },
        intro: { contentEditable: true, label: "Intro", type: "textarea" },
        mode: {
          label: "Mode",
          options: [
            { label: "Featured products", value: "featured" },
            { label: "Manual selection", value: "manual" },
          ],
          type: "select",
        },
        columns: { label: "Columns", options: columnOptions, type: "select" },
        ...sharedDesignFields,
      },
      label: "Product grid",
      render: (props) => {
        const products = getFeaturedProducts(props.puck.metadata);
        const cards = products.length
          ? products
          : [
              {
                family: "Product",
                name: "Featured product",
                slug: "products",
                summary: "Set products as featured in Payload to populate this grid.",
              },
            ];

        return (
          <section className={getSectionClassName(props)} style={getSectionStyle(props)}>
            <div className="puck-section-heading">
              <h2>{props.heading}</h2>
              {props.intro ? <p>{props.intro}</p> : null}
            </div>
            <div className={`puck-card-grid puck-columns-${props.columns ?? "3"}`}>
              {cards.map((product) => (
                <a className="puck-card" href={`/products/${product.slug}`} key={product.slug}>
                  <span className="puck-kicker">{product.family || "Product"}</span>
                  <h3>{product.name}</h3>
                  {product.summary ? <p>{product.summary}</p> : null}
                </a>
              ))}
            </div>
          </section>
        );
      },
    },
    SectionBlock: {
      defaultProps: {
        ...defaultDesign,
        backgroundColor: "rgba(23, 32, 51, 0.78)",
        body: "Use this section to introduce a service, product family, process step or key message.",
        borderControls: {
          ...defaultDesign.borderControls,
          sectionBorderColor: "rgba(139, 211, 255, 0.18)",
          sectionBorderRadius: 8,
          sectionBorderStyle: "solid",
          sectionBorderWidth: 1,
        },
        colorControls: { ...defaultDesign.colorControls, backgroundColor: "rgba(23, 32, 51, 0.78)" },
        eyebrow: "New section",
        fullWidth: false,
        heading: "Build a new section",
        primaryLabel: "Primary action",
        primaryUrl: "/contact",
        secondaryLabel: "",
        secondaryUrl: "",
        sectionBorderColor: "rgba(139, 211, 255, 0.18)",
        sectionBorderRadius: 8,
        sectionBorderStyle: "solid",
        sectionBorderWidth: 1,
        variant: "panel",
      },
      fields: {
        eyebrow: { contentEditable: true, label: "Eyebrow", type: "text" },
        heading: { contentEditable: true, label: "Heading", type: "text" },
        body: { contentEditable: true, label: "Leading text", type: "textarea" },
        primaryLabel: { label: "Primary button label", type: "text" },
        primaryUrl: { label: "Primary button URL", type: "text" },
        secondaryLabel: { label: "Secondary button label", type: "text" },
        secondaryUrl: { label: "Secondary button URL", type: "text" },
        fullWidth: toggleField("Full width section"),
        variant: {
          label: "Section style",
          options: [
            { label: "Plain", value: "plain" },
            { label: "Panel", value: "panel" },
            { label: "Band", value: "band" },
          ],
          type: "select",
        },
        ...sharedDesignFields,
      },
      label: "Section",
      render: (props) => {
        const sectionProps = withFullWidth(props);

        return (
          <section className={getSectionClassName(sectionProps, `puck-builder-section puck-builder-section-${props.variant ?? "panel"}`)} style={getSectionStyle(sectionProps)}>
            {textValue(props.eyebrow) ? <span className="puck-kicker">{textValue(props.eyebrow)}</span> : null}
            <h2>{textValue(props.heading, "Build a new section")}</h2>
            {textValue(props.body) ? <p>{textValue(props.body)}</p> : null}
            <div className="puck-actions">
              <BuilderButton link={{ label: props.primaryLabel, url: props.primaryUrl }} />
              <BuilderButton link={{ label: props.secondaryLabel, url: props.secondaryUrl }} secondary />
            </div>
          </section>
        );
      },
    },
    RichTextBlock: {
      defaultProps: {
        ...defaultDesign,
        body: "Add body copy here. Keep sections focused and easy to scan.",
        bodySize: 1.08,
        sectionWidth: "narrow",
        spacingControls: { ...defaultDesign.spacingControls, sectionWidth: "narrow" },
        typographyControls: { ...defaultDesign.typographyControls, bodySize: 1.08 },
      },
      fields: {
        body: { contentEditable: true, label: "Body", type: "textarea" },
        ...sharedDesignFields,
      },
      label: "Rich text",
      render: (props) => {
        const body = textValue(props.body, "Add body copy here.");

        return (
          <section className={getSectionClassName(props, "puck-rich-section")} style={getSectionStyle(props)}>
            <div className="puck-rich-text">
              {body.split("\n").map((paragraph, index) => (
                <p key={`${paragraph}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        );
      },
    },
    SpecTableBlock: {
      defaultProps: {
        ...defaultDesign,
        heading: "Specifications",
        rows: [
          {
            label: "Protocol",
            value: "CAN / Ethernet",
          },
        ],
      },
      fields: {
        heading: { contentEditable: true, label: "Heading", type: "text" },
        rows: {
          arrayFields: {
            label: { label: "Label", type: "text" },
            value: { label: "Value", type: "text" },
          },
          defaultItemProps: {
            label: "Specification",
            value: "Value",
          },
          getItemSummary: (item) => item.label || "Row",
          label: "Rows",
          type: "array",
        },
        ...sharedDesignFields,
      },
      label: "Spec table",
      render: (props) => {
        const rows = arrayValue<NonNullable<typeof props.rows>[number]>(props.rows);

        return (
          <section className={getSectionClassName(props)} style={getSectionStyle(props)}>
            <div className="puck-section-heading">
              <h2>{textValue(props.heading, "Specifications")}</h2>
            </div>
            <dl className="puck-spec-table">
              {rows.map((row, index) => (
                <div key={`${textValue(row.label, "row")}-${index}`}>
                  <dt>{textValue(row.label, "Label")}</dt>
                  <dd>{textValue(row.value, "Value")}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      },
    },
  },
  root: {
    defaultProps: {
      accentColor: "#8bd3ff",
      backgroundColor: "#020617",
      fontFamily: "display",
      pagePaddingBottom: 0,
      pagePaddingTop: 0,
      pageTitle: "New Eltronic page",
      sectionSpacing: "normal",
      surfaceColor: "23, 32, 51",
      surfaceOpacity: 0.78,
      textColor: "#f1f5f9",
      themePreset: "eltronicDark",
    },
    fields: {
      pageTitle: { contentEditable: true, label: "Page title", type: "text" },
      themePreset: {
        label: "Theme",
        options: [
          { label: "Eltronic dark", value: "eltronicDark" },
          { label: "Precision light", value: "precisionLight" },
          { label: "Signal contrast", value: "signalContrast" },
        ],
        type: "select",
      },
      fontFamily: { label: "Base font", options: fontOptions, type: "select" },
      backgroundColor: { label: "Page background", type: "text" },
      textColor: { label: "Text colour", type: "text" },
      accentColor: { label: "Accent colour", type: "text" },
      pagePaddingTop: { label: "Page top padding (rem)", max: 10, min: 0, step: 0.25, type: "number" },
      pagePaddingBottom: { label: "Page bottom padding (rem)", max: 10, min: 0, step: 0.25, type: "number" },
      surfaceColor: {
        label: "Surface RGB",
        placeholder: "23, 32, 51",
        type: "text",
      },
      surfaceOpacity: {
        label: "Surface opacity",
        max: 1,
        min: 0.2,
        step: 0.05,
        type: "number",
      },
      sectionSpacing: {
        label: "Section spacing",
        options: [
          { label: "Compact", value: "compact" },
          { label: "Normal", value: "normal" },
          { label: "Spacious", value: "spacious" },
        ],
        type: "select",
      },
    },
    render: Root,
  },
};
