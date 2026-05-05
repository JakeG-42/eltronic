"use client";

import { Code2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function CodeWorkspaceNavLink() {
  const pathname = usePathname();
  const active = pathname?.startsWith("/console/code-workspace");

  return (
    <Link className={`code-workspace-nav-link${active ? " active" : ""}`} href="/console/code-workspace">
      <Code2 aria-hidden="true" size={17} />
      <span>Code workspace</span>
    </Link>
  );
}
