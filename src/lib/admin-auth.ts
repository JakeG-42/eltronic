import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import {
  canManageSiteContent,
  canManageSubmissions,
  canManageUsers,
  verifyAdminPassword,
  type AdminRole,
  type AdminUser,
} from "@/lib/admin-user-model";
import { findAdminUserByIdentifier, getAdminUserById } from "@/lib/managed-data";

const COOKIE_NAME = "eltronic_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_ADMIN_SECRET = "temporary-eltronic-admin-secret";

function getAdminSecret() {
  return (
    process.env.ELTRONIC_ADMIN_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    DEFAULT_ADMIN_SECRET
  );
}

function sign(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("hex");
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function isAdminConfigured() {
  return Boolean(getAdminSecret());
}

export async function verifyAdminCredentials(identifier: string, password: string) {
  const user = await findAdminUserByIdentifier(identifier);

  if (!user || user.status !== "active") {
    return null;
  }

  return verifyAdminPassword(password, user.passwordHash) ? user : null;
}

export async function setAdminSession(user: Pick<AdminUser, "id" | "sessionVersion">) {
  const cookieStore = await cookies();
  const issuedAt = Date.now().toString();
  const payload = `${user.id}.${user.sessionVersion}.${issuedAt}`;
  const signature = sign(payload);

  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
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

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token || !isAdminConfigured()) {
    return null;
  }

  const [userId, sessionVersion, issuedAt, signature] = token.split(".");
  const issuedTime = Number(issuedAt);

  if (!userId || !sessionVersion || !issuedAt || !signature || Number.isNaN(issuedTime)) {
    return null;
  }

  const expiresAt = issuedTime + SESSION_MAX_AGE_SECONDS * 1000;

  if (Date.now() > expiresAt || !safeCompare(signature, sign(`${userId}.${sessionVersion}.${issuedAt}`))) {
    return null;
  }

  const user = await getAdminUserById(userId);

  return user?.status === "active" && user.sessionVersion === sessionVersion ? user : null;
}

export async function isAdminAuthenticated() {
  return Boolean(await getCurrentAdminUser());
}

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return user;
}

export async function requireAdminRole(roles: AdminRole[]) {
  const user = await requireAdminUser();

  if (!roles.includes(user.role)) {
    throw new Error("This account does not have permission for that action.");
  }

  return user;
}

export function userCanManageUsers(user?: Pick<AdminUser, "role"> | null) {
  return canManageUsers(user);
}

export function userCanManageSiteContent(user?: Pick<AdminUser, "role"> | null) {
  return canManageSiteContent(user);
}

export function userCanManageSubmissions(user?: Pick<AdminUser, "role"> | null) {
  return canManageSubmissions(user);
}
