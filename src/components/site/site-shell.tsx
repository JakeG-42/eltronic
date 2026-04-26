import Link from "next/link";

const navItems = [
  { href: "/products", label: "Products", icon: "products" },
  { href: "/solutions", label: "Solutions", icon: "solutions" },
  { href: "/software-it", label: "Software & IT", icon: "software" },
  { href: "/sectors", label: "Sectors", icon: "sectors" },
  { href: "/data-specification", label: "Data", icon: "data" },
  { href: "/about", label: "About", icon: "about" },
  { href: "/contact", label: "Contact", icon: "contact" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <header className="main-header">
        <nav className="nav-container" aria-label="Main navigation">
          <Link className="brand-logo logo-text" href="/">
            Eltronic
          </Link>
          <div className="nav-menu">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {children}
      <footer className="main-footer">
        <div className="footer-container">
          <p>© 2026 Eltronic</p>
          <div className="footer-links">
            <a href="tel:+447935239421">+44(0) 79 3523 9421</a>
            <a href="mailto:sales@eltronic.co.uk">sales@eltronic.co.uk</a>
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

  if (name === "sectors") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 4v4.8M12 15.2V20M4 12h4.8M15.2 12H20M6.3 6.3l3.4 3.4M14.3 14.3l3.4 3.4" />
      </svg>
    );
  }

  if (name === "data") {
    return (
      <svg {...commonProps}>
        <path d="M6 4h9l3 3v13H6V4Z" />
        <path d="M15 4v4h4M8.5 12h7M8.5 15h7M8.5 18h4" />
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
