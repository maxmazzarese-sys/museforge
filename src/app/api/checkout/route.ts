import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";

const PLANS = {
  creator: process.env.STRIPE_PRICE_ID,
  studio: process.env.STRIPE_PRICE_ID_STUDIO || process.env.STRIPE_PRICE_ID,
} as const;

type Plan = keyof typeof PLANS;

function isPlan(value: unknown): value is Plan {
  return value === "creator" || value === "studio";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel environment variables.",
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const plan: Plan = isPlan(body.plan) ? body.plan : "creator";
  const priceId = PLANS[plan];

  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe price. Set STRIPE_PRICE_ID (Creator) and optionally STRIPE_PRICE_ID_STUDIO.",
      },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);
  const origin =
    req.headers.get("origin") ||
    req.headers.get("referer")?.replace(/\/$/, "") ||
    "http://localhost:3000";

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      customer_email: session.email,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        trial_period_days: 7,
        metadata: { plan, userId: session.id },
      },
      metadata: { plan, userId: session.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
