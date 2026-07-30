import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { CategorySchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." }, { status: 400 });
  }

  await updateCategory(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  await deleteCategory(id);
  return NextResponse.json({ ok: true });
}
