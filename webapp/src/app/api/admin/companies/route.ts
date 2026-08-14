import { NextRequest, NextResponse } from "next/server";
import { listCompanies, createCompany, findUserByEmail, CompanyError } from "@/lib/db";
import { requireAdminSession, hashPassword } from "@/lib/auth";
import { CompanyCreateSchema } from "@/lib/validation";
import { logError } from "@/lib/logger";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const companies = await listCompanies();
  return NextResponse.json({ companies });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CompanyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." }, { status: 400 });
  }

  const existing = await findUserByEmail(parsed.data.loginEmail);
  if (existing) {
    return NextResponse.json({ error: "Энэ имэйл хаягаар бүртгэл аль хэдийн үүссэн байна." }, { status: 409 });
  }

  try {
    const passwordHash = await hashPassword(parsed.data.loginPassword);
    const company = await createCompany({
      name: parsed.data.name,
      contactPhone: parsed.data.contactPhone,
      contactEmail: parsed.data.contactEmail,
      userName: parsed.data.name,
      userEmail: parsed.data.loginEmail,
      userPhone: parsed.data.contactPhone,
      passwordHash,
    });
    return NextResponse.json({ company }, { status: 201 });
  } catch (err) {
    if (err instanceof CompanyError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    logError("admin.companies.create", err);
    return NextResponse.json({ error: "Байгууллага үүсгэхэд алдаа гарлаа." }, { status: 500 });
  }
}
