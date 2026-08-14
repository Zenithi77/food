"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { CompanyDTO } from "@/types";

function randomPassword() {
  return Math.random().toString(36).slice(-10);
}

export function CompaniesManager({ companies }: { companies: CompanyDTO[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(randomPassword());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  function reset() {
    setName("");
    setContactPhone("");
    setContactEmail("");
    setLoginEmail("");
    setLoginPassword(randomPassword());
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contactPhone, contactEmail, loginEmail, loginPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError(data?.error ?? "Алдаа гарлаа.");
        return;
      }
      setCreated({ email: loginEmail, password: loginPassword });
      reset();
      setShowForm(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-u-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">Байгууллагууд</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setCreated(null);
          }}
          className="bg-primary text-on-primary py-2 px-4 rounded-full font-label-sm text-label-sm hover:opacity-90 transition-opacity"
        >
          + Байгууллага нэмэх
        </button>
      </div>

      {created && (
        <div className="mb-u-md p-4 rounded-lg bg-surface-container-lowest border border-outline-variant">
          <p className="font-label-md text-label-md text-primary mb-1">Байгууллагын акаунт үүслээ.</p>
          <p className="text-label-sm text-secondary">
            Нэвтрэх имэйл: <span className="font-medium text-on-surface">{created.email}</span>
          </p>
          <p className="text-label-sm text-secondary">
            Түр нууц үг: <span className="font-medium text-on-surface">{created.password}</span>
          </p>
          <p className="text-label-sm text-secondary mt-1">Энэ мэдээллийг байгууллагад дамжуулна уу — дахин харагдахгүй.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-u-md">
          <div className="bg-surface-container-lowest rounded-lg p-u-lg w-full max-w-md">
            <h2 className="font-headline-md text-headline-md text-primary mb-u-sm">Шинэ байгууллага</h2>
            <form onSubmit={handleSubmit} className="space-y-u-sm">
              {error && <div className="p-3 rounded bg-error-container text-on-error-container text-label-sm">{error}</div>}
              <Field label="Байгууллагын нэр">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
              </Field>
              <Field label="Холбоо барих утас">
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
              </Field>
              <Field label="Холбоо барих имэйл">
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
              </Field>
              <Field label="Нэвтрэх имэйл">
                <input
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
              </Field>
              <Field label="Нэвтрэх нууц үг">
                <input
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
              </Field>
              <div className="flex gap-u-sm pt-u-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                  className="py-2 px-4 rounded-full font-label-sm text-label-sm border border-outline-variant text-secondary hover:bg-surface-container-low transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-on-primary py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? "Хадгалж байна..." : "Байгууллага үүсгэх"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="item-card-shadow bg-surface-container-lowest rounded-lg divide-y divide-outline-variant">
        {companies.length === 0 ? (
          <p className="text-secondary text-label-sm p-u-md">Байгууллага алга.</p>
        ) : (
          companies.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-u-md">
              <div className="flex items-center gap-u-sm">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface-container-low text-secondary">
                  <MaterialIcon name="domain" className="text-base" />
                </div>
                <div>
                  <p className="font-label-md text-label-md">{c.name}</p>
                  <p className="text-label-sm text-secondary">
                    {c.contactPhone || "—"} {c.contactEmail ? `· ${c.contactEmail}` : ""}
                  </p>
                </div>
              </div>
              <span
                className={`text-label-sm px-3 py-1 rounded-full ${
                  c.isActive ? "bg-primary-container text-on-primary-container" : "bg-error-container text-on-error-container"
                }`}
              >
                {c.isActive ? "Идэвхтэй" : "Идэвхгүй"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
