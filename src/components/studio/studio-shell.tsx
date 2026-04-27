"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  ChevronDown,
  ExternalLink,
  FileCode2,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Moon,
  Paintbrush,
  Settings,
  Sun,
} from "lucide-react";

import { logoutAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/studio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio/builder", label: "Builder", icon: Paintbrush },
  { href: "/studio/templates", label: "Templates", icon: FileCode2 },
  { href: "/studio/products", label: "Products", icon: Boxes },
  { href: "/studio/submissions", label: "Enquiries", icon: Inbox },
  { href: "/studio/settings", label: "Settings", icon: Settings },
];

export function StudioShell({
  children,
  storageConfigured,
  storageMode,
}: {
  children: React.ReactNode;
  storageConfigured: boolean;
  storageMode: string;
}) {
  const pathname = usePathname();
  const isClassicAdmin = pathname.startsWith("/studio/classic");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("eltronic-studio-theme");

      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    }

    return "dark";
  });

  useEffect(() => {
    window.localStorage.setItem("eltronic-studio-theme", theme);
  }, [theme]);

  if (isClassicAdmin) {
    return (
      <div className="wp-admin-clone">
        <header className="wp-admin-bar">
          <Link className="wp-admin-bar-brand" href="/studio/classic/products">
            Eltronic
          </Link>
          <Link href="/">Visit site</Link>
          <Link href="/studio/classic/products/new">+ New</Link>
          <span className="wp-admin-bar-spacer" />
          {!storageConfigured ? <span>{storageMode}</span> : null}
          <Link href="/studio/products">Switch to current</Link>
          <form action={logoutAction}>
            <button type="submit">Log out</button>
          </form>
        </header>

        <aside className="wp-admin-menu" aria-label="WordPress-style admin navigation">
          <Link className="wp-admin-menu-logo" href="/studio/classic/products">
            <span>W</span>
            <strong>Eltronic Admin</strong>
          </Link>
          <ClassicMenuLink href="/studio/classic" pathname={pathname}>
            Dashboard
          </ClassicMenuLink>
          <ClassicMenuLink href="/studio/classic/products" pathname={pathname} primary>
            Products
            <ChevronDown className="size-3" />
          </ClassicMenuLink>
          <div className="wp-admin-submenu">
            <Link href="/studio/classic/products">All Products</Link>
            <Link href="/studio/classic/products/new">Add New</Link>
            <span>Categories</span>
            <span>Tags</span>
            <span>Attributes</span>
          </div>
          <span>Media</span>
          <span>Pages</span>
          <span>Comments</span>
          <span>WooCommerce</span>
          <Link href="/studio/builder">Website Builder</Link>
          <span>Analytics</span>
          <span>Marketing</span>
          <span>Appearance</span>
          <Link href="/studio/templates">Theme File Editor</Link>
          <span>Plugins</span>
          <span>Users</span>
          <span>Tools</span>
          <span>Settings</span>
        </aside>

        <main className="wp-admin-main">
          {!storageConfigured ? (
            <div className="wp-notice">
              Storage is currently <strong>{storageMode}</strong>. Configure Neon/Postgres or Redis before relying on
              live admin writes.
            </div>
          ) : null}
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="studio-app" data-theme={theme} suppressHydrationWarning>
      <aside className="studio-sidebar">
        <Link className="studio-brand" href="/studio">
          <span className="studio-brand-mark">E</span>
          <span>
            <strong>Eltronic</strong>
            <small>Studio</small>
          </span>
        </Link>

        <nav className="studio-nav" aria-label="Studio navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/studio" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link className={cn("studio-nav-link", active && "active")} href={item.href} key={item.href}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="studio-sidebar-footer">
          <Button asChild className="w-full justify-start" variant="ghost">
            <Link href="/">
              <Home className="size-4" />
              Public site
            </Link>
          </Button>
          <form action={logoutAction}>
            <Button className="w-full justify-start" type="submit" variant="ghost">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="studio-workspace">
        <header className="studio-topbar">
          <div>
            <p className="studio-eyebrow">Admin portal</p>
            <strong>{currentModeLabel(pathname)}</strong>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!storageConfigured ? (
              <span className="rounded-full border border-amber-300/35 bg-amber-300/12 px-3 py-1 text-xs font-bold text-amber-200">
                {storageMode}
              </span>
            ) : null}
            <Button asChild size="sm" variant="outline">
              <Link href="/" target="_blank">
                <ExternalLink className="size-4" />
                View site
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/studio/classic/products">Switch to new</Link>
            </Button>
            <Button
              aria-label="Toggle Studio theme"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              size="sm"
              type="button"
              variant="outline"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </header>
        {!storageConfigured ? (
          <div className="studio-storage-alert">
            Storage is currently <strong>{storageMode}</strong>. Local edits work here, but Vercel needs a Neon
            <code> DATABASE_URL </code> or Redis <code>KV_REST_API_URL</code> before live admin writes are
            persistent.
          </div>
        ) : null}
        <main className="studio-content">{children}</main>
      </div>
    </div>
  );
}

function ClassicMenuLink({
  children,
  href,
  pathname,
  primary = false,
}: {
  children: React.ReactNode;
  href: string;
  pathname: string;
  primary?: boolean;
}) {
  const active = href === "/studio/classic" ? pathname === href : pathname.startsWith(href);

  return (
    <Link className={cn("wp-admin-menu-link", active && "active", primary && "primary")} href={href}>
      {children}
    </Link>
  );
}

function currentModeLabel(pathname: string) {
  if (pathname.startsWith("/studio/classic")) return "New Studio";
  if (pathname.startsWith("/studio/builder")) return "Website Builder";
  if (pathname.startsWith("/studio/templates")) return "Template Editor";
  if (pathname.startsWith("/studio/products")) return "Products";
  if (pathname.startsWith("/studio/submissions")) return "Enquiries";
  if (pathname.startsWith("/studio/settings")) return "Settings";

  return "Dashboard";
}
