"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { CategoryDTO, SubcategoryDTO } from "@/types";

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoriesManager({
  categories,
  subcategories,
}: {
  categories: CategoryDTO[];
  subcategories: SubcategoryDTO[];
}) {
  const router = useRouter();

  return (
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary mb-u-lg">Ангилал</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <CategoryPanel categories={categories} onChanged={() => router.refresh()} />
        <SubcategoryPanel categories={categories} subcategories={subcategories} onChanged={() => router.refresh()} />
      </div>
    </div>
  );
}

function CategoryPanel({ categories, onChanged }: { categories: CategoryDTO[]; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setEditingId(null);
    setError(null);
  }

  function startEdit(c: CategoryDTO) {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setSlugTouched(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Алдаа гарлаа.");
        return;
      }
      reset();
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Энэ ангиллыг устгах уу? Харьяа дэд ангилалууд бас устана.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="item-card-shadow bg-surface-container-lowest rounded-lg p-u-md">
      <h2 className="font-headline-md text-headline-md text-primary mb-u-sm">Ангилал</h2>

      <form onSubmit={handleSubmit} className="space-y-u-sm mb-u-md">
        {error && <div className="p-3 rounded bg-error-container text-on-error-container text-label-sm">{error}</div>}
        <div className="flex gap-u-sm">
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Ангиллын нэр"
            className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="slug"
            className="w-32 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex gap-u-sm">
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="py-2 px-4 rounded-full font-label-sm text-label-sm border border-outline-variant text-secondary hover:bg-surface-container-low transition-colors"
            >
              Болих
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary text-on-primary py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Хадгалж байна..." : editingId ? "Ангилал засах" : "Ангилал нэмэх"}
          </button>
        </div>
      </form>

      <div className="divide-y divide-outline-variant">
        {categories.length === 0 ? (
          <p className="text-secondary text-label-sm py-u-sm">Ангилал алга.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-u-sm">
              <div>
                <p className="font-label-md text-label-md">{c.name}</p>
                <p className="text-label-sm text-secondary">{c.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(c)} className="text-secondary hover:text-primary transition-colors">
                  <MaterialIcon name="edit" className="text-lg" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-secondary hover:text-error transition-colors">
                  <MaterialIcon name="delete" className="text-lg" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SubcategoryPanel({
  categories,
  subcategories,
  onChanged,
}: {
  categories: CategoryDTO[];
  subcategories: SubcategoryDTO[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, SubcategoryDTO[]>();
    for (const s of subcategories) {
      if (!map.has(s.categoryId)) map.set(s.categoryId, []);
      map.get(s.categoryId)!.push(s);
    }
    return map;
  }, [subcategories]);

  function reset() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setEditingId(null);
    setError(null);
    setCategoryId(categories[0]?.id ?? "");
  }

  function startEdit(s: SubcategoryDTO) {
    setEditingId(s.id);
    setName(s.name);
    setSlug(s.slug);
    setSlugTouched(true);
    setCategoryId(s.categoryId);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!categoryId) {
        setError("Эхлээд ангилал үүсгэнэ үү.");
        return;
      }
      const res = await fetch(editingId ? `/api/subcategories/${editingId}` : "/api/subcategories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, categoryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Алдаа гарлаа.");
        return;
      }
      reset();
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Энэ дэд ангиллыг устгах уу?")) return;
    await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="item-card-shadow bg-surface-container-lowest rounded-lg p-u-md">
      <h2 className="font-headline-md text-headline-md text-primary mb-u-sm">Дэд ангилал</h2>

      <form onSubmit={handleSubmit} className="space-y-u-sm mb-u-md">
        {error && <div className="p-3 rounded bg-error-container text-on-error-container text-label-sm">{error}</div>}
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
        >
          <option value="" disabled>
            Харьяалагдах ангилал сонгох
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-u-sm">
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Дэд ангиллын нэр"
            className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="slug"
            className="w-32 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex gap-u-sm">
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="py-2 px-4 rounded-full font-label-sm text-label-sm border border-outline-variant text-secondary hover:bg-surface-container-low transition-colors"
            >
              Болих
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || categories.length === 0}
            className="flex-1 bg-primary text-on-primary py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Хадгалж байна..." : editingId ? "Дэд ангилал засах" : "Дэд ангилал нэмэх"}
          </button>
        </div>
      </form>

      <div className="space-y-u-sm">
        {categories.length === 0 ? (
          <p className="text-secondary text-label-sm py-u-sm">Эхлээд ангилал үүсгэнэ үү.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id}>
              <p className="text-label-sm text-secondary uppercase tracking-wider mb-1">{c.name}</p>
              <div className="divide-y divide-outline-variant border-t border-outline-variant">
                {(grouped.get(c.id) ?? []).length === 0 ? (
                  <p className="text-label-sm text-secondary py-2">Дэд ангилал алга.</p>
                ) : (
                  (grouped.get(c.id) ?? []).map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2">
                      <p className="font-label-md text-label-md">{s.name}</p>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(s)} className="text-secondary hover:text-primary transition-colors">
                          <MaterialIcon name="edit" className="text-base" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="text-secondary hover:text-error transition-colors">
                          <MaterialIcon name="delete" className="text-base" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
