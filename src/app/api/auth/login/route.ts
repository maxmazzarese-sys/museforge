import { NextRequest, NextResponse } from "next/server";
import { findUserByLogin, verifyPassword } from "@/lib/users";
import { setSessionCookie } from "@/lib/session";
import { findInAccounts, readCookieAccounts } from "@/lib/account-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const login = String(body.login || "").trim();
    const password = String(body.password || "");

    if (!login || !password) {
      return NextResponse.json(
        { error: "Enter your email or username and password." },
        { status: 400 }
      );
    }

    const user =
      (await findUserByLogin(login)) ||
      findInAccounts(await readCookieAccounts(), login);

    if (!user || !(await verifyPassword(user, password))) {
      return NextResponse.json(
        { error: "Those details do not match an account." },
        { status: 401 }
      );
    }

    await setSessionCookie({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
