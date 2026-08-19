# MuseForge

A subscription SaaS for a daily, personalized AI idea.

Repo: https://github.com/maxmazzarese-sys/museforge

## Stripe env vars

Add these in Vercel:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID` — recurring Creator price ($9/mo)
- `STRIPE_PRICE_ID_STUDIO` — recurring Studio price ($19/mo)

Checkout uses hosted Stripe Checkout in `subscription` mode with a 7-day trial. Plan names (`creator` / `studio`) are mapped on the server. Clients cannot pass raw price IDs.

## Deploy

Import this GitHub repo in Vercel, set the env vars, deploy.
