import { NextRequest, NextResponse } from "next/server";
import { listProducts, createProduct, getProductBySlug, listCategories, listSubcategories } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ProductSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const subcategoryId = searchParams.get("subcategoryId") ?? undefined;
  const products = await listProducts({ categoryId, subcategoryId });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." },
      { status: 400 }
    );
  }

  const existing = await getProductBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json({ error: "Ийм slug-тай бараа бүртгэлтэй байна." }, { status: 409 });
  }

  const categories = await listCategories();
  const category = categories.find((c) => c.id === parsed.data.categoryId);
  if (!category) {
    return NextResponse.json({ error: "Сонгосон ангилал олдсонгүй." }, { status: 400 });
  }

  let subcategoryName: string | null = null;
  if (parsed.data.subcategoryId) {
    const subcategories = await listSubcategories(category.id);
    const subcategory = subcategories.find((s) => s.id === parsed.data.subcategoryId);
    if (!subcategory) {
      return NextResponse.json({ error: "Сонгосон дэд ангилал олдсонгүй." }, { status: 400 });
    }
    subcategoryName = subcategory.name;
  }

  const product = await createProduct({
    ...parsed.data,
    categoryName: category.name,
    subcategoryId: parsed.data.subcategoryId,
    subcategoryName,
  });
  return NextResponse.json({ product }, { status: 201 });
}
