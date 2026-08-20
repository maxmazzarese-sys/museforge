import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  findAccountById,
  findInAccounts,
  readCookieAccounts,
} from "@/lib/account-store";
import { FREE_SUB, normalizeSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const accounts = await readCookieAccounts();
  const record =
    findAccountById(accounts, session.id) ||
    findInAccounts(accounts, session.email);

  return NextResponse.json({
    user: {
      ...session,
      subscription: normalizeSubscription(record?.subscription || FREE_SUB),
    },
  });
}
