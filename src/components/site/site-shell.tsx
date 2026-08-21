import Link from "next/link";
import { AmbientBackground } from "@/components/site/ambient-background";
import { MobileNavAutoClose } from "@/components/site/mobile-nav-auto-close";

const navItems = [
  { label: "EV Charging", icon: "solutions" },
  { label: "Domestic", icon: "software" },
  { label: "Commercial", icon: "webIot" },
  { label: "Maintenance", icon: "products" },
  { label: "About", icon: "about" },
  { label: "Contact", icon: "contact" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <AmbientBackground />
      <header className="main-header">
        <nav className="nav-container" aria-label="Main navigation">
          <Link className="brand-logo logo-text" href="/">
            EV Installers Demo
          </Link>
          <div className="nav-menu desktop-nav">
            {navItems.map((item) => (
              <a href="#" key={item.label} aria-disabled="true">
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
          <details className="mobile-nav">
            <summary className="mobile-menu-toggle" aria-label="Open main menu">
              <span />
              <span />
              <span />
            </summary>
            <div className="mobile-nav-panel">
              {navItems.map((item) => (
                <a href="#" key={item.label} aria-disabled="true">
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </details>
          <MobileNavAutoClose />
        </nav>
      </header>
      {children}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <Link className="footer-logo gradient-text" href="/">
                EV Installers Demo
              </Link>
            </div>

            <nav className="footer-group" aria-label="Explore">
              <h2 className="footer-group-title">Explore</h2>
              <a href="#" aria-disabled="true">
                EV Charging
              </a>
              <a href="#" aria-disabled="true">
                Domestic electrics
              </a>
              <a href="#" aria-disabled="true">
                Commercial installs
              </a>
              <a href="#" aria-disabled="true">
                Maintenance
              </a>
            </nav>

            <nav className="footer-group" aria-label="Company">
              <h2 className="footer-group-title">Company</h2>
              <a href="#" aria-disabled="true">
                About
              </a>
              <a href="#" aria-disabled="true">
                Coverage areas
              </a>
              <a href="#" aria-disabled="true">
                FAQs
              </a>
              <a href="#" aria-disabled="true">
                Contact
              </a>
            </nav>

            <div className="footer-contact-card">
              <span className="section-number">configurator.demo</span>
              <h2>Product configurator</h2>
              <p>Open the secured Andersen EV product configurator for this demo.</p>
              <Link href="/andersen">Open configurator</Link>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 EV Installers Demo. Sample site for demonstration only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavIcon({ name }: { name: (typeof navItems)[number]["icon"] }) {
  const commonProps = {
    className: "nav-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };

  if (name === "products") {
    return (
      <svg {...commonProps}>
        <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" />
        <path d="m4 8.5 8 4.5 8-4.5M12 13v7" />
      </svg>
    );
  }

  if (name === "solutions") {
    return (
      <svg {...commonProps}>
        <path d="M7 7h10v10H7z" />
        <path d="M3 12h4M17 12h4M12 3v4M12 17v4" />
      </svg>
    );
  }

  if (name === "software") {
    return (
      <svg {...commonProps}>
        <path d="M5 6h14v9H5z" />
        <path d="M8 19h8M10 15v4M14 15v4M9 10l2 2 4-5" />
      </svg>
    );
  }

  if (name === "webIot") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
        <path d="M5.6 5.6 9.9 9.9M14.1 14.1l4.3 4.3M18.4 5.6l-4.3 4.3M9.9 14.1l-4.3 4.3" />
      </svg>
    );
  }

  if (name === "about") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.8-3.6 3.3-5.5 7-5.5s6.2 1.9 7 5.5" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 6h16v12H4V6Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
