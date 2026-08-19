# MuseForge

Daily AI idea subscription with login, signup, Stripe checkout, and email.

## Auth

Opening the site asks for login or signup (username, email, password).
Accounts are saved so people can log back in.

- Local: accounts are stored in `data/users.json` (gitignored)
- Production: set a Postgres `DATABASE_URL` (Neon is simplest) so accounts persist on Vercel

Also set `AUTH_SECRET` to a long random string.

## Email

Signup and notification settings send real emails through Resend.

1. Create a free account at https://resend.com
2. Add `RESEND_API_KEY` in Vercel
3. Until you verify a domain, keep `EMAIL_FROM` as `MuseForge <beth.t@example.com>`
   That test sender can only deliver to the email on your Resend account.
4. After you verify your domain, set `EMAIL_FROM` to something like `MuseForge <hello@yourdomain.com>`
