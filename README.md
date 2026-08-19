# MuseForge

Daily AI idea subscription with login, signup, and Stripe checkout.

## Auth

Opening the site asks for login or signup (username, email, password).
Accounts are saved so people can log back in.

- Local: accounts are stored in `data/users.json` (gitignored)
- Production: set a Postgres `DATABASE_URL` (Neon is simplest) so accounts persist on Vercel

Also set `AUTH_SECRET` to a long random string.
