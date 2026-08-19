import { NextRequest, NextResponse } from "next/server";
import { findUserByLogin, verifyPassword } from "@/lib/users";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const login = String(body.login || "").trim();
  const password = String(body.password || "");

  if (!login || !password) {
    return NextResponse.json(
      { error: "Enter your email or username and password." },
      { status: 400 }
    );
  }

  const user = await findUserByLogin(login);
  if (!user || !(await verifyPassword(user, password))) {
    return NextResponse.json(
      { error: "Those details do not match an account." },
      { status: 401 }
    );
  }

  await setSessionCookie({
    id: user.id,
    username: user.username,
    email: user.email,
  });

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email },
  });
}
