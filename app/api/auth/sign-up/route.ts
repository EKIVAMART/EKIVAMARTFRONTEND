import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { signUpSchema } from "../../../../lib/schemas/auth";
import { hashPassword } from "../../../../lib/auth";
import { findUserByEmail, createUser } from "../../../../models/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
    }

    const db = await getDb();
    const existing = await findUserByEmail(db, parsed.data.email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const created = await createUser(db, {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      createdAt: new Date(),
    } as any);

    return NextResponse.json({ ok: true, user: { id: created._id, email: created.email, name: created.name } }, { status: 201 });
  } catch (err: any) {
    console.error("Sign-up error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
