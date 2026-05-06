export type SiteThemePreset = "eltronic" | "halogen" | "graphite" | "clean";
export type SiteBackgroundStyle = "grid" | "soft" | "minimal";
export type SiteVisualDensity = "compact" | "balanced" | "spacious";
export type SiteHeroVisualVariant = "display" | "network" | "sectors" | "data";

export type SiteBuilderTheme = {
  preset: SiteThemePreset;
  accentColor: string;
  secondaryColor: string;
  highlightColor: string;
  backgroundStyle: SiteBackgroundStyle;
  visualDensity: SiteVisualDensity;
};

export type SiteBuilderHero = {
  brand: string;
  titleSuffix: string;
  rolePhrases: string[];
  lede: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  visualLabel: string;
  visualVariant: SiteHeroVisualVariant;
};

export type SiteBuilderSectionKey = "services" | "products" | "software" | "workflow" | "sectors";

export type SiteBuilderSection = {
  key: SiteBuilderSectionKey;
  label: string;
  enabled: boolean;
  order: number;
  eyebrow: string;
  title: string;
  summary: string;
  ctaLabel?: string;
  ctaHref?: string;
  panelEyebrow?: string;
  panelTitle?: string;
  panelSummary?: string;
};

export type SiteBuilderSettings = {
  theme: SiteBuilderTheme;
  home: {
    hero: SiteBuilderHero;
    sections: SiteBuilderSection[];
  };
};

export const themePresetOptions: Array<{
  key: SiteThemePreset;
  label: string;
  description: string;
}> = [
  {
    key: "eltronic",
    label: "Eltronic grid",
    description: "Current technical dark grid with cyan/magenta energy.",
  },
  {
    key: "halogen",
    label: "Japanese halogen",
    description: "Sharper magenta edges with warmer highlights.",
  },
  {
    key: "graphite",
    label: "Graphite lab",
    description: "Quieter engineering feel with steel blue accents.",
  },
  {
    key: "clean",
    label: "Clean specification",
    description: "More restrained, less glow, focused on readable content.",
  },
];

export const defaultSiteBuilderSettings: SiteBuilderSettings = {
  theme: {
    preset: "eltronic",
    accentColor: "#8bd3ff",
    secondaryColor: "#b7a3ff",
    highlightColor: "#fbbf24",
    backgroundStyle: "grid",
    visualDensity: "balanced",
  },
  home: {
    hero: {
      brand: "Eltronic",
      titleSuffix: ";",
      rolePhrases: [
        "systems integrator",
        "systems consultant",
        "control systems partner",
        "software systems engineer",
      ],
      lede:
        "Intelligent HMI displays, CAN data logging, custom harnesses and full-stack software integration for mobile equipment, fixed installations and specialist vehicles.",
      primaryCtaLabel: "Browse products",
      primaryCtaHref: "/products",
      secondaryCtaLabel: "Start an enquiry",
      secondaryCtaHref: "/contact",
      visualLabel: "Eltronic interactive code mark",
      visualVariant: "display",
    },
    sections: [
      {
        key: "services",
        label: "Application systems",
        enabled: true,
        order: 1,
        eyebrow: "01",
        title: "Application-ready systems",
        summary:
          "Rugged HMIs, CAN data capture and bespoke integration work come together around the operator, environment and project requirement.",
        ctaLabel: "Explore solutions",
        ctaHref: "/solutions",
      },
      {
        key: "products",
        label: "Featured products",
        enabled: true,
        order: 2,
        eyebrow: "02",
        title: "Featured products",
        summary: "A focused selection of displays, data logging tools and control modules for quote-led equipment projects.",
      },
      {
        key: "software",
        label: "Software CTA",
        enabled: true,
        order: 3,
        eyebrow: "03",
        title: "Software, systems and device integration",
        summary:
          "Full-stack internal platforms, API integration, embedded services and technical consultancy for more efficient operations.",
        ctaLabel: "Explore Software & Systems",
        ctaHref: "/software-it",
        panelEyebrow: "software.systems",
        panelTitle: "Internal platforms, data and connected devices.",
        panelSummary:
          "From shipping and CRM integrations to MQTT services, HTTP APIs, internal servers, dashboards and connected hardware workflows, Eltronic helps reduce errors, manual admin and wasted time.",
      },
      {
        key: "workflow",
        label: "Workflow",
        enabled: true,
        order: 4,
        eyebrow: "04",
        title: "Complex projects, made straightforward",
        summary: "The engineering can be detailed. The customer experience should still feel clear, structured and easy to move through.",
      },
      {
        key: "sectors",
        label: "Sectors",
        enabled: true,
        order: 5,
        eyebrow: "05",
        title: "Application sectors",
        summary:
          "Agriculture, construction, logistics and industrial automation each have different pressures around reliability, operator feedback and maintainable control systems.",
        ctaLabel: "View sectors",
        ctaHref: "/sectors",
        panelEyebrow: "05",
        panelTitle: "Application sectors",
      },
    ],
  },
};
