import config from "@payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getRepoTree } from "@/lib/console-code-workspace";

export const runtime = "nodejs";

async function requireAdmin() {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: (await headers()) as Headers });
  const role = typeof auth.user === "object" && auth.user && "role" in auth.user ? auth.user.role : null;

  return role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "You need an admin Console account to use the code workspace." }, { status: 403 });
  }

  return NextResponse.json({
    mode: "read-only",
    readOnlyReason: "Vercel deployments are immutable, so repo source files can be browsed here but not edited in place.",
    rootName: "Eltronic",
    tree: await getRepoTree(),
  });
}
