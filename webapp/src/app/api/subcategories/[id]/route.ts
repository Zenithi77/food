import { NextRequest, NextResponse } from "next/server";
import { updateSubcategory, deleteSubcategory, listCategories } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { SubcategorySchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = SubcategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." }, { status: 400 });
  }

  const categories = await listCategories();
  const category = categories.find((c) => c.id === parsed.data.categoryId);
  if (!category) {
    return NextResponse.json({ error: "Сонгосон ангилал олдсонгүй." }, { status: 400 });
  }

  await updateSubcategory(id, {
    name: parsed.data.name,
    slug: parsed.data.slug,
    categoryId: category.id,
    categoryName: category.name,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  await deleteSubcategory(id);
  return NextResponse.json({ ok: true });
}
