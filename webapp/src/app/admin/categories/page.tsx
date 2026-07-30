import { listCategories, listSubcategories } from "@/lib/db";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const [categories, subcategories] = await Promise.all([listCategories(), listSubcategories()]);
  return <CategoriesManager categories={categories} subcategories={subcategories} />;
}
