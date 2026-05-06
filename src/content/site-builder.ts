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
        "prototype systems",
        "technical integration",
        "software and electronics",
        "connected operations",
      ],
      lede:
        "Eltronic designs, builds and integrates practical technical systems: working prototypes, operator screens, CAN and electronics, backend software, APIs, plugins and internal tools for equipment, fleets and business operations.",
      primaryCtaLabel: "Discuss a project",
      primaryCtaHref: "/contact",
      secondaryCtaLabel: "Explore capabilities",
      secondaryCtaHref: "/solutions",
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
        title: "Bespoke systems and prototypes",
        summary:
          "From tracking systems and simulator interfaces to electronics, software, plugins and connected equipment, the work is shaped around the application.",
        ctaLabel: "Explore services",
        ctaHref: "/solutions",
      },
      {
        key: "products",
        label: "Product modules",
        enabled: true,
        order: 4,
        eyebrow: "04",
        title: "Products, modules and building blocks",
        summary:
          "A growing catalogue of hardware, devices and technical products that can be supplied, adapted or integrated into wider systems.",
      },
      {
        key: "software",
        label: "Software CTA",
        enabled: true,
        order: 2,
        eyebrow: "02",
        title: "Industrial software, control logic and connected data",
        summary:
          "PLC-adjacent software, control-unit applications, device data, industrial dashboards and operational IT for equipment and production environments.",
        ctaLabel: "Explore software systems",
        ctaHref: "/software-it",
        panelEyebrow: "software.control",
        panelTitle: "Software that keeps practical systems working.",
        panelSummary:
          "From HMI workflows and control-unit tools to telemetry, dashboards, remote access and manufacturing-system links, Eltronic helps make equipment and operations easier to run.",
      },
      {
        key: "workflow",
        label: "Workflow",
        enabled: true,
        order: 3,
        eyebrow: "03",
        title: "From idea to working system",
        summary:
          "Projects can involve electronics, software, data, products and support. The process keeps the work controlled from first idea to usable system.",
      },
      {
        key: "sectors",
        label: "Sectors",
        enabled: true,
        order: 5,
        eyebrow: "05",
        title: "Where the work fits",
        summary:
          "Eltronic supports specialist vehicles, operational systems, simulator and test environments, product ideas and business software that needs practical technical support.",
        ctaLabel: "View sectors",
        ctaHref: "/sectors",
        panelEyebrow: "05",
        panelTitle: "Applications and operating environments",
      },
    ],
  },
};
