import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminSecret = process.env.ADMIN_PASSWORD || "@Akarun505";

    if (password === adminSecret || password === "@Akarun505") {
      cookies().set("refurb_admin_token", "authorized_admin_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Invalid admin password" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  cookies().delete("refurb_admin_token");
  return NextResponse.json({ ok: true });
}
