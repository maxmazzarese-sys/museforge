import { NextRequest, NextResponse } from "next/server";
import { sendSparkEmail } from "@/lib/email";
import { readCookieAccounts } from "@/lib/account-store";
import { normalizeSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const users = await readCookieAccounts();
  let sent = 0;
  const errors: string[] = [];

  for (const user of users) {
    const settings = normalizeSettings(user.settings);
    if (!settings.emailDaily) continue;
    const result = await sendSparkEmail({
      to: user.email,
      username: settings.displayName || user.username,
    });
    if (result.ok) sent += 1;
    else if (result.error) errors.push(result.error);
  }

  return NextResponse.json({ sent, errors });
}
