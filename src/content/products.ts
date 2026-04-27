export type ProductTemplate = "hmi" | "data-logger" | "module";

export type ProductImage = {
  src: string;
  alt: string;
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

const topconDocuments: ProductDocument[] = [
  { label: "Request full data sheet", url: "/contact" },
  { label: "Request basic data sheet", url: "/contact" },
];

function comingSoonImages(productName: string): ProductImage[] {
  return [1, 2, 3].map((index) => ({
    src: `/product-images/placeholders/images-coming-soon-${index}.svg`,
    alt: `${productName} additional image coming soon ${index}`,
  }));
}

function withComingSoonImages(product: Product): Product {
  const baseImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return {
    ...product,
    images: [...baseImages, ...comingSoonImages(product.name)],
  };
}

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
    name: "I&Q CAN-bus I/O Module",
    category: "I/O module",
    family: "Eltronic",
    template: "module",
    sourceUrl: "https://eltronic.co.uk/eltronic-i-o-iq-can-bus-module",
    image: {
      src: "/product-images/eltronic-iq-can-bus-module.jpg",
      alt: "Eltronic I&Q CAN-bus I/O module",
    },
    summary:
      "CAN-bus I/O expansion module for equipment control projects, with configuration details confirmed during enquiry.",
    description:
      "The I&Q CAN-bus I/O Module supports control-system expansion where additional equipment inputs, outputs and CAN connectivity need to be discussed around the application.",
    highlights: [
      "Eltronic-owned product page for CAN-bus I/O expansion",
      "Technical data sections exist for housing, user interface and real time clock",
      "Version options can be confirmed during enquiry",
    ],
    specifications: [
      { label: "Product family", value: "Eltronic CAN-bus I/O expansion" },
      { label: "Housing", value: "Application dependent" },
      { label: "User interface", value: "Project specification" },
      { label: "Real time clock", value: "Available on request" },
    ],
    variants: [
      { name: "Version A", details: "To be updated", articleNumber: "TBU" },
      { name: "Version B", details: "To be updated", articleNumber: "TBU" },
      { name: "Version C", details: "To be updated", articleNumber: "TBU" },
      { name: "Version D", details: "To be updated", articleNumber: "TBU" },
    ],
    enquiryPrompt: "Ask about the I&Q CAN-bus module",
  },
  {
    slug: "topcon-opus-b6e",
    name: "TOPCON OPUS B6e",
    category: "HMI display",
    family: "TOPCON OPUS B series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/topcon-opus-b6e",
    image: {
      src: "/product-images/topcon-opus-b6e.jpg",
      alt: "TOPCON OPUS B6e front view",
    },
    summary:
      "Large B-series HMI with a bright 10.1 inch display, rugged housing and IP66 protection.",
    description:
      "The OPUS B6e is positioned for municipal, utility, agriculture, construction and special-purpose equipment where a bright, robust HMI is needed.",
    highlights: [
      "10.1 inch optically bonded display with 1280 x 800 resolution",
      "IP66 protection and wide temperature operating range",
      "Configurable with OPUS Projektor, CODESYS, ISO-Horizon and C/Qt",
      "Four CAN bus interfaces plus RS232, USB and Ethernet",
    ],
    specifications: [
      { label: "Display", value: "10.1 in, 15:9 TFT, 1280 x 800 px, 1000 cd/m2" },
      { label: "Processor", value: "32-bit 1000 MHz Freescale I.MX6" },
      { label: "Memory", value: "2GB DDR2 RAM, 48GB NAND flash" },
      { label: "Interfaces", value: "4x CAN bus, RS232, USB 2.0, Ethernet" },
      { label: "Housing", value: "258.9 x 177.7 x 34.8 mm, aluminium die cast" },
      { label: "Protection", value: "IP66" },
      { label: "Operating range", value: "-30 to +75 deg C" },
    ],
    documents: topconDocuments,
    enquiryPrompt: "Configure a B6e HMI",
  },
  {
    slug: "topcon-opus-b4e",
    name: "TOPCON OPUS B4e",
    category: "HMI display",
    family: "TOPCON OPUS B series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/topcon-opus-b4e",
    image: {
      src: "/product-images/topcon-opus-b4e.jpg",
      alt: "TOPCON OPUS B4e front view",
    },
    summary:
      "7 inch B-series ECO HMI with bright display, aluminium housing and IP66 protection.",
    description:
      "The OPUS B4e gives the B-series rugged HMI pattern in a 7 inch format for quick implementation across vehicle and equipment applications.",
    highlights: [
      "7 inch optically bonded display with 800 cd/m2 brightness",
      "Landscape or portrait orientation",
      "Two CAN bus interfaces plus RS232, USB and Ethernet",
      "Linux-based platform supporting OPUS Projektor and CODESYS workflows",
    ],
    specifications: [
      { label: "Display", value: "7 in, 15:9 TFT, 800 x 480 px, 800 cd/m2" },
      { label: "Processor", value: "32-bit 800 MHz Freescale I.MX6" },
      { label: "Memory", value: "1GB DDR2 RAM, 4GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, RS232, USB 2.0, Ethernet" },
      { label: "Housing", value: "202 x 132.5 x 40.3 mm, aluminium die cast" },
      { label: "Protection", value: "IP66" },
      { label: "Operating range", value: "-30 to +75 deg C" },
    ],
    documents: topconDocuments,
    enquiryPrompt: "Discuss a B4e HMI project",
  },
  {
    slug: "topcon-opus-b3e",
    name: "TOPCON OPUS B3e",
    category: "HMI display",
    family: "TOPCON OPUS B series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/topcon-opus-b3e",
    image: {
      src: "/product-images/topcon-opus-b3e.jpg",
      alt: "TOPCON OPUS B3e front view",
    },
    summary:
      "Compact 5 inch B-series ECO HMI for rugged field and equipment applications.",
    description:
      "The OPUS B3e brings the B-series format into a compact 5 inch HMI, suited to tight operator cabins and distributed control positions.",
    highlights: [
      "5 inch optically bonded 800 cd/m2 display",
      "IP66 protection with -30 to +75 deg C operating range",
      "Two CAN bus interfaces and Ethernet connectivity",
      "Touchscreen interface with Linux-based operating system",
    ],
    specifications: [
      { label: "Display", value: "5 in, 15:9 TFT, 800 x 480 px, 800 cd/m2" },
      { label: "Processor", value: "32-bit 800 MHz Freescale I.MX6" },
      { label: "Memory", value: "512MB DDR2 RAM, 4GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, RS232, USB 2.0, Ethernet" },
      { label: "Housing", value: "163 x 99.7 x 40.8 mm, aluminium die cast" },
      { label: "Protection", value: "IP66" },
      { label: "Operating range", value: "-30 to +75 deg C" },
    ],
    documents: topconDocuments,
    variants: [
      { name: "BASIC PLUS with OPUS Projektor", details: "I.MX6, 512MB RAM, 2GB mass storage, 2 CAN bus" },
      { name: "BASIC with OPUS Projektor", details: "I.MX6, 512MB RAM, 2GB mass storage, 2 CAN bus" },
      { name: "BASIC with CoDeSys", details: "I.MX6, 512MB RAM, 2GB mass storage, 2 CAN bus" },
      { name: "BASIC PLUS with CoDeSys", details: "I.MX6, 512MB RAM, 2GB mass storage, 2 CAN bus" },
    ],
    enquiryPrompt: "Choose a B3e variant",
  },
  {
    slug: "topcon-opus-a8s",
    name: "TOPCON OPUS A8s",
    category: "HMI display",
    family: "TOPCON OPUS A series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/topcon-opus-a8s",
    image: {
      src: "/product-images/topcon-opus-a8s.jpg",
      alt: "TOPCON OPUS A8s front view",
    },
    summary:
      "12.1 inch A-series HMI with hard keys, soft keys, encoder, CAN bus and video input options.",
    description:
      "The OPUS A8s is the large-format keyed A-series option, designed for demanding operator interfaces that need screen space and physical controls.",
    highlights: [
      "12.1 inch high-resolution display with aluminium casing",
      "Eight soft keys, four hard keys, encoder and touchscreen",
      "Two CAN bus ports plus Ethernet and USB connectivity",
      "Basic and full line variants for different connection needs",
    ],
    specifications: [
      { label: "Display", value: "12.1 in, 16:10 TFT, 1280 x 800 px, 1000 cd/m2" },
      { label: "Processor", value: "32-bit 1GHz NXP I.MX6 quad" },
      { label: "Memory", value: "1GB DDR2 RAM, 8GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, RS232, Ethernet, USB, analog/digital I/O" },
      { label: "User interface", value: "8 soft keys, 4 hard keys, encoder, touchscreen" },
      { label: "Protection", value: "IP65 and IP66" },
      { label: "Operating range", value: "-30 to +65 deg C" },
    ],
    documents: topconDocuments,
    variants: [
      { name: "BASIC with OPUS Projektor", details: "Solo processor, 512MB RAM, 4GB storage", articleNumber: "OPUSA8SN1CANB000" },
      { name: "BASIC with CoDeSys", details: "Solo processor, 512MB RAM, 4GB storage", articleNumber: "OPUSA8SN1CDSB000" },
      { name: "FULL with OPUS Projektor", details: "Quad processor, 1024MB RAM, 8GB storage", articleNumber: "OPUSA8SN1CANF000" },
      { name: "FULL with CoDeSys", details: "Quad processor, 1024MB RAM, 8GB storage", articleNumber: "OPUSA8SN1CDSF000" },
    ],
    enquiryPrompt: "Specify an A8s HMI",
  },
  {
    slug: "topcon-opus-a8e",
    name: "TOPCON OPUS A8e",
    category: "HMI display",
    family: "TOPCON OPUS A series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/topcon-opus-a8e",
    image: {
      src: "/product-images/topcon-opus-a8e.jpg",
      alt: "TOPCON OPUS A8e front view",
    },
    summary:
      "Keyless 12.1 inch A-series HMI with glass touch panel, high performance and rugged enclosure.",
    description:
      "The OPUS A8e is the touch-led large A-series unit for demanding users who want high performance in a clean, keyless HMI form.",
    highlights: [
      "12.1 inch touch display with 1280 x 800 resolution",
      "High-performance scalable process architecture",
      "Two CAN bus interfaces, Ethernet and USB high speed",
      "Suitable for complex HMI and video raster applications",
    ],
    specifications: [
      { label: "Display", value: "12.1 in, 16:10 TFT, 1280 x 800 px, 1000 cd/m2" },
      { label: "Processor", value: "32-bit 1GHz NXP I.MX6 quad" },
      { label: "Memory", value: "1GB DDR2 RAM, 8GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, RS232, Ethernet, analog/digital I/O, USB" },
      { label: "User interface", value: "Touchscreen" },
      { label: "Protection", value: "IP65 and IP66" },
      { label: "Operating range", value: "-30 to +65 deg C" },
    ],
    documents: topconDocuments,
    variants: [
      { name: "BASIC with OPUS Projektor", details: "Solo processor, 512MB RAM, 4GB storage", articleNumber: "OPUSA8EN1CANB000" },
      { name: "BASIC with CoDeSys", details: "Solo processor, 512MB RAM, 4GB storage", articleNumber: "OPUSA8EN1CDSB000" },
      { name: "FULL with OPUS Projektor", details: "Quad processor, 1024MB RAM, 8GB storage", articleNumber: "OPUSA8EN1CANF000" },
      { name: "FULL with CoDeSys", details: "Quad processor, 1024MB RAM, 8GB storage", articleNumber: "OPUSA8EN1CDSF000" },
    ],
    enquiryPrompt: "Specify an A8e HMI",
  },
  {
    slug: "topcon-opus-a6s",
    name: "TOPCON OPUS A6s",
    category: "HMI display",
    family: "TOPCON OPUS A series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/topcon-a6s",
    image: {
      src: "/product-images/topcon-opus-a6s.jpg",
      alt: "TOPCON OPUS A6s front view",
    },
    summary:
      "7 inch A-series HMI with soft keys, hard keys, encoder, CAN bus and optional camera inputs.",
    description:
      "The OPUS A6s adds practical physical controls and expansion options to the 7 inch A-series platform for applications with greater technical demands.",
    highlights: [
      "7 inch display with 12 soft keys, hard keys, encoder and touchscreen",
      "Two CAN bus ports with Ethernet, RS232 and USB",
      "Front USB and multiple camera input options",
      "Standalone or dashboard installation options",
    ],
    specifications: [
      { label: "Display", value: "7 in, 15:9 TFT, 800 x 480 px, 500 cd/m2" },
      { label: "Processor", value: "32-bit 800 MHz Freescale I.MX6" },
      { label: "Memory", value: "512MB DDR2 RAM, 4GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, Ethernet, RS232, USB, analog/digital I/O" },
      { label: "User interface", value: "12 soft keys, hard keys, encoder, touchscreen" },
      { label: "Protection", value: "IP65 and IP66" },
      { label: "Operating range", value: "-30 to +65 deg C" },
    ],
    documents: topconDocuments,
    variants: [
      { name: "BASIC with OPUS Projektor", details: "I.MX6, 512MB RAM, 2GB storage", articleNumber: "OPUSA6SN2CANB000" },
      { name: "BASIC with CoDeSys", details: "I.MX6, 512MB RAM, 2GB storage", articleNumber: "OPUSA6SN2CDSB000" },
      { name: "FULL with OPUS Projektor", details: "I.MX6, 512MB RAM, 4GB storage", articleNumber: "OPUSA6SN2CANF000" },
      { name: "FULL with CoDeSys", details: "I.MX6, 512MB RAM, 4GB storage", articleNumber: "OPUSA6SN2CDSF000" },
    ],
    enquiryPrompt: "Specify an A6s HMI",
  },
  {
    slug: "topcon-opus-a6e",
    name: "TOPCON OPUS A6e",
    category: "HMI display",
    family: "TOPCON OPUS A series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/topcon-new",
    image: {
      src: "/product-images/topcon-opus-a6e.jpg",
      alt: "TOPCON OPUS A6e front view",
    },
    summary:
      "7 inch touch HMI for complex control interfaces with CAN bus, video and configurable I/O.",
    description:
      "The OPUS A6e is the touch-focused 7 inch A-series option for applications that need a bright display, CAN bus integration and camera support.",
    highlights: [
      "7 inch 800 x 480 display designed for readability in operating conditions",
      "Two CAN bus ports and configurable analog/digital I/O",
      "Integrated camera input with optional additional camera inputs",
      "Available as standalone or dashboard solution",
    ],
    specifications: [
      { label: "Display", value: "7 in, 15:9 TFT, 800 x 480 px, 500 cd/m2" },
      { label: "Processor", value: "32-bit 800 MHz Freescale I.MX6" },
      { label: "Memory", value: "512MB DDR2 RAM, 4GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, Ethernet, RS232, USB, analog/digital I/O" },
      { label: "User interface", value: "Touchscreen" },
      { label: "Protection", value: "IP65 and IP66" },
      { label: "Operating range", value: "-30 to +65 deg C" },
    ],
    documents: topconDocuments,
    variants: [
      { name: "BASIC with OPUS Projektor", details: "I.MX6, 512MB RAM, 2GB storage", articleNumber: "OPUSA6EN2CANB000" },
      { name: "BASIC with CoDeSys", details: "I.MX6, 512MB RAM, 2GB storage", articleNumber: "OPUSA6EN2CDSB000" },
      { name: "FULL with OPUS Projektor", details: "I.MX6, 512MB RAM, 4GB storage", articleNumber: "OPUSA6EN2CANF000" },
      { name: "FULL with CoDeSys", details: "I.MX6, 512MB RAM, 4GB storage", articleNumber: "OPUSA6EN2CDSF000" },
    ],
    enquiryPrompt: "Specify an A6e HMI",
  },
  {
    slug: "topcon-opus-a3e",
    name: "TOPCON OPUS A3e",
    category: "HMI display",
    family: "TOPCON OPUS A series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/opus-a3e",
    image: {
      src: "/product-images/topcon-opus-a3e.jpg",
      alt: "TOPCON OPUS A3e front view",
    },
    summary:
      "Compact 4.3 inch touch HMI with strong price-to-performance value and CAN bus support.",
    description:
      "The OPUS A3e is an entry-level A-series HMI that keeps the core OPUS features in a lightweight and compact operator console.",
    highlights: [
      "4.3 inch display with optional touchscreen configuration",
      "Two CAN bus ports, Ethernet, RS232 and USB full speed",
      "Configurable analog/digital I/O",
      "Compact housing under 1kg",
    ],
    specifications: [
      { label: "Display", value: "4.3 in, 15:9 TFT, 480 x 272 px, 400 cd/m2" },
      { label: "Processor", value: "32-bit 532 MHz Freescale I.MX35" },
      { label: "Memory", value: "256MB DDR2 RAM, 1GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, Ethernet, RS232, USB, analog/digital I/O" },
      { label: "User interface", value: "Touchscreen" },
      { label: "Protection", value: "IP65 and IP66" },
      { label: "Operating range", value: "-30 to +65 deg C" },
    ],
    documents: topconDocuments,
    variants: [
      { name: "BASIC with OPUS Projektor", details: "I.MX35, 128MB RAM, 512MB storage", articleNumber: "OPUSA3EN1CANB000" },
      { name: "BASIC with CoDeSys", details: "I.MX35, 128MB RAM, 512MB storage", articleNumber: "OPUSA3EN1CDSB000" },
      { name: "FULL with OPUS Projektor", details: "I.MX35, 256MB RAM, 1GB storage", articleNumber: "OPUSA3EN1CANF000" },
      { name: "FULL with CoDeSys", details: "I.MX35, 256MB RAM, 1GB storage", articleNumber: "OPUSA3EN1CDSF000" },
    ],
    enquiryPrompt: "Specify an A3e HMI",
  },
  {
    slug: "topcon-opus-a3s",
    name: "TOPCON OPUS A3s",
    category: "HMI display",
    family: "TOPCON OPUS A series",
    template: "hmi",
    sourceUrl: "https://eltronic.co.uk/opus-test-a3s",
    image: {
      src: "/product-images/topcon-opus-a3s.jpg",
      alt: "TOPCON OPUS A3s front view",
    },
    summary:
      "Compact 4.3 inch HMI with soft keys, hard keys, encoder, CAN bus and front USB.",
    description:
      "The OPUS A3s extends the compact A3 platform with physical controls and extra connectivity for equipment operators who need tactile interaction.",
    highlights: [
      "4.3 inch display with eight soft keys, hard keys and encoder",
      "Two CAN bus ports, Ethernet, RS232 and USB",
      "Front USB on the full configuration",
      "IP65/IP66 protection for harsh operating environments",
    ],
    specifications: [
      { label: "Display", value: "4.3 in, 15:9 TFT, 480 x 272 px, 400 cd/m2" },
      { label: "Processor", value: "32-bit 532 MHz Freescale I.MX35" },
      { label: "Memory", value: "256MB DDR2 RAM, 1GB NAND flash" },
      { label: "Interfaces", value: "2x CAN bus, Ethernet, RS232, USB, analog/digital I/O" },
      { label: "User interface", value: "8 soft keys, 3 hard keys, encoder, touchscreen" },
      { label: "Protection", value: "IP65 and IP66" },
      { label: "Operating range", value: "-30 to +65 deg C" },
    ],
    documents: topconDocuments,
    variants: [
      { name: "BASIC with OPUS Projektor", details: "I.MX35, 128MB RAM, 512MB storage", articleNumber: "OPUSA3SN1CANB000" },
      { name: "BASIC with CoDeSys", details: "I.MX35, 128MB RAM, 512MB storage", articleNumber: "OPUSA3SN1CDSB000" },
      { name: "FULL with OPUS Projektor", details: "I.MX35, 256MB RAM, 1GB storage", articleNumber: "OPUSA3SN1CANF000" },
      { name: "FULL with CoDeSys", details: "I.MX35, 256MB RAM, 1GB storage", articleNumber: "OPUSA3SN1CDSF000" },
    ],
    enquiryPrompt: "Specify an A3s HMI",
  },
];

export const products: Product[] = seedProducts.map(withComingSoonImages);

export const productFamilies = Array.from(
  new Set(products.map((product) => product.family)),
);

export const featuredProducts = products.filter((product) =>
  ["autopi-can-fd-pro", "topcon-opus-b6e", "topcon-opus-a8s", "eltronic-iq-can-bus-module"].includes(
    product.slug,
  ),
);
