import Image from "next/image";
import Link from "next/link";
import { listProducts, listCategories, listSubcategories } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

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

  let products = await listProducts({ categoryId, subcategoryId });
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
      <section className="relative w-full h-[420px] md:h-[480px] flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80"
          alt="Хүнсний дэлгүүрийн шинэ ногоо, жимсний лангуу"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-u-xl w-full">
          <h1 className="font-display-lg text-display-lg text-white max-w-2xl mb-u-sm">
            Шинэ хүнс,
            <br />
            танай гэрт хүргэнэ.
          </h1>
          <p className="text-white/90 text-body-lg max-w-lg mb-u-md">
            Өдөр тутмын хэрэгцээт хүнсний бүтээгдэхүүнийг хамгийн шинэ, чанартай байдлаар танай хаалган дээр хүргэж өгнө.
          </p>
          <a
            href="#shop"
            className="inline-block bg-primary text-on-primary py-3 px-8 rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity active:scale-[0.98] duration-150"
          >
            ОДОО ХУДАЛДАН АВАХ
          </a>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-u-xl w-full" id="shop">
        <div className="flex flex-col gap-u-md mb-u-lg">
          <div className="flex justify-between items-center flex-wrap gap-u-sm">
            <h2 className="font-headline-lg text-headline-lg text-primary">{heading}</h2>
            {(q || activeCategory) && (
              <Link href="/" className="text-label-sm text-secondary hover:text-primary underline">
                Шүүлтүүр цэвэрлэх
              </Link>
            )}
          </div>

          <div className="flex gap-u-sm flex-wrap">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors ${
                !activeCategory ? "bg-primary text-on-primary" : "bg-surface-container-low text-secondary hover:bg-surface-container-high"
              }`}
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
          <p className="text-secondary py-u-xl text-center">
            {q || activeCategory ? "Хайлтад тохирох бүтээгдэхүүн олдсонгүй." : "Одоогоор бараа алга — админ хэсгээс бараа нэмнэ үү."}
          </p>
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
    </>
  );
}
