import { NextRequest, NextResponse } from "next/server";
import { updateProduct, deleteProduct, listCategories, listSubcategories } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ProductSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = ProductSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.categoryId) {
    const categories = await listCategories();
    const category = categories.find((c) => c.id === parsed.data.categoryId);
    if (!category) {
      return NextResponse.json({ error: "Сонгосон ангилал олдсонгүй." }, { status: 400 });
    }
    update.categoryName = category.name;

    if (parsed.data.subcategoryId) {
      const subcategories = await listSubcategories(category.id);
      const subcategory = subcategories.find((s) => s.id === parsed.data.subcategoryId);
      if (!subcategory) {
        return NextResponse.json({ error: "Сонгосон дэд ангилал олдсонгүй." }, { status: 400 });
      }
      update.subcategoryName = subcategory.name;
    } else if (parsed.data.subcategoryId === null) {
      update.subcategoryName = null;
    }
  }

  await updateProduct(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
