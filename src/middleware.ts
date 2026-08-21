import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEMO_SITE_GATE_COOKIE = "eltronic_demo_site_gate";
const DEFAULT_SECRET = "temporary-eltronic-demo-gate-secret";

function getSecret() {
  return (
    process.env.ELTRONIC_DEMO_GATE_SECRET ||
    process.env.ELTRONIC_ADMIN_SECRET ||
    process.env.AUTH_SECRET ||
    DEFAULT_SECRET
  );
}

async function signPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function isValidToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const [scope, issuedAt, signature] = token.split(".");

  if (!scope || !issuedAt || !signature || scope !== "site") {
    return false;
  }

  const payload = `${scope}.${issuedAt}`;
  const expected = await signPayload(payload, getSecret());
  return expected === signature;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/andersen") ||
    pathname.startsWith("/unlock") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/opengraph-image"
  ) {
    return NextResponse.next();
  }

  if (await isValidToken(request.cookies.get(DEMO_SITE_GATE_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const unlockUrl = request.nextUrl.clone();
  unlockUrl.pathname = "/unlock";
  unlockUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
