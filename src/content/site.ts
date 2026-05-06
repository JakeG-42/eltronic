export const serviceModules = [
  {
    slug: "prototyping-design",
    title: "Prototype and system design",
    eyebrow: "prototype.design",
    summary:
      "Practical design and development for working prototypes, demonstrators and first-build systems that need to prove an idea in the real world.",
    bullets: ["Proof-of-concept builds", "Technical architecture", "Prototype refinement"],
  },
  {
    slug: "screens-can-controls",
    title: "Screens, CAN and control interfaces",
    eyebrow: "equipment.interface",
    summary:
      "Operator screens, CAN-Bus, data capture and control interfaces for vehicles, machines, simulators and specialist equipment.",
    bullets: ["HMI and touchscreen workflows", "CAN/CAN-FD integration", "Control and monitoring interfaces"],
  },
  {
    slug: "electronics-device-systems",
    title: "Electronics and device systems",
    eyebrow: "electronics.device",
    summary:
      "Hardware-aware development across sensors, PCB support, embedded devices, gateways and the software needed to make them useful.",
    bullets: ["Sensor and I/O integration", "PCB and electronics support", "Embedded and gateway software"],
  },
  {
    slug: "tracking-monitoring",
    title: "Tracking, fleet and monitoring tools",
    eyebrow: "asset.telemetry",
    summary:
      "Connected systems for tracking, reporting and managing technical assets, from tractor tracking to fleet and remote equipment monitoring.",
    bullets: ["Asset and vehicle tracking", "Dashboards and alerts", "Device data pipelines"],
  },
  {
    slug: "business-systems",
    title: "Business systems and integrations",
    eyebrow: "operations.software",
    summary:
      "Internal platforms, APIs, plugins and integrations that connect operational software, ecommerce, warehouse tools and finance systems.",
    bullets: ["Shopify and bespoke plugins", "Shipping and warehouse APIs", "Sage and business-system support"],
  },
  {
    slug: "support-infrastructure",
    title: "IT, infrastructure and support",
    eyebrow: "support.infrastructure",
    summary:
      "Reliable support around internal systems, remote access, websites, infrastructure and the day-to-day tools a business depends on.",
    bullets: ["Remote desktop support", "Internal infrastructure", "Website and platform support"],
  },
];

export const softwareServiceModules = [
  {
    title: "Internal platforms and dashboards",
    code: "systems.backend",
    summary:
      "Admin portals, workflow tools, dashboards and operational platforms built around the way the business actually runs.",
    examples: ["Admin portals", "Quoting tools", "Operations dashboards", "Reporting views"],
  },
  {
    title: "API, middleware and data integration",
    code: "integration.api",
    summary:
      "Connect shipping, stock, CRM, customer portals, finance tools and third-party services so data moves cleanly without double entry.",
    examples: ["Shipping workflows", "Stock and order sync", "Customer portals", "Middleware services"],
  },
  {
    title: "Web platforms, plugins and business tools",
    code: "plugins.commerce",
    summary:
      "Bespoke web platforms, Shopify plugins and practical extensions for websites, internal tools and operational systems that need to fit a specific process.",
    examples: ["Bespoke platforms", "Shopify plugins", "Website tools", "Customer-facing portals"],
  },
  {
    title: "Embedded, IoT and device services",
    code: "embedded.services",
    summary:
      "Software for connected hardware, controllers, screens, sensors and gateways, with practical protocols and reliable interfaces.",
    examples: ["MQTT/HTTP services", "Device telemetry", "Edge gateways", "Command/status APIs"],
  },
  {
    title: "Business software support",
    code: "support.business",
    summary:
      "Support for the systems companies already rely on, including Sage workflows, remote desktop access, internal servers and operational IT.",
    examples: ["Sage support", "Remote desktop", "Internal servers", "Secure access"],
  },
  {
    title: "Technical consultancy and process improvement",
    code: "consult.efficiency",
    summary:
      "Practical technical guidance on what to build, what to integrate and where automation will reduce errors, rework and wasted time.",
    examples: ["Workflow reviews", "Automation planning", "System selection", "Project scoping"],
  },
  {
    title: "Lifecycle support and controlled change",
    code: "support.iterate",
    summary:
      "Documentation, monitoring, maintenance and measured feature updates so systems remain understandable as the business changes.",
    examples: ["Maintenance", "Monitoring", "Documentation", "Feature updates"],
  },
];

export const softwareWorkflowModules = [
  {
    step: "01",
    title: "Problem and workflow discovery",
    summary:
      "We map the real process, users, devices, existing systems, failure points and the places where time or accuracy is being lost.",
    outcome: "A precise view of the work, the friction and the systems already in play.",
  },
  {
    step: "02",
    title: "Architecture across software, data and devices",
    summary:
      "We define the right route across interfaces, APIs, databases, embedded messaging, servers, access control and existing tools before anything is overbuilt.",
    outcome: "A practical technical route with clear ownership, data flow and delivery boundaries.",
  },
  {
    step: "03",
    title: "Staged delivery and validation",
    summary:
      "Work is delivered in controlled phases so useful value appears early while the wider system is tested against real users, data and operating conditions.",
    outcome: "Usable progress early, with each phase tested against the real workflow.",
  },
  {
    step: "04",
    title: "Handover and continuous improvement",
    summary:
      "Documentation, support and measured improvements keep the system understandable, maintainable and ready for future operational needs.",
    outcome: "A system your team can run, support and improve without guesswork.",
  },
];

export const sectorModules = [
  {
    title: "Agriculture and specialist vehicles",
    code: "sector.agri",
    summary:
      "Tracking, display, monitoring and control solutions for tractors, harvesters, spreaders and specialist mobile equipment.",
    examples: ["Tractor tracking", "Potato harvesters", "Field collection", "Salt spreaders"],
  },
  {
    title: "Fleet, logistics and asset operations",
    code: "sector.fleet",
    summary:
      "Tools for monitoring, reporting and connecting vehicles, assets, warehouse processes and operational software.",
    examples: ["Fleet dashboards", "Warehouse links", "Vehicle data", "Remote support"],
  },
  {
    title: "Machinery, simulators and test rigs",
    code: "sector.machine",
    summary:
      "Operator interfaces, simulation tools, control panels and device integration for technical equipment and validation environments.",
    examples: ["Simulator interfaces", "Test rigs", "Operator screens", "Control panels"],
  },
  {
    title: "Business operations and internal systems",
    code: "sector.operations",
    summary:
      "Internal platforms, plugins, ecommerce integrations, remote access and support systems for companies that need cleaner operations.",
    examples: ["Shopify plugins", "Sage workflows", "Internal tools", "Website systems"],
  },
];

export const workflowModules = [
  {
    step: "01",
    title: "Define the real requirement",
    summary:
      "We build a clear picture of the application, workflow, users, devices, existing systems and constraints before choosing the technical route.",
    outcome: "A grounded scope that reflects the real problem, not a generic product list.",
  },
  {
    step: "02",
    title: "Prototype, specify and de-risk",
    summary:
      "Early design, prototype work, hardware choices, interfaces, APIs and support expectations are shaped before the build becomes expensive.",
    outcome: "A practical plan with clear decisions, responsibilities and risks.",
  },
  {
    step: "03",
    title: "Build and integrate the system",
    summary:
      "Software, electronics, screens, data, plugins, infrastructure and third-party systems are brought together in controlled stages.",
    outcome: "A working system proven through staged checks, not assumptions.",
  },
  {
    step: "04",
    title: "Handover and lifecycle support",
    summary:
      "Clear documentation, diagnostics and long-term support make the system easier to operate, maintain and improve after installation.",
    outcome: "A maintainable system with a clear path for support, change and future upgrades.",
  },
];

export const resourceModules = [
  {
    title: "Product and module data",
    summary: "Technical documents for displays, modules, devices and product building blocks used in wider systems.",
  },
  {
    title: "Project enquiry support",
    summary: "Use the product pages and contact form to start a quote-led discussion around the right system or module.",
  },
  {
    title: "Guides and specification notes",
    summary: "A growing home for specification notes, project guides and support material.",
  },
];
