import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import type { UserRecord } from "@/lib/users";

export const ACCOUNTS_COOKIE = "museforge_accounts";

function getKey() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    "dev-only-change-AUTH_SECRET";
  const bytes = new Uint8Array(32);
  const src = new TextEncoder().encode(secret);
  bytes.set(src.subarray(0, Math.min(32, src.length)));
  return bytes;
}

export async function readCookieAccounts(): Promise<UserRecord[]> {
  try {
    const jar = await cookies();
    const token = jar.get(ACCOUNTS_COOKIE)?.value;
    if (!token) return [];
    const { payload } = await jwtDecrypt(token, getKey());
    const users = payload.users;
    return Array.isArray(users) ? (users as UserRecord[]) : [];
  } catch {
    return [];
  }
}

export async function writeCookieAccounts(users: UserRecord[]) {
  const token = await new EncryptJWT({ users })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .encrypt(getKey());

  const jar = await cookies();
  jar.set(ACCOUNTS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function upsertCookieAccount(user: UserRecord) {
  const users = await readCookieAccounts();
  const next = users.filter(
    (item) =>
      item.email !== user.email &&
      item.username.toLowerCase() !== user.username.toLowerCase()
  );
  next.push(user);
  await writeCookieAccounts(next);
}

export function findInAccounts(users: UserRecord[], login: string) {
  const value = login.trim().toLowerCase();
  return (
    users.find(
      (item) =>
        item.email.toLowerCase() === value ||
        item.username.toLowerCase() === value
    ) || null
  );
}

export function findAccountById(users: UserRecord[], id: string) {
  return users.find((item) => item.id === id) || null;
}

export async function replaceCookieAccount(user: UserRecord) {
  const users = await readCookieAccounts();
  const next = users.filter((item) => item.id !== user.id);
  next.push(user);
  await writeCookieAccounts(next);
}

export async function removeCookieAccount(id: string) {
  const users = await readCookieAccounts();
  await writeCookieAccounts(users.filter((item) => item.id !== id));
}
