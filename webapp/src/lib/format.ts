export function formatMNT(amount: number) {
  return new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 }).format(Math.round(amount)) + "₮";
}

export function formatDateMN(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("mn-MN", { year: "numeric", month: "long", day: "numeric" }).format(d);
}
