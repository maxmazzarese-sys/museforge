import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const FILE_PATH = path.join(
  process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data"),
  "users.json"
);

function isPostgresUrl(url?: string) {
  return !!url && /^postgres(ql)?:\/\//i.test(url);
}

function getSql() {
  return neon(process.env.DATABASE_URL as string);
}

async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function readFileStore(): Promise<UserRecord[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as UserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileStore(users: UserRecord[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2), "utf8");
}

export async function createUser(input: {
  username: string;
  email: string;
  password: string;
}): Promise<{ user: UserRecord } | { error: string }> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user: UserRecord = {
    id: randomUUID(),
    username: input.username,
    email: input.email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  const url = process.env.DATABASE_URL;
  if (isPostgresUrl(url)) {
    try {
      await ensureTable();
      const sql = getSql();
      await sql`
        INSERT INTO users (id, username, email, password_hash, created_at)
        VALUES (${user.id}, ${user.username}, ${user.email}, ${user.passwordHash}, ${user.createdAt})
      `;
      return { user };
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (/unique|duplicate/i.test(message)) {
        return { error: "That username or email is already taken." };
      }
      return { error: "Could not save the account. Check DATABASE_URL." };
    }
  }

  const users = await readFileStore();
  if (
    users.some(
      (item) =>
        item.email === user.email ||
        item.username.toLowerCase() === user.username.toLowerCase()
    )
  ) {
    return { error: "That username or email is already taken." };
  }
  users.push(user);
  try {
    await writeFileStore(users);
  } catch {
    // Vercel filesystem is read-only. Cookie store is the fallback.
  }
  return { user };
}

export async function findUserByLogin(login: string): Promise<UserRecord | null> {
  const value = login.trim().toLowerCase();
  const url = process.env.DATABASE_URL;

  if (isPostgresUrl(url)) {
    await ensureTable();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, username, email, password_hash AS "passwordHash", created_at AS "createdAt"
      FROM users
      WHERE lower(email) = ${value} OR lower(username) = ${value}
      LIMIT 1
    `) as UserRecord[];
    return rows[0] || null;
  }

  const users = await readFileStore();
  return (
    users.find(
      (item) =>
        item.email.toLowerCase() === value ||
        item.username.toLowerCase() === value
    ) || null
  );
}

export async function verifyPassword(user: UserRecord, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}
