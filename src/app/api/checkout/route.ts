import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secret || !priceId) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel environment variables.",
      },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);
  const origin = req.headers.get("origin") || "https://museforge.vercel.app";

  try {
    const body = await req.json().catch(() => ({}));
    const selectedPrice = body.priceId || priceId;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: selectedPrice, quantity: 1 }],
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
