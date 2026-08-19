import { Resend } from "resend";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.EMAIL_FROM || "MuseForge <beth.t@example.com>";
}

function wrap(title: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#07060c;color:#f4f1ea;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <p style="color:#fcd34d;letter-spacing:0.2em;text-transform:uppercase;font-size:12px;">MuseForge</p>
      <h1 style="font-size:28px;line-height:1.2;">${title}</h1>
      <div style="color:#d4d4d8;font-size:16px;line-height:1.6;">${body}</div>
      <p style="margin-top:32px;color:#71717a;font-size:12px;">You received this because you have a MuseForge account.</p>
    </div>
  </body>
</html>`;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  title: string;
  body: string;
}) {
  const client = getClient();
  if (!client) {
    return {
      ok: false,
      error:
        "Email is not configured. Add RESEND_API_KEY in Vercel to send real emails.",
    };
  }

  const { error } = await client.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    html: wrap(input.title, input.body),
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function sendWelcomeEmail(input: {
  to: string;
  username: string;
}) {
  return sendEmail({
    to: input.to,
    subject: "Welcome to MuseForge",
    title: `You’re in, ${input.username}.`,
    body: `<p>Your account is saved. Tomorrow’s spark is reserved for this inbox.</p>
      <p>Daily spark emails are on by default. You can change that anytime in Settings.</p>`,
  });
}

export async function sendSparkEmail(input: {
  to: string;
  username: string;
}) {
  return sendEmail({
    to: input.to,
    subject: "Today’s MuseForge spark",
    title: "Charge for the leftover 20%",
    body: `<p>Good morning${input.username ? `, ${input.username}` : ""}.</p>
      <p>Most tools solve the happy path. Ship a $29/month companion that owns the messy edge case your users already pay a contractor to fix.</p>
      <p>That’s today’s one idea. No feed. No extra tabs.</p>`,
  });
}

export async function sendProductUpdateEmail(input: { to: string }) {
  return sendEmail({
    to: input.to,
    subject: "You’re on the MuseForge product list",
    title: "Product updates are on.",
    body: `<p>We’ll email occasional notes when a new feature ships. No daily noise from this list.</p>`,
  });
}
