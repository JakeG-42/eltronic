#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

const DATA_KEY = "eltronic:managed-data:v1";
const POSTGRES_TABLE_NAME = "eltronic_managed_data";
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(rootDir, "public", "product-images", "generated");
const manifestPath = path.join(rootDir, "src", "content", "product-gallery-assets.json");
const shouldSyncManagedData = process.argv.includes("--sync-managed-data");

const products = [
  {
    slug: "autopi-can-fd-pro",
    name: "AutoPi CAN-FD Pro",
    family: "AutoPi",
    type: "logger",
    accent: "#67e8f9",
    secondary: "#a78bfa",
    scale: "CAN-FD edge logger",
    chips: ["Dual CAN-FD", "LTE/GNSS", "Secure upload", "SocketCAN"],
    ports: ["CAN-FD 1", "CAN-FD 2", "LTE", "GNSS", "USB storage"],
    context: "Fleet, vehicle and equipment data logging",
  },
  {
    slug: "eltronic-iq-can-bus-module",
    name: "I&Q CAN-Bus I/O Module",
    family: "Eltronic",
    type: "module",
    accent: "#c084fc",
    secondary: "#67e8f9",
    scale: "CAN-Bus I/O expansion",
    chips: ["CAN-Bus", "Inputs", "Outputs", "Project configured"],
    ports: ["CAN-Bus", "Digital in", "Digital out", "Power", "Service"],
    context: "Application-specific control expansion",
  },
  {
    slug: "topcon-opus-b6e",
    name: "TOPCON OPUS B6e",
    family: "TOPCON OPUS B series",
    type: "hmi",
    accent: "#c084fc",
    secondary: "#67e8f9",
    screen: "10.1 in",
    chips: ["1280 x 800", "4x CAN-Bus", "IP66", "Ethernet"],
    ports: ["CAN 1", "CAN 2", "CAN 3", "CAN 4", "Ethernet", "USB"],
    context: "Large operator interface for rugged equipment",
  },
  {
    slug: "topcon-opus-b4e",
    name: "TOPCON OPUS B4e",
    family: "TOPCON OPUS B series",
    type: "hmi",
    accent: "#a78bfa",
    secondary: "#67e8f9",
    screen: "7 in",
    chips: ["800 x 480", "2x CAN-Bus", "IP66", "Linux HMI"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "RS232"],
    context: "Mid-size display for control and monitoring",
  },
  {
    slug: "topcon-opus-b3e",
    name: "TOPCON OPUS B3e",
    family: "TOPCON OPUS B series",
    type: "hmi",
    accent: "#86efac",
    secondary: "#67e8f9",
    screen: "5 in",
    chips: ["Compact", "2x CAN-Bus", "IP66", "Ethernet"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "RS232"],
    context: "Compact display for tight operator spaces",
  },
  {
    slug: "topcon-opus-a8s",
    name: "TOPCON OPUS A8s",
    family: "TOPCON OPUS A series",
    type: "hmi",
    keyed: true,
    accent: "#fbbf24",
    secondary: "#c084fc",
    screen: "12.1 in",
    chips: ["Soft keys", "Encoder", "2x CAN-Bus", "Video capable"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "I/O", "Video"],
    context: "Large keyed HMI for complex operator control",
  },
  {
    slug: "topcon-opus-a8e",
    name: "TOPCON OPUS A8e",
    family: "TOPCON OPUS A series",
    type: "hmi",
    accent: "#67e8f9",
    secondary: "#c084fc",
    screen: "12.1 in",
    chips: ["Glass touch", "High performance", "2x CAN-Bus", "Video HMI"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "I/O", "Video"],
    context: "Large touch HMI for advanced machine interfaces",
  },
  {
    slug: "topcon-opus-a6s",
    name: "TOPCON OPUS A6s",
    family: "TOPCON OPUS A series",
    type: "hmi",
    keyed: true,
    accent: "#c084fc",
    secondary: "#fbbf24",
    screen: "7 in",
    chips: ["Soft keys", "Encoder", "2x CAN-Bus", "Camera input"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "I/O", "Camera"],
    context: "Keyed operator display with camera and I/O options",
  },
  {
    slug: "topcon-opus-a6e",
    name: "TOPCON OPUS A6e",
    family: "TOPCON OPUS A series",
    type: "hmi",
    accent: "#67e8f9",
    secondary: "#a78bfa",
    screen: "7 in",
    chips: ["Touch HMI", "2x CAN-Bus", "Camera input", "Configurable I/O"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "I/O", "Camera"],
    context: "Touch display for control, camera and data views",
  },
  {
    slug: "topcon-opus-a3e",
    name: "TOPCON OPUS A3e",
    family: "TOPCON OPUS A series",
    type: "hmi",
    accent: "#86efac",
    secondary: "#a78bfa",
    screen: "4.3 in",
    chips: ["Compact touch", "2x CAN-Bus", "Ethernet", "I/O"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "I/O"],
    context: "Compact touch display for distributed control",
  },
  {
    slug: "topcon-opus-a3s",
    name: "TOPCON OPUS A3s",
    family: "TOPCON OPUS A series",
    type: "hmi",
    keyed: true,
    accent: "#fbbf24",
    secondary: "#86efac",
    screen: "4.3 in",
    chips: ["Soft keys", "Encoder", "2x CAN-Bus", "Front USB"],
    ports: ["CAN 1", "CAN 2", "Ethernet", "USB", "I/O"],
    context: "Compact keyed HMI for tactile operator input",
  },
];

mkdirSync(outputDir, { recursive: true });

const manifest = {};

for (const product of products) {
  const images = [
    {
      kind: "overview",
      label: "Overview",
      svg: renderOverview(product),
      alt: `${product.name} technical overview illustration`,
    },
    {
      kind: "interfaces",
      label: "Interfaces",
      svg: renderInterfaces(product),
      alt: `${product.name} interface and connection illustration`,
    },
    {
      kind: "application",
      label: "Application",
      svg: renderApplication(product),
      alt: `${product.name} application context illustration`,
    },
  ];

  manifest[product.slug] = images.map((image) => {
    const fileName = `${product.slug}-${image.kind}.svg`;
    writeFileSync(path.join(outputDir, fileName), image.svg, "utf8");

    return {
      src: `/product-images/generated/${fileName}`,
      alt: image.alt,
    };
  });
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Generated ${Object.values(manifest).flat().length} product gallery assets.`);
console.log(`Wrote ${path.relative(rootDir, manifestPath)}.`);

if (shouldSyncManagedData) {
  await syncManagedData(manifest);
}

function renderOverview(product) {
  const title = product.type === "hmi" ? `${product.screen} HMI` : product.scale;
  const device = renderDevice(product, 92, 190, 500, 340);
  const chips = product.chips.map((chip, index) => pill(40, 190 + index * 58, chip, product.accent)).join("");

  return svgShell(product, "Product overview", title, `
    ${device}
    <g class="panel" transform="translate(650 150)">
      <rect width="420" height="430" rx="34" />
      <text class="panel-eyebrow" x="40" y="70">at a glance</text>
      <text class="panel-title" x="40" y="118">${escapeXml(product.name)}</text>
      <text class="panel-copy" x="40" y="156">${escapeXml(product.family)}</text>
      ${chips}
    </g>
    ${signalLine(550, 360, 660, 360, product.accent)}
  `);
}

function renderInterfaces(product) {
  const ports = product.ports.map((port, index) => portBlock(120 + (index % 3) * 210, 470 + Math.floor(index / 3) * 90, port)).join("");
  const device = renderDevice(product, 370, 135, 460, 270, "compact");

  return svgShell(product, "Interfaces", "Connection planning", `
    ${device}
    <g class="bus-line">
      <path d="M220 420 H980" />
      <circle cx="220" cy="420" r="9" />
      <circle cx="600" cy="420" r="9" />
      <circle cx="980" cy="420" r="9" />
    </g>
    ${ports}
    <text class="fine-label" x="90" y="704">Ports and options are confirmed against the application, enclosure and support requirements.</text>
  `);
}

function renderApplication(product) {
  const device = renderDevice(product, 690, 198, 360, 240, "compact");

  return svgShell(product, "Application context", product.context, `
    <g class="application-scene" transform="translate(92 170)">
      <rect class="floor" x="0" y="365" width="520" height="18" rx="9" />
      <path class="equipment" d="M56 246 h282 l64 64 h76 v55 H36 v-54 h20z" />
      <circle class="wheel" cx="124" cy="370" r="44" />
      <circle class="wheel" cx="398" cy="370" r="44" />
      <rect class="cab" x="250" y="130" width="145" height="118" rx="18" />
      <path class="window" d="M274 154 h82 l22 68 h-104z" />
      <path class="arm" d="M74 238 C180 142 270 112 424 118" />
      <circle class="node" cx="424" cy="118" r="17" />
      <circle class="node" cx="250" cy="246" r="13" />
    </g>
    ${device}
    ${signalLine(560, 370, 708, 330, product.accent)}
    <g class="panel compact-panel" transform="translate(665 485)">
      <rect width="405" height="118" rx="26" />
      <text class="panel-eyebrow" x="28" y="46">Eltronic support</text>
      <text class="panel-copy strong" x="28" y="78">Specification, integration and enquiry-led supply</text>
    </g>
  `);
}

function svgShell(product, eyebrow, subtitle, content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(product.name)} ${escapeXml(eyebrow)}</title>
  <desc id="desc">${escapeXml(product.context ?? subtitle)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020617" />
      <stop offset="0.54" stop-color="#0f172a" />
      <stop offset="1" stop-color="#172554" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${product.accent}" />
      <stop offset="1" stop-color="${product.secondary}" />
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="42%" r="56%">
      <stop offset="0" stop-color="${product.accent}" stop-opacity="0.28" />
      <stop offset="1" stop-color="${product.accent}" stop-opacity="0" />
    </radialGradient>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <style>
      .bg { fill: url(#bg); }
      .halo { fill: url(#halo); }
      .grid { stroke: #94a3b8; stroke-opacity: .08; stroke-width: 1; }
      .glyph { fill: #e2e8f0; opacity: .10; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 30px; font-weight: 700; }
      .title { fill: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 54px; font-weight: 800; letter-spacing: -.04em; }
      .eyebrow { fill: ${product.accent}; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 18px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
      .subtitle { fill: #cbd5e1; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 24px; font-weight: 600; }
      .fine-label { fill: #94a3b8; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 18px; font-weight: 600; }
      .device-body { fill: #111827; stroke: url(#accent); stroke-width: 4; filter: url(#softGlow); }
      .device-side { fill: #1e293b; stroke: #475569; stroke-width: 3; }
      .screen { fill: #020617; stroke: #334155; stroke-width: 3; }
      .screen-grid { stroke: ${product.accent}; stroke-opacity: .28; stroke-width: 2; }
      .screen-text { fill: #e0f2fe; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 27px; font-weight: 800; }
      .small-screen-text { fill: #bae6fd; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 16px; font-weight: 700; }
      .button-key { fill: #334155; stroke: #64748b; stroke-width: 2; }
      .button-key.active { fill: ${product.accent}; opacity: .9; }
      .panel rect { fill: rgba(15, 23, 42, .76); stroke: rgba(148, 163, 184, .26); stroke-width: 2; }
      .panel-eyebrow { fill: ${product.accent}; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 15px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .panel-title { fill: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -.03em; }
      .panel-copy { fill: #cbd5e1; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 20px; font-weight: 650; }
      .panel-copy.strong { fill: #f1f5f9; font-size: 19px; }
      .pill rect, .port rect { fill: rgba(30, 41, 59, .94); stroke: ${product.accent}; stroke-opacity: .44; stroke-width: 2; }
      .pill text, .port text { fill: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 18px; font-weight: 750; }
      .bus-line path { fill: none; stroke: url(#accent); stroke-width: 5; stroke-linecap: round; stroke-dasharray: 16 16; }
      .bus-line circle, .node { fill: ${product.accent}; filter: url(#softGlow); }
      .signal { fill: none; stroke: url(#accent); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 10 14; }
      .equipment { fill: #1e293b; stroke: #64748b; stroke-width: 4; }
      .cab { fill: #334155; stroke: ${product.accent}; stroke-width: 3; }
      .window { fill: #0f172a; stroke: #67e8f9; stroke-width: 3; opacity: .92; }
      .arm { fill: none; stroke: #64748b; stroke-width: 20; stroke-linecap: round; }
      .floor { fill: #334155; opacity: .62; }
      .wheel { fill: #0f172a; stroke: #64748b; stroke-width: 12; }
      .logger-case { fill: #111827; stroke: url(#accent); stroke-width: 4; filter: url(#softGlow); }
      .logger-face { fill: #1e293b; stroke: #475569; stroke-width: 3; }
      .module-terminal { fill: #334155; stroke: #64748b; stroke-width: 2; }
    </style>
  </defs>
  <rect class="bg" width="1200" height="800" rx="0" />
  <rect class="halo" width="1200" height="800" />
  ${grid()}
  ${glyphs()}
  <text class="eyebrow" x="70" y="88">${escapeXml(eyebrow)}</text>
  <text class="title" x="70" y="146">${escapeXml(product.name)}</text>
  <text class="subtitle" x="72" y="190">${escapeXml(subtitle)}</text>
  ${content}
</svg>
`;
}

function renderDevice(product, x, y, width, height, mode = "normal") {
  if (product.type === "logger") {
    return renderLogger(product, x, y, width, height);
  }

  if (product.type === "module") {
    return renderModule(product, x, y, width, height);
  }

  return renderHmi(product, x, y, width, height, mode);
}

function renderHmi(product, x, y, width, height, mode) {
  const keyed = Boolean(product.keyed);
  const screenInsetX = keyed ? width * 0.17 : width * 0.1;
  const screenInsetY = height * 0.17;
  const screenWidth = width - screenInsetX * 2;
  const screenHeight = height - screenInsetY * 2;
  const keyCount = mode === "compact" ? 4 : 6;
  const keys = keyed
    ? Array.from({ length: keyCount }, (_, index) => {
        const keyY = y + screenInsetY + 18 + index * ((screenHeight - 36) / keyCount);
        return `
          <rect class="button-key ${index === 1 ? "active" : ""}" x="${x + 28}" y="${keyY}" width="${screenInsetX - 58}" height="24" rx="8" />
          <rect class="button-key ${index === 3 ? "active" : ""}" x="${x + width - screenInsetX + 28}" y="${keyY}" width="${screenInsetX - 58}" height="24" rx="8" />
        `;
      }).join("")
    : "";
  const encoder = keyed
    ? `<circle class="button-key active" cx="${x + width - 52}" cy="${y + height - 50}" r="22" /><circle class="button-key" cx="${x + width - 52}" cy="${y + height - 50}" r="10" />`
    : "";

  return `
    <g>
      <rect class="device-body" x="${x}" y="${y}" width="${width}" height="${height}" rx="34" />
      <rect class="screen" x="${x + screenInsetX}" y="${y + screenInsetY}" width="${screenWidth}" height="${screenHeight}" rx="22" />
      <path class="screen-grid" d="M${x + screenInsetX + 28} ${y + screenInsetY + 50} H${x + screenInsetX + screenWidth - 28}" />
      <path class="screen-grid" d="M${x + screenInsetX + 28} ${y + screenInsetY + screenHeight - 52} H${x + screenInsetX + screenWidth - 28}" />
      <path class="screen-grid" d="M${x + screenInsetX + 58} ${y + screenInsetY + 28} V${y + screenInsetY + screenHeight - 28}" />
      <text class="screen-text" x="${x + screenInsetX + 42}" y="${y + screenInsetY + screenHeight / 2 - 8}">${escapeXml(product.screen)}</text>
      <text class="small-screen-text" x="${x + screenInsetX + 42}" y="${y + screenInsetY + screenHeight / 2 + 28}">HMI / CAN-Bus</text>
      ${keys}
      ${encoder}
    </g>
  `;
}

function renderLogger(product, x, y, width, height) {
  return `
    <g>
      <rect class="logger-case" x="${x + width * 0.11}" y="${y + height * 0.18}" width="${width * 0.72}" height="${height * 0.56}" rx="42" />
      <rect class="logger-face" x="${x + width * 0.22}" y="${y + height * 0.3}" width="${width * 0.5}" height="${height * 0.32}" rx="26" />
      <circle class="node" cx="${x + width * 0.32}" cy="${y + height * 0.46}" r="13" />
      <circle class="node" cx="${x + width * 0.46}" cy="${y + height * 0.46}" r="13" />
      <circle class="node" cx="${x + width * 0.6}" cy="${y + height * 0.46}" r="13" />
      <path class="signal" d="M${x + width * 0.7} ${y + height * 0.2} C${x + width * 0.82} ${y + height * 0.02} ${x + width * 0.94} ${y + height * 0.05} ${x + width * 0.98} ${y + height * 0.18}" />
      <text class="screen-text" x="${x + width * 0.25}" y="${y + height * 0.84}">CAN-FD / LTE</text>
    </g>
  `;
}

function renderModule(product, x, y, width, height) {
  const terminals = Array.from({ length: 10 }, (_, index) => {
    const terminalX = x + width * 0.18 + index * (width * 0.064);
    return `<rect class="module-terminal" x="${terminalX}" y="${y + height * 0.13}" width="${width * 0.045}" height="${height * 0.12}" rx="5" />
      <rect class="module-terminal" x="${terminalX}" y="${y + height * 0.74}" width="${width * 0.045}" height="${height * 0.12}" rx="5" />`;
  }).join("");

  return `
    <g>
      <rect class="device-body" x="${x + width * 0.15}" y="${y + height * 0.1}" width="${width * 0.7}" height="${height * 0.8}" rx="28" />
      ${terminals}
      <rect class="screen" x="${x + width * 0.27}" y="${y + height * 0.34}" width="${width * 0.46}" height="${height * 0.24}" rx="18" />
      <text class="screen-text" x="${x + width * 0.32}" y="${y + height * 0.47}">I/O</text>
      <text class="small-screen-text" x="${x + width * 0.32}" y="${y + height * 0.55}">CAN-Bus module</text>
      <path class="signal" d="M${x + width * 0.08} ${y + height * 0.5} H${x + width * 0.15}" />
      <path class="signal" d="M${x + width * 0.85} ${y + height * 0.5} H${x + width * 0.94}" />
    </g>
  `;
}

function pill(x, y, text, accent) {
  return `
    <g class="pill">
      <rect x="${x}" y="${y}" width="310" height="48" rx="24" />
      <circle cx="${x + 30}" cy="${y + 24}" r="7" fill="${accent}" />
      <text x="${x + 54}" y="${y + 31}">${escapeXml(text)}</text>
    </g>
  `;
}

function portBlock(x, y, text) {
  return `
    <g class="port">
      <rect x="${x}" y="${y}" width="174" height="58" rx="18" />
      <path class="signal" d="M${x + 16} ${y + 28} h30" />
      <text x="${x + 58}" y="${y + 36}">${escapeXml(text)}</text>
    </g>
  `;
}

function signalLine(x1, y1, x2, y2) {
  return `<path class="signal" d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1 - 70}, ${(x1 + x2) / 2} ${y2 + 70}, ${x2} ${y2}" />`;
}

function grid() {
  const lines = [];

  for (let x = 0; x <= 1200; x += 80) {
    lines.push(`<path class="grid" d="M${x} 0 V800" />`);
  }

  for (let y = 0; y <= 800; y += 80) {
    lines.push(`<path class="grid" d="M0 ${y} H1200" />`);
  }

  return `<g>${lines.join("")}</g>`;
}

function glyphs() {
  const glyphItems = [
    ["{", 1060, 86],
    ["CAN", 940, 104],
    ["<>", 86, 712],
    ["//", 1030, 704],
    ["[]", 545, 92],
    ["=", 610, 716],
  ];

  return `<g>${glyphItems
    .map(([glyph, x, y]) => `<text class="glyph" x="${x}" y="${y}">${escapeXml(glyph)}</text>`)
    .join("")}</g>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = unquoteEnvValue(trimmedLine.slice(separatorIndex + 1).trim());

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function unquoteEnvValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function getPostgresConnectionString() {
  const directConnection =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (directConnection) {
    return directConnection;
  }

  const preferredSuffixes = ["DATABASE_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];

  for (const suffix of preferredSuffixes) {
    const key = Object.keys(process.env).find((envKey) => envKey.endsWith(`_${suffix}`));
    const value = key ? process.env[key] : undefined;

    if (value) {
      return value;
    }
  }

  return null;
}

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

async function syncManagedData(galleryManifest) {
  loadEnvFile(path.join(rootDir, ".env.local"));
  loadEnvFile(path.join(rootDir, ".env.development.local"));

  const connectionString = getPostgresConnectionString();

  if (connectionString) {
    await syncPostgresManagedData(connectionString, galleryManifest);
    return;
  }

  const redisConfig = getRedisConfig();

  if (redisConfig) {
    await syncRedisManagedData(redisConfig, galleryManifest);
    return;
  }

  syncLocalManagedData(galleryManifest);
}

async function syncPostgresManagedData(connectionString, galleryManifest) {
  const sql = neon(connectionString);
  await sql.query(
    `
      CREATE TABLE IF NOT EXISTS ${POSTGRES_TABLE_NAME} (
        id text PRIMARY KEY,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `,
  );

  const rows = await sql.query(`SELECT data FROM ${POSTGRES_TABLE_NAME} WHERE id = $1 LIMIT 1`, [DATA_KEY]);
  const rowData = rows[0]?.data;

  if (!rowData) {
    console.log("No managed data row found. Seed catalogue will use the generated gallery assets.");
    return;
  }

  const data = typeof rowData === "string" ? JSON.parse(rowData) : rowData;
  const nextData = mergeManagedProductImages(data, galleryManifest);

  await sql.query(
    `
      UPDATE ${POSTGRES_TABLE_NAME}
      SET data = $2::jsonb, updated_at = now()
      WHERE id = $1
    `,
    [DATA_KEY, JSON.stringify(nextData)],
  );

  console.log("Synced generated gallery assets into Neon managed product data.");
}

async function syncRedisManagedData(config, galleryManifest) {
  const redis = new Redis(config);
  const data = await redis.get(DATA_KEY);

  if (!data) {
    console.log("No managed data row found. Seed catalogue will use the generated gallery assets.");
    return;
  }

  await redis.set(DATA_KEY, mergeManagedProductImages(data, galleryManifest));
  console.log("Synced generated gallery assets into Redis managed product data.");
}

function syncLocalManagedData(galleryManifest) {
  const localPath = path.join(rootDir, ".data", "eltronic-data.json");

  if (!existsSync(localPath)) {
    console.log("No local managed data file found. Seed catalogue will use the generated gallery assets.");
    return;
  }

  const data = JSON.parse(readFileSync(localPath, "utf8"));
  writeFileSync(localPath, `${JSON.stringify(mergeManagedProductImages(data, galleryManifest), null, 2)}\n`, "utf8");
  console.log("Synced generated gallery assets into local managed product data.");
}

function mergeManagedProductImages(data, galleryManifest) {
  const products = Array.isArray(data.products)
    ? data.products.map((product) => {
        const generatedImages = galleryManifest[product.slug] ?? [];
        const existingImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
        const images = dedupeImages([...existingImages.filter(isPublicImage), ...generatedImages], product.name);

        return {
          ...product,
          image: images[0] ?? product.image,
          images,
        };
      })
    : data.products;

  return {
    ...data,
    products,
    updatedAt: new Date().toISOString(),
  };
}

function isPublicImage(image) {
  const src = typeof image?.src === "string" ? image.src : "";

  return src && !src.startsWith("/product-gallery/") && !src.startsWith("/product-images/placeholders/");
}

function dedupeImages(images, fallbackAlt) {
  const seen = new Set();

  return images
    .filter(isPublicImage)
    .map((image) => ({
      src: image.src,
      alt: image.alt || fallbackAlt,
    }))
    .filter((image) => {
      if (seen.has(image.src)) {
        return false;
      }

      seen.add(image.src);
      return true;
    });
}
