"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { formatMNT } from "@/lib/format";
import type { CategoryDTO, ProductDTO, SubcategoryDTO } from "@/types";

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const emptyForm = {
  name: "",
  slug: "",
  slugTouched: false,
  description: "",
  price: "",
  unit: "",
  categoryId: "",
  subcategoryId: "",
  imageUrl: "",
  stock: "",
  featured: false,
};

export function ProductsTable({
  products,
  categories,
  subcategories,
}: {
  products: ProductDTO[];
  categories: CategoryDTO[];
  subcategories: SubcategoryDTO[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableSubcategories = useMemo(
    () => subcategories.filter((s) => s.categoryId === form.categoryId),
    [subcategories, form.categoryId]
  );

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(product: ProductDTO) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      slugTouched: true,
      description: product.description,
      price: String(product.price),
      unit: product.unit,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId ?? "",
      imageUrl: product.imageUrl,
      stock: String(product.stock),
      featured: product.featured,
    });
    setError(null);
    setShowForm(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: f.slugTouched ? f.slug : slugify(name) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!form.categoryId) {
        setError("Ангилал сонгоно уу.");
        return;
      }
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: Number(form.price),
        unit: form.unit,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId || null,
        imageUrl: form.imageUrl,
        stock: Number(form.stock),
        featured: form.featured,
      };
      const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Алдаа гарлаа.");
        return;
      }
      setShowForm(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Энэ барааг устгах уу? Энэ үйлдлийг буцаах боломжгүй.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-u-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">Бараа</h1>
        <button
          onClick={openCreate}
          disabled={categories.length === 0}
          className="bg-primary text-on-primary py-2 px-6 rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
        >
          <MaterialIcon name="add" className="text-base" />
          Бараа нэмэх
        </button>
      </div>

      {categories.length === 0 && (
        <div className="mb-u-md p-u-md rounded-lg bg-error-container text-on-error-container text-label-sm">
          Эхлээд &ldquo;Ангилал&rdquo; хэсгээс дор хаяж нэг ангилал үүсгэнэ үү.
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-margin-mobile">
          <div className="bg-surface-container-lowest rounded-lg p-u-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-headline-md text-headline-md text-primary mb-u-md">
              {editingId ? "Бараа засах" : "Бараа нэмэх"}
            </h2>
            {error && <div className="mb-u-md p-3 rounded bg-error-container text-on-error-container text-label-sm">{error}</div>}
            <form className="space-y-u-sm" onSubmit={handleSubmit}>
              <Field label="Нэр" value={form.name} onChange={handleNameChange} required />
              <Field
                label="Slug"
                value={form.slug}
                onChange={(v) => setForm({ ...form, slug: v, slugTouched: true })}
                required
              />
              <Field label="Тайлбар" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              <div className="grid grid-cols-2 gap-u-sm">
                <Field label="Үнэ (₮)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
                <Field label="Хэмжих нэгж" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} required placeholder="1 кг, 1 ш..." />
              </div>
              <div className="grid grid-cols-2 gap-u-sm">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                    Ангилал
                  </label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                  >
                    <option value="" disabled>
                      Сонгох
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                    Дэд ангилал (заавал биш)
                  </label>
                  <select
                    value={form.subcategoryId}
                    onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                    disabled={availableSubcategories.length === 0}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors disabled:opacity-50"
                  >
                    <option value="">Байхгүй</option>
                    {availableSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Field label="Нөөц" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required />
              <Field label="Зургийн URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} required />
              <label className="flex items-center gap-2 text-secondary text-label-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                Онцлох бараа
              </label>
              <div className="flex gap-u-sm pt-u-sm">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-full font-label-md text-label-md border border-outline-variant text-secondary hover:bg-surface-container-low transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="item-card-shadow bg-surface-container-lowest rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Бараа</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Ангилал</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Үнэ</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">Нөөц</th>
              <th className="px-u-md py-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-u-md py-6 text-center text-secondary">
                  Бараа алга.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t border-outline-variant">
                  <td className="px-u-md py-3 font-label-md">{product.name}</td>
                  <td className="px-u-md py-3 text-label-sm text-secondary">
                    {product.categoryName}
                    {product.subcategoryName ? ` / ${product.subcategoryName}` : ""}
                  </td>
                  <td className="px-u-md py-3">{formatMNT(product.price)}</td>
                  <td className={`px-u-md py-3 ${product.stock <= 5 ? "text-error" : ""}`}>{product.stock}</td>
                  <td className="px-u-md py-3 text-right">
                    <button onClick={() => openEdit(product)} className="text-secondary hover:text-primary transition-colors">
                      <MaterialIcon name="edit" className="text-lg" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-secondary hover:text-error transition-colors ml-2">
                      <MaterialIcon name="delete" className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
      />
    </div>
  );
}
