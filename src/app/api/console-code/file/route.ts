import config from "@payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { CodeWorkspaceError, readRepoFile } from "@/lib/console-code-workspace";

export const runtime = "nodejs";

async function requireAdmin() {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: (await headers()) as Headers });
  const role = typeof auth.user === "object" && auth.user && "role" in auth.user ? auth.user.role : null;

  return role === "admin";
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "You need an admin Console account to use the code workspace." }, { status: 403 });
  }

  const filePath = request.nextUrl.searchParams.get("path") ?? "";

  try {
    return NextResponse.json(await readRepoFile(filePath));
  } catch (error) {
    if (error instanceof CodeWorkspaceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Unable to read code workspace file.", error);
    return NextResponse.json({ error: "Unable to read that file." }, { status: 500 });
  }
}
