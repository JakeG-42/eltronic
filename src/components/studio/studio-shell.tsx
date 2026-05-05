"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  Boxes,
  ExternalLink,
  FileCode2,
  Home,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Moon,
  Paintbrush,
  QrCode,
  Settings,
  Sun,
  UserCircle,
  Users,
} from "lucide-react";

import { logoutAction } from "@/app/studio/actions";
import { Button } from "@/components/ui/button";
import { StudioSubmissionNotifier } from "@/components/studio/studio-submission-notifier";
import type { AdminRole, PublicAdminUser } from "@/lib/admin-user-model";
import { cn } from "@/lib/utils";

const navGroups: Array<{
  label: string;
  items: Array<{
    href: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
    roles: AdminRole[];
  }>;
}> = [
  {
    label: "Overview",
    items: [{ href: "/studio", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "moderator"] }],
  },
  {
    label: "Content",
    items: [
      { href: "/studio/products", label: "Products", icon: Boxes, roles: ["super_admin", "admin"] },
      { href: "/studio/builder", label: "Builder", icon: Paintbrush, roles: ["super_admin", "admin"] },
      { href: "/studio/media", label: "Media", icon: ImageIcon, roles: ["super_admin", "admin"] },
    ],
  },
  {
    label: "Tools",
    items: [{ href: "/studio/tools/qr-code", label: "QR Code", icon: QrCode, roles: ["super_admin", "admin", "moderator"] }],
  },
  {
    label: "Messages",
    items: [{ href: "/studio/submissions", label: "Enquiries", icon: Inbox, roles: ["super_admin", "admin", "moderator"] }],
  },
  {
    label: "Admin",
    items: [
      { href: "/studio/templates", label: "Code Studio", icon: FileCode2, roles: ["super_admin", "admin"] },
      { href: "/studio/users", label: "Users", icon: Users, roles: ["super_admin", "admin"] },
      { href: "/studio/settings", label: "Settings", icon: Settings, roles: ["super_admin", "admin"] },
      { href: "/studio/account", label: "Account", icon: UserCircle, roles: ["super_admin", "admin", "moderator"] },
    ],
  },
];

export function StudioShell({
  children,
  currentUser,
  storageConfigured,
  storageMode,
}: {
  children: React.ReactNode;
  currentUser: PublicAdminUser;
  storageConfigured: boolean;
  storageMode: string;
}) {
  const pathname = usePathname();
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
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => item.roles.includes(currentUser.role));

            if (visibleItems.length === 0) {
              return null;
            }

            return (
              <div className="studio-nav-group" key={group.label}>
                <span className="studio-nav-heading">{group.label}</span>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/studio" ? pathname === item.href : pathname.startsWith(item.href);

                  return (
                    <Link className={cn("studio-nav-link", active && "active")} href={item.href} key={item.href}>
                      <Icon className="size-4" />
                      <span className="studio-nav-label">{item.label}</span>
                      {item.href === "/studio/submissions" ? <StudioSubmissionNotifier /> : null}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="studio-sidebar-footer">
          <div className="studio-user-chip">
            <strong>{currentUser.displayName}</strong>
            <span>{currentUser.role.replace("_", " ")}</span>
          </div>
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

function currentModeLabel(pathname: string) {
  if (pathname.startsWith("/studio/builder")) return "Website Builder";
  if (pathname.startsWith("/studio/templates")) return "Code Studio";
  if (pathname.startsWith("/studio/media")) return "Media";
  if (pathname.startsWith("/studio/products")) return "Products";
  if (pathname.startsWith("/studio/tools")) return "Tools";
  if (pathname.startsWith("/studio/submissions")) return "Enquiries";
  if (pathname.startsWith("/studio/users")) return "Users";
  if (pathname.startsWith("/studio/account")) return "Account";
  if (pathname.startsWith("/studio/settings")) return "Settings";

  return "Dashboard";
}
