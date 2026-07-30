import { NextRequest, NextResponse } from "next/server";
import { listSubcategories, createSubcategory, listCategories } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { SubcategorySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const subcategories = await listSubcategories(categoryId);
  return NextResponse.json({ subcategories });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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

  const subcategory = await createSubcategory({
    name: parsed.data.name,
    slug: parsed.data.slug,
    categoryId: category.id,
    categoryName: category.name,
  });
  return NextResponse.json({ subcategory }, { status: 201 });
}
