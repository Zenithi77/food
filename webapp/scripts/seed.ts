import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Supabase тохиргоо дутуу байна. .env файлд SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY утгуудыг оруулна уу.\n" +
      "Дэлгэрэнгүй заавар: SUPABASE_SETUP.md"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const CATEGORIES = [
  { name: "Мах", slug: "makh" },
  { name: "Амталгч", slug: "amtlagch" },
  { name: "Хачир", slug: "hachir" },
];

const SUBCATEGORIES: { name: string; slug: string; categorySlug: string }[] = [];

const PRODUCTS = [
  {
    name: "Үхрийн мах",
    slug: "ukhriin-makh",
    description: "Шинэ, чанарын гэрчилгээтэй үхрийн мах.",
    price: 28000,
    unit: "1 кг",
    categorySlug: "makh",
    subcategorySlug: null as string | null,
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&q=80",
    stock: 15,
    featured: true,
  },
  {
    name: "Тахианы мах",
    slug: "takhiany-makh",
    description: "Бүхэл тахианы мах, хөлдөөгүй, шинэ.",
    price: 22000,
    unit: "1.5 кг",
    categorySlug: "makh",
    subcategorySlug: null,
    imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=1200&q=80",
    stock: 18,
    featured: false,
  },
  {
    name: "Амталгчийн иж бүрдэл",
    slug: "amtlagchiin-ij-burdel",
    description: "Төрөл бүрийн амталгч, ургамлын хольцтой иж бүрдэл.",
    price: 9800,
    unit: "1 сав",
    categorySlug: "amtlagch",
    subcategorySlug: null,
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=80",
    stock: 25,
    featured: false,
  },
  {
    name: "Улаан лоолийн соус",
    slug: "ulaan-loolliin-sous",
    description: "Байгалийн улаан лоолиноос хийсэн амтат соус.",
    price: 6200,
    unit: "350 гр",
    categorySlug: "amtlagch",
    subcategorySlug: null,
    imageUrl: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=1200&q=80",
    stock: 30,
    featured: false,
  },
  {
    name: "Чинжүүний хольц",
    slug: "chinjuuniy-holts",
    description: "Халуун ногооны хатаасан хольц, хоолны амт нэмэгдүүлнэ.",
    price: 5400,
    unit: "150 гр",
    categorySlug: "amtlagch",
    subcategorySlug: null,
    imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=1200&q=80",
    stock: 28,
    featured: false,
  },
  {
    name: "Өргөст хэмхний хачир",
    slug: "urgost-hemhnii-hachir",
    description: "Даршилсан, исгэсэн шүүслэг өргөст хэмх.",
    price: 7500,
    unit: "500 гр",
    categorySlug: "hachir",
    subcategorySlug: null,
    imageUrl: "https://images.unsplash.com/photo-1589621316382-008455b857cd?w=1200&q=80",
    stock: 18,
    featured: false,
  },
  {
    name: "Сонгины хачир",
    slug: "songinii-hachir",
    description: "Даршилсан улаан сонгино, хоолны хачир.",
    price: 4800,
    unit: "400 гр",
    categorySlug: "hachir",
    subcategorySlug: null,
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=1200&q=80",
    stock: 20,
    featured: false,
  },
];

async function upsert(table: string, uniqueCol: string, uniqueVal: string, data: Record<string, unknown>) {
  const { data: existing } = await supabase.from(table).select("id").eq(uniqueCol, uniqueVal).maybeSingle();
  if (existing) {
    const { error } = await supabase.from(table).update(data).eq("id", existing.id);
    if (error) throw error;
    return existing.id as string;
  }
  const { data: created, error } = await supabase.from(table).insert(data).select("id").single();
  if (error) throw error;
  return created.id as string;
}

async function main() {
  console.log("Ангилал үүсгэж байна...");
  const categoryIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    categoryIds[c.slug] = await upsert("categories", "slug", c.slug, { name: c.name, slug: c.slug });
  }

  console.log("Дэд ангилал үүсгэж байна...");
  const subcategoryIds: Record<string, string> = {};
  for (const s of SUBCATEGORIES) {
    subcategoryIds[s.slug] = await upsert("subcategories", "slug", s.slug, {
      name: s.name,
      slug: s.slug,
      category_id: categoryIds[s.categorySlug],
    });
  }

  console.log("Хэрэглэгч үүсгэж байна...");
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await upsert("users", "email", "admin@khunsmarket.mn", {
    name: "Админ",
    email: "admin@khunsmarket.mn",
    phone: "99001122",
    password_hash: adminPasswordHash,
    role: "ADMIN",
  });

  const demoPasswordHash = await bcrypt.hash("password123", 10);
  await upsert("users", "email", "bat@example.com", {
    name: "Батаа",
    email: "bat@example.com",
    phone: "88112233",
    password_hash: demoPasswordHash,
    role: "CUSTOMER",
  });

  console.log("Бараа үүсгэж байна...");
  for (const p of PRODUCTS) {
    await upsert("products", "slug", p.slug, {
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      unit: p.unit,
      category_id: categoryIds[p.categorySlug],
      subcategory_id: p.subcategorySlug ? subcategoryIds[p.subcategorySlug] : null,
      image_url: p.imageUrl,
      stock: p.stock,
      featured: p.featured,
    });
  }

  console.log("\nSeed амжилттай.");
  console.log("Админ нэвтрэх: admin@khunsmarket.mn / admin123");
  console.log("Хэрэглэгч нэвтрэх: bat@example.com / password123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
