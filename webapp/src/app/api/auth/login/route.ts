import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Имэйл эсвэл нууц үг буруу байна." }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login failed:", err);
    // TEMP DEBUG — remove after diagnosing production 500
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Серверийн алдаа гарлаа.", debug: detail }, { status: 500 });
  }
}
