import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eltronic_andersen_gate";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const GATE_PASSWORD = "Andersen2026!";
const DEFAULT_SECRET = "temporary-eltronic-andersen-gate-secret";

function getGateSecret() {
  return (
    process.env.ELTRONIC_ANDERSEN_GATE_SECRET ||
    process.env.ELTRONIC_ADMIN_SECRET ||
    process.env.AUTH_SECRET ||
    DEFAULT_SECRET
  );
}

function sign(value: string) {
  return createHmac("sha256", getGateSecret()).update(value).digest("hex");
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function verifyAndersenGatePassword(password: string) {
  return safeCompare(password, GATE_PASSWORD);
}

export async function setAndersenGateSession() {
  const cookieStore = await cookies();
  const issuedAt = Date.now().toString();
  const payload = `andersen.${issuedAt}`;
  const signature = sign(payload);

  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/andersen",
  });
}

export async function hasAndersenGateAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const [scope, issuedAt, signature] = token.split(".");

  if (!scope || !issuedAt || !signature || scope !== "andersen") {
    return false;
  }

  const payload = `${scope}.${issuedAt}`;
  return safeCompare(signature, sign(payload));
}
