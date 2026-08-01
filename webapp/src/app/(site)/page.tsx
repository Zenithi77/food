import Image from "next/image";
import Link from "next/link";
import { listProducts, listCategories, listSubcategories } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { MaterialIcon } from "@/components/MaterialIcon";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sub?: string }>;
}) {
  const { q, category: categoryId, sub: subcategoryId } = await searchParams;

  const [categories, subcategories] = await Promise.all([
    listCategories(),
    subcategoryId || categoryId ? listSubcategories(categoryId) : Promise.resolve([]),
  ]);

  const activeCategory = categories.find((c) => c.id === categoryId);
  const activeSubcategory = subcategories.find((s) => s.id === subcategoryId);
  const showBrowse = !q && !activeCategory;

  let products = showBrowse ? [] : await listProducts({ categoryId, subcategoryId });
  if (q) {
    const needle = q.trim().toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(needle));
  }

  const heading = q
    ? `Хайлтын үр дүн: "${q}"`
    : activeSubcategory
      ? activeSubcategory.name
      : activeCategory
        ? activeCategory.name
        : "Энэ долоо хоногийн бараа";

  return (
    <>
      {showBrowse ? (
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-u-xl w-full" id="shop">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-gutter">
            {categories.map((c) => (
              <Link key={c.id} href={`/?category=${c.id}`} className="group flex flex-col items-center gap-2">
                <div className="w-full aspect-square rounded-lg md:rounded-xl overflow-hidden relative bg-surface-container-low ring-1 ring-outline-variant/60 group-hover:ring-primary transition-all">
                  {c.imageUrl ? (
                    <Image
                      src={c.imageUrl}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary">
                      <MaterialIcon name="category" className="text-3xl" />
                    </div>
                  )}
                </div>
                <span className="font-label-md text-label-md text-on-surface text-center group-hover:text-primary transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-u-xl w-full" id="shop">
          <div className="flex flex-col gap-u-md mb-u-lg">
            <div className="flex justify-between items-center flex-wrap gap-u-sm">
              <h2 className="font-headline-lg text-headline-lg text-primary">{heading}</h2>
              <Link href="/" className="text-label-sm text-secondary hover:text-primary underline">
                Шүүлтүүр цэвэрлэх
              </Link>
            </div>

            <div className="flex gap-u-sm flex-wrap">
              <Link
                href="/"
                className="px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors bg-surface-container-low text-secondary hover:bg-surface-container-high"
              >
                Бүгд
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/?category=${c.id}`}
                  className={`px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors ${
                    activeCategory?.id === c.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-secondary hover:bg-surface-container-high"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            {activeCategory && subcategories.length > 0 && (
              <div className="flex gap-u-sm flex-wrap">
                <Link
                  href={`/?category=${activeCategory.id}`}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm border transition-colors ${
                    !activeSubcategory
                      ? "border-primary text-primary"
                      : "border-outline-variant text-secondary hover:border-primary"
                  }`}
                >
                  Бүх {activeCategory.name}
                </Link>
                {subcategories.map((s) => (
                  <Link
                    key={s.id}
                    href={`/?category=${activeCategory.id}&sub=${s.id}`}
                    className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm border transition-colors ${
                      activeSubcategory?.id === s.id
                        ? "border-primary text-primary"
                        : "border-outline-variant text-secondary hover:border-primary"
                    }`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <p className="text-secondary py-u-xl text-center">Хайлтад тохирох бүтээгдэхүүн олдсонгүй.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-u-lg p-u-lg bg-secondary-container rounded-lg text-center">
            <p className="text-label-sm text-secondary italic">Захиалга бүр таны гэр бүлийн ширээнд шинэ хүнс хүргэхэд тусална.</p>
          </div>
        </div>
      )}
    </>
  );
}
