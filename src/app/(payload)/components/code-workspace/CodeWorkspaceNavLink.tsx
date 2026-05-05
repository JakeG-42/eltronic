"use client";

import { Code2, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function CodeWorkspaceNavLink() {
  const pathname = usePathname();
  const codeWorkspaceActive = pathname?.startsWith("/console/code-workspace");
  const customCssActive = pathname?.startsWith("/console/collections/code-snippets");

  return (
    <section aria-label="Tools" className="nav-group Tools console-tools-nav-group">
      <div className="nav-group__toggle">
        <span className="nav-group__label">Tools</span>
      </div>
      <div className="nav-group__content">
        <Link
          className={`console-tools-nav-link${codeWorkspaceActive ? " active" : ""}`}
          href="/console/code-workspace"
        >
          <Code2 aria-hidden="true" size={17} />
          <span>Code workspace</span>
        </Link>
        <Link
          className={`console-tools-nav-link${customCssActive ? " active" : ""}`}
          href="/console/collections/code-snippets"
        >
          <Palette aria-hidden="true" size={17} />
          <span>Custom CSS</span>
        </Link>
      </div>
    </section>
  );
}
