import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { signInSchema } from "../../../../lib/schemas/auth";
import { findUserByEmail } from "../../../../models/user";
import { verifyPassword, signToken, setTokenCookie } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
    }

    const db = await getDb();
    const user = await findUserByEmail(db, parsed.data.email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(parsed.data.password, (user as any).passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ sub: String((user as any)._id), email: user.email });
    const res = NextResponse.json({ ok: true, user: { id: (user as any)._id, email: user.email, name: (user as any).name } });
    setTokenCookie(res.headers, token);
    return res;
  } catch (err: any) {
    console.error("Sign-in error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
