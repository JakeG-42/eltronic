import Link from "next/link";
import { AmbientBackground } from "@/components/site/ambient-background";
import { MobileNavAutoClose } from "@/components/site/mobile-nav-auto-close";

const navItems = [
  { href: "/solutions", label: "Services", icon: "solutions" },
  { href: "/software-it", label: "Software", icon: "software" },
  { href: "/web-connected-platforms", label: "Web & IOT", icon: "webIot" },
  { href: "/products", label: "Products", icon: "products" },
  { href: "/articles", label: "Articles", icon: "articles" },
  { href: "/about", label: "About", icon: "about" },
  { href: "/contact", label: "Contact", icon: "contact" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <AmbientBackground />
      <header className="main-header">
        <nav className="nav-container" aria-label="Main navigation">
          <Link className="brand-logo logo-text" href="/">
            Eltronic
          </Link>
          <div className="nav-menu desktop-nav">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
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
                <Link href={item.href} key={item.href}>
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
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
                Eltronic
              </Link>
            </div>

            <nav className="footer-group" aria-label="Explore">
              <h2 className="footer-group-title">Explore</h2>
              <Link href="/solutions">Services</Link>
              <Link href="/software-it">Software & Systems</Link>
              <Link href="/web-connected-platforms">Web & Connected Platforms</Link>
              <Link href="/products">Product catalogue</Link>
            </nav>

            <nav className="footer-group" aria-label="Resources">
              <h2 className="footer-group-title">Resources</h2>
              <Link href="/sectors">Sectors</Link>
              <Link href="/articles">Articles</Link>
              <Link href="/data-specification">Data & specification</Link>
              <Link href="/about">About Eltronic</Link>
              <Link href="/contact">Start an enquiry</Link>
            </nav>

            <div className="footer-contact-card">
              <span className="section-number">contact.signal</span>
              <h2>Have a system to discuss?</h2>
              <p>Eltronic is the solution. Get in touch today.</p>
              <a href="mailto:sales@eltronic.co.uk">sales@eltronic.co.uk</a>
              <a href="tel:+447935239421">+44 (0) 79 3523 9421</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Eltronic. Prototyping, systems integration and software engineering.</p>
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

  if (name === "articles") {
    return (
      <svg {...commonProps}>
        <path d="M5 5.5h14v13H5z" />
        <path d="M8 9h8M8 12h8M8 15h5" />
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
