import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/session";
import { validateSignup } from "@/lib/validation";
import {
  findInAccounts,
  readCookieAccounts,
  upsertCookieAccount,
} from "@/lib/account-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = validateSignup(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const cookieUsers = await readCookieAccounts();
    if (
      findInAccounts(cookieUsers, parsed.email) ||
      findInAccounts(cookieUsers, parsed.username)
    ) {
      return NextResponse.json(
        { error: "That username or email is already taken." },
        { status: 409 }
      );
    }

    const result = await createUser(parsed);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await upsertCookieAccount(result.user);
    await setSessionCookie({
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
    });

    return NextResponse.json({
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
