# MuseForge

A subscription SaaS for a daily, personalized AI idea — built so paying feels obvious.

Live repo: https://github.com/maxmazzarese-sys/museforge

## Why this product

2026 micro-SaaS research shows the products people actually pay for are:
- Narrow (one job, not another general chatbot)
- Recurring in the user's calendar (daily ritual)
- Tied to output or money (an idea they can ship today)
- Cheap relative to the alternative (less than one freelance hour)

MuseForge is a morning spark: one usable idea, prompt, or wedge tailored to the niches you pick.

## Stack

- Next.js App Router + Tailwind v4
- Stripe Checkout in `subscription` mode
- Vercel hosting

## Deploy on Vercel

1. Import this GitHub repo in [Vercel](https://vercel.com/new).
2. Add environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID` (a recurring Price from the Stripe Dashboard)
3. Deploy. Subscribe buttons open hosted Stripe Checkout.
4. Optional: add a webhook later for access control (`checkout.session.completed`, `customer.subscription.*`).

## Local

```bash
npm install
npm run dev
```
