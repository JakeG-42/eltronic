import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eltronic_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "password";
const DEFAULT_ADMIN_SECRET = "temporary-eltronic-admin-secret";

function getAdminSecret() {
  return (
    process.env.ELTRONIC_ADMIN_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    DEFAULT_ADMIN_SECRET
  );
}

function getAdminUsername() {
  return process.env.ELTRONIC_ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
}

function getAdminPassword() {
  return process.env.ELTRONIC_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

function sign(value: string) {
  const secret = getAdminSecret();

  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function isAdminConfigured() {
  return Boolean(getAdminSecret() && getAdminUsername() && getAdminPassword());
}

export function verifyAdminCredentials(username: string, password: string) {
  const configuredUsername = getAdminUsername();
  const configuredPassword = getAdminPassword();
  const secret = getAdminSecret();

  if (!configuredUsername || !configuredPassword || !secret) {
    return false;
  }

  return (
    safeCompare(sign(username.trim()), sign(configuredUsername)) &&
    safeCompare(sign(password), sign(configuredPassword))
  );
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt);

  cookieStore.set(COOKIE_NAME, `${issuedAt}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token || !isAdminConfigured()) {
    return false;
  }

  const [issuedAt, signature] = token.split(".");
  const issuedTime = Number(issuedAt);

  if (!issuedAt || !signature || Number.isNaN(issuedTime)) {
    return false;
  }

  const expiresAt = issuedTime + SESSION_MAX_AGE_SECONDS * 1000;

  if (Date.now() > expiresAt) {
    return false;
  }

  return safeCompare(signature, sign(issuedAt));
}
