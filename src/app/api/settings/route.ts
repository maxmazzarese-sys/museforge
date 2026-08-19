import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession, setSessionCookie } from "@/lib/session";
import { normalizeEmail, normalizeUsername } from "@/lib/validation";
import { normalizeSettings } from "@/lib/settings";
import {
  findAccountById,
  findInAccounts,
  readCookieAccounts,
  replaceCookieAccount,
} from "@/lib/account-store";

export const dynamic = "force-dynamic";

function publicUser(user: {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  settings?: ReturnType<typeof normalizeSettings>;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt || null,
    settings: normalizeSettings(user.settings),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const accounts = await readCookieAccounts();
  const record =
    findAccountById(accounts, session.id) ||
    findInAccounts(accounts, session.email);

  return NextResponse.json({
    user: publicUser(
      record || {
        id: session.id,
        username: session.username,
        email: session.email,
        settings: normalizeSettings({ displayName: session.username }),
      }
    ),
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const accounts = await readCookieAccounts();
    const record =
      findAccountById(accounts, session.id) ||
      findInAccounts(accounts, session.email);

    if (!record) {
      return NextResponse.json(
        { error: "Account not found. Sign up again on this device." },
        { status: 404 }
      );
    }

    if (body.username) {
      const username = normalizeUsername(body.username);
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return NextResponse.json(
          {
            error:
              "Username must be 3–20 characters and only letters, numbers, or underscore.",
          },
          { status: 400 }
        );
      }
      const clash = findInAccounts(accounts, username);
      if (clash && clash.id !== record.id) {
        return NextResponse.json(
          { error: "That username is already taken." },
          { status: 409 }
        );
      }
      record.username = username;
    }

    if (body.email) {
      const email = normalizeEmail(body.email);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Enter a valid email address." },
          { status: 400 }
        );
      }
      const clash = findInAccounts(accounts, email);
      if (clash && clash.id !== record.id) {
        return NextResponse.json(
          { error: "That email is already taken." },
          { status: 409 }
        );
      }
      record.email = email;
    }

    if (body.settings) {
      record.settings = normalizeSettings({
        ...normalizeSettings(record.settings),
        ...body.settings,
      });
    }

    if (body.newPassword) {
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "");
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }
      const ok = await bcrypt.compare(currentPassword, record.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Current password is wrong." },
          { status: 400 }
        );
      }
      record.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await replaceCookieAccount(record);
    await setSessionCookie({
      id: record.id,
      username: record.username,
      email: record.email,
    });

    return NextResponse.json({ user: publicUser(record) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
