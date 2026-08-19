import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/session";
import { validateSignup } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = validateSignup(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await createUser(parsed);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  await setSessionCookie({
    id: result.user.id,
    username: result.user.username,
    email: result.user.email,
  });

  return NextResponse.json({
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
    },
  });
}
