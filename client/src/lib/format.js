// Rupee formatting with Indian digit grouping (1,50,000 not 150,000).
export function rupees(n) {
  const num = Number(n) || 0;
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// Big amounts in words people actually use.
export function rupeesShort(n) {
  const num = Number(n) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} crore`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} lakh`;
  return rupees(num);
}

export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function monthLabel(key) {
  const [y, m] = key.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(m) - 1]} ${String(y).slice(2)}`;
}

// Groups a list of {date, amount} into monthly totals, oldest first.
export function byMonth(entries) {
  const map = {};
  entries.forEach((e) => {
    const k = String(e.date || "").slice(0, 7);
    if (!k) return;
    map[k] = (map[k] || 0) + Number(e.amount || 0);
  });
  return Object.keys(map)
    .sort()
    .map((k) => ({ key: k, label: monthLabel(k), total: map[k] }));
}

export function sum(entries) {
  return entries.reduce((a, e) => a + Number(e.amount || 0), 0);
}

export function thisMonth(entries) {
  const now = new Date().toISOString().slice(0, 7);
  return entries.filter((e) => String(e.date || "").startsWith(now));
}
