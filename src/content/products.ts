import generatedProductGalleryAssets from "./product-gallery-assets.json";
import topconProductsData from "./topcon-products.json";

export type ProductTemplate = "hmi" | "data-logger" | "module";

export type ProductImage = {
  src: string;
  alt: string;
  fileName?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductDocument = {
  label: string;
  url: string;
};

export const productModuleDefinitions = [
  {
    key: "gallery",
    label: "Gallery",
    description: "Main product images and thumbnail gallery.",
  },
  {
    key: "highlights",
    label: "Highlights",
    description: "Bulleted selling points or feature notes.",
  },
  {
    key: "specifications",
    label: "Technical data",
    description: "Structured specification table.",
  },
  {
    key: "documents",
    label: "Documents",
    description: "Downloads, data sheets and support links.",
  },
  {
    key: "variants",
    label: "Variables and variants",
    description: "Product options, SKUs, prices and article numbers.",
  },
  {
    key: "enquiry",
    label: "Enquiry CTA",
    description: "Product-specific enquiry prompt and quote route.",
  },
] as const;

export type ProductModuleKey = (typeof productModuleDefinitions)[number]["key"];
export type ProductModules = Record<ProductModuleKey, boolean>;

export type ProductVariant = {
  name: string;
  details: string;
  sku?: string;
  price?: string;
  articleNumber?: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  family: string;
  template: ProductTemplate;
  sourceUrl: string;
  sku?: string;
  price?: string;
  tags?: string[];
  modules?: ProductModules;
  image: ProductImage;
  images?: ProductImage[];
  summary: string;
  description: string;
  highlights: string[];
  specifications: ProductSpec[];
  documents?: ProductDocument[];
  variants?: ProductVariant[];
  enquiryPrompt: string;
};

const topconProducts = topconProductsData as Product[];

const generatedProductGallery = generatedProductGalleryAssets as Record<string, ProductImage[]>;

const seedProducts: Product[] = [
  {
    slug: "autopi-can-fd-pro",
    name: "AutoPi CAN-FD Pro",
    category: "CAN data logging",
    family: "AutoPi",
    template: "data-logger",
    sourceUrl: "https://eltronic.co.uk/autopi",
    image: {
      src: "/product-images/autopi-can-fd-pro.png",
      alt: "AutoPi CAN-FD Pro device and antenna kit",
    },
    summary:
      "Dual CAN-FD data logging, edge processing, local storage and secure cloud upload for vehicles and specialist equipment.",
    description:
      "The CAN-FD Pro is the data-led side of the Eltronic range: a Linux-based edge device for high-speed automotive and equipment logging, diagnostics and remote configuration.",
    highlights: [
      "Dual CAN/CAN-FD logging with support for additional external CAN interfaces",
      "32GB embedded storage with support for external USB storage",
      "Raw or decoded CAN data upload to storage endpoints such as AWS S3",
      "On-device CAN decoding using DBC, Python and SocketCAN workflows",
      "Remote live debugging through secure VPN access",
      "Plug-and-play use in 12V and 24V vehicles or plant",
    ],
    specifications: [
      { label: "Processor", value: "Broadcom BCM2711 Quad-core Cortex-A72 1.5GHz" },
      { label: "Memory", value: "4GB LPDDR2 SDRAM" },
      { label: "Storage", value: "32GB onboard eMMC, expandable via USB" },
      { label: "Connectivity", value: "4G/LTE Cat 4, WiFi, Bluetooth 5.0/BLE" },
      { label: "Positioning", value: "GPS, GLONASS, BeiDou, Galileo, QZSS" },
      { label: "Automotive interface", value: "2x CAN-FD up to 5Mbps with filters" },
      { label: "Operating system", value: "Raspbian OS with AutoPi Core software" },
      { label: "Operating range", value: "-20 to 70 deg C" },
    ],
    documents: [
      {
        label: "AutoPi CAN-FD Pro datasheet",
        url: "https://www.autopi.io/static/pdf/autopi_CAN_FD_Pro_datasheet.pdf",
      },
    ],
    enquiryPrompt: "Plan a CAN data logging setup",
  },
  {
    slug: "eltronic-iq-can-bus-module",
    name: "I&Q CAN-Bus I/O Module",
    category: "I/O module",
    family: "Eltronic",
    template: "module",
    sourceUrl: "https://eltronic.co.uk/eltronic-i-o-iq-can-bus-module",
    image: {
      src: "/product-images/eltronic-iq-can-bus-module.jpg",
      alt: "Eltronic I&Q CAN-Bus I/O module",
    },
    summary:
      "Application-specific CAN-Bus I/O expansion for control projects that need extra inputs, outputs or interface points.",
    description:
      "The I&Q CAN-Bus I/O Module supports control-system expansion where additional equipment inputs, outputs and CAN connectivity need to be specified around the application, enclosure, operator interface and support requirements.",
    highlights: [
      "CAN-Bus I/O expansion for application-specific control projects",
      "Useful where additional signals, operator controls or interface points need to be brought into a wider system",
      "Configuration, housing and connection details are confirmed during technical enquiry",
    ],
    specifications: [
      { label: "Product family", value: "Eltronic CAN-Bus I/O expansion" },
      { label: "Interface", value: "CAN-Bus control-system integration" },
      { label: "Housing", value: "Specified around the operating environment" },
      { label: "User interface", value: "Defined during project scoping" },
      { label: "Configuration", value: "Confirmed against I/O, wiring and support requirements" },
    ],
    enquiryPrompt: "Ask about the I&Q CAN-Bus module",
  },
  ...topconProducts,
];

export function getGeneratedProductGalleryImages(slug: string) {
  return generatedProductGallery[slug] ?? [];
}

function withGeneratedGallery(product: Product): Product {
  const images = mergeProductImages(
    [product.image, ...(product.images ?? []), ...getGeneratedProductGalleryImages(product.slug)],
    product.name,
  );

  return {
    ...product,
    image: images[0] ?? product.image,
    images,
  };
}

function mergeProductImages(images: ProductImage[], fallbackAlt: string) {
  const seen = new Set<string>();

  return images
    .filter((image) => image.src)
    .map((image) => ({
      src: image.src,
      alt: image.alt || fallbackAlt,
      fileName: image.fileName,
    }))
    .filter((image) => {
      if (seen.has(image.src)) {
        return false;
      }

      seen.add(image.src);
      return true;
    });
}

export const products: Product[] = seedProducts.map(withGeneratedGallery);

export const productFamilies = Array.from(
  new Set(products.map((product) => product.family)),
);

export const featuredProducts = products.filter((product) =>
  ["autopi-can-fd-pro", "topcon-opus-b6e", "topcon-opus-a8s", "eltronic-iq-can-bus-module"].includes(
    product.slug,
  ),
);
