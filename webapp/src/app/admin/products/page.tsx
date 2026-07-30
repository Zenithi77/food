import { listProducts, listCategories, listSubcategories } from "@/lib/db";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const [products, categories, subcategories] = await Promise.all([
    listProducts(),
    listCategories(),
    listSubcategories(),
  ]);
  return <ProductsTable products={products} categories={categories} subcategories={subcategories} />;
}
