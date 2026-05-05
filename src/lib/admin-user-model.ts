import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export type AdminRole = "super_admin" | "admin" | "moderator";
export type AdminUserStatus = "active" | "disabled";

export type AdminUser = {
  createdAt: string;
  displayName: string;
  email: string;
  id: string;
  passwordHash: string;
  role: AdminRole;
  sessionVersion: string;
  status: AdminUserStatus;
  updatedAt: string;
  username: string;
};

export type PublicAdminUser = Omit<AdminUser, "passwordHash">;

const ADMIN_PASSWORD_HASH =
  "scrypt$19e82fd0ef0495813f8db3273b273c9b$0bcd33284888aa5b9cbc9ec66e7de941cfc00de112b12ce603737c194208efce25db3a8f28fbb56ec6a3c775a7ef8a34b0c75d423dc3895a0078014ae342b2e2";
const JAKUB_PASSWORD_HASH =
  "scrypt$40f70718a72961c81ae9e247aae9bb1b$e8d4539f1472097674bf8fb41d6cb4d9a0af11a51cb9c0ea0ff52c7b02e1a714f42c2c672d3b76d36acb1356f991bf5823d44263652ef9ea0f75b585034c354e";
const SEED_DATE = "2026-04-27T00:00:00.000Z";

export const adminRoleLabels: Record<AdminRole, string> = {
  admin: "Admin",
  moderator: "Moderator",
  super_admin: "Super admin",
};

export const adminStatusLabels: Record<AdminUserStatus, string> = {
  active: "Active",
  disabled: "Disabled",
};

export function createSeedAdminUsers(): AdminUser[] {
  return [
    {
      createdAt: SEED_DATE,
      displayName: "Default Admin",
      email: "admin@eltronic.local",
      id: "seed-admin",
      passwordHash: ADMIN_PASSWORD_HASH,
      role: "super_admin",
      sessionVersion: "seed-admin-v1",
      status: "active",
      updatedAt: SEED_DATE,
      username: "admin",
    },
    {
      createdAt: SEED_DATE,
      displayName: "Jakub Gajosz",
      email: "jakub@gajosz.com",
      id: "seed-jakub",
      passwordHash: JAKUB_PASSWORD_HASH,
      role: "super_admin",
      sessionVersion: "seed-jakub-v1",
      status: "active",
      updatedAt: SEED_DATE,
      username: "jakub@gajosz.com",
    },
  ];
}

export function normalizeAdminUsers(users?: Partial<AdminUser>[] | null): AdminUser[] {
  if (!Array.isArray(users) || users.length === 0) {
    return createSeedAdminUsers();
  }

  return users
    .filter((user) => user?.id && user?.passwordHash)
    .map((user) => {
      const email = String(user.email ?? "").trim().toLowerCase();
      const username = String(user.username ?? email).trim().toLowerCase();
      const now = new Date().toISOString();

      return {
        createdAt: typeof user.createdAt === "string" ? user.createdAt : now,
        displayName: String(user.displayName ?? (username || email || "Studio user")).trim(),
        email,
        id: String(user.id),
        passwordHash: String(user.passwordHash),
        role: normalizeAdminRole(user.role),
        sessionVersion: typeof user.sessionVersion === "string" ? user.sessionVersion : "legacy-session-v1",
        status: normalizeAdminStatus(user.status),
        updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : now,
        username,
      };
    });
}

export function normalizeAdminRole(role: unknown): AdminRole {
  return role === "super_admin" || role === "admin" || role === "moderator" ? role : "moderator";
}

export function normalizeAdminStatus(status: unknown): AdminUserStatus {
  return status === "disabled" ? "disabled" : "active";
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${hash}`;
}

export function verifyAdminPassword(password: string, passwordHash: string) {
  const [algorithm, salt, expectedHash] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const currentHash = scryptSync(password, salt, 64).toString("hex");
  const currentBuffer = Buffer.from(currentHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  return currentBuffer.length === expectedBuffer.length && timingSafeEqual(currentBuffer, expectedBuffer);
}

export function toPublicAdminUser(user: AdminUser): PublicAdminUser {
  const { passwordHash, ...publicUser } = user;
  void passwordHash;

  return publicUser;
}

export function canManageUsers(user?: Pick<AdminUser, "role"> | null) {
  return user?.role === "super_admin" || user?.role === "admin";
}

export function canManageSubmissions(user?: Pick<AdminUser, "role"> | null) {
  return Boolean(user && ["super_admin", "admin", "moderator"].includes(user.role));
}

export function canManageSiteContent(user?: Pick<AdminUser, "role"> | null) {
  return canManageUsers(user);
}
