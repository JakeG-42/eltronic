import { NextResponse, type NextRequest } from "next/server";

const PAYLOAD_SITE_HOSTS = new Set(["new.eltronic.co.uk"]);

const PASSTHROUGH_PREFIXES = ["/_next", "/api", "/console", "/console-api", "/studio", "/v2"];
const PUBLIC_FILE_PATTERN = /\.(?:avif|css|gif|ico|jpg|jpeg|js|json|map|png|svg|txt|webmanifest|webp|xml)$/i;

function getHostname(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";

  return host.split(":")[0]?.toLowerCase() ?? "";
}

function shouldPassThrough(pathname: string) {
  return PASSTHROUGH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    || PUBLIC_FILE_PATTERN.test(pathname);
}

export function proxy(request: NextRequest) {
  if (!PAYLOAD_SITE_HOSTS.has(getHostname(request)) || shouldPassThrough(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/v2";

  return NextResponse.rewrite(url);
}
