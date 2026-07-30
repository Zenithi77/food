import { NextRequest, NextResponse } from "next/server";
import { listCategories, createCategory, getCategoryBySlug } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { CategorySchema } from "@/lib/validation";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." }, { status: 400 });
  }

  const existing = await getCategoryBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json({ error: "Ийм slug-тай ангилал байна." }, { status: 409 });
  }

  const category = await createCategory(parsed.data);
  return NextResponse.json({ category }, { status: 201 });
}
