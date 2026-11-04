/** 185000000 -> "₹18.5 Cr", 4500000 -> "₹45 L", otherwise Indian digit grouping. */
export function formatPrice(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '';
  const trim = (x) => String(Number(x.toFixed(2)));
  if (num >= 1e7) return `₹${trim(num / 1e7)} Cr`;
  if (num >= 1e5) return `₹${trim(num / 1e5)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export const formatNumber = (n) => Number(n).toLocaleString('en-IN');

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
