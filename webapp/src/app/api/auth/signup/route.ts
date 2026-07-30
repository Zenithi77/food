import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { SignupSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = SignupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." },
      { status: 400 }
    );
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Энэ имэйл хаягаар бүртгэл аль хэдийн үүссэн байна." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, phone, passwordHash, role: "CUSTOMER" });

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
