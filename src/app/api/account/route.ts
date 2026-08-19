import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/session";
import { removeCookieAccount } from "@/lib/account-store";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  await removeCookieAccount(session.id);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
