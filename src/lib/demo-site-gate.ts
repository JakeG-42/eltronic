import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const DEMO_SITE_GATE_COOKIE = "eltronic_demo_site_gate";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
export const DEMO_SITE_GATE_PASSWORD = "Jg94962757do6!";
const DEFAULT_SECRET = "temporary-eltronic-demo-gate-secret";

export function getDemoSiteGateSecret() {
  return (
    process.env.ELTRONIC_DEMO_GATE_SECRET ||
    process.env.ELTRONIC_ADMIN_SECRET ||
    process.env.AUTH_SECRET ||
    DEFAULT_SECRET
  );
}

export function signDemoSiteGatePayload(payload: string, secret = getDemoSiteGateSecret()) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function verifyDemoSiteGatePassword(password: string) {
  return safeCompare(password, DEMO_SITE_GATE_PASSWORD);
}

export function createDemoSiteGateToken(secret = getDemoSiteGateSecret()) {
  const payload = `site.${Date.now()}`;
  return `${payload}.${signDemoSiteGatePayload(payload, secret)}`;
}

export function isValidDemoSiteGateToken(token: string | undefined, secret = getDemoSiteGateSecret()) {
  if (!token) {
    return false;
  }

  const [scope, issuedAt, signature] = token.split(".");

  if (!scope || !issuedAt || !signature || scope !== "site") {
    return false;
  }

  const payload = `${scope}.${issuedAt}`;
  return safeCompare(signature, signDemoSiteGatePayload(payload, secret));
}

export async function setDemoSiteGateSession() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SITE_GATE_COOKIE, createDemoSiteGateToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function hasDemoSiteGateAccess() {
  const cookieStore = await cookies();
  return isValidDemoSiteGateToken(cookieStore.get(DEMO_SITE_GATE_COOKIE)?.value);
}
