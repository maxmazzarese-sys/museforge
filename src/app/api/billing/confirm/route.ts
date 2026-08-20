import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import {
  findAccountById,
  findInAccounts,
  readCookieAccounts,
  replaceCookieAccount,
} from "@/lib/account-store";
import { normalizeSubscription, type Plan } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Stripe is not configured yet." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.session_id || "");
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Missing checkout session." }, { status: 400 });
    }

    const stripe = new Stripe(secret);
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.status !== "complete") {
      return NextResponse.json(
        { error: "Checkout is not complete yet." },
        { status: 400 }
      );
    }

    const owner = String(checkout.metadata?.userId || "");
    if (owner && owner !== session.id) {
      return NextResponse.json(
        { error: "This checkout belongs to a different account." },
        { status: 403 }
      );
    }

    const plan: Plan =
      checkout.metadata?.plan === "studio" ? "studio" : "creator";
    const status =
      checkout.payment_status === "paid" ? "active" : "trialing";

    const accounts = await readCookieAccounts();
    const record =
      findAccountById(accounts, session.id) ||
      findInAccounts(accounts, session.email);

    if (!record) {
      return NextResponse.json(
        { error: "Account not found on this device." },
        { status: 404 }
      );
    }

    record.subscription = normalizeSubscription({
      plan,
      status,
      stripeSessionId: sessionId,
    });
    await replaceCookieAccount(record);

    return NextResponse.json({
      subscription: record.subscription,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not unlock plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
