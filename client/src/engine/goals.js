// Savings goals.
//
// The "next step" for each goal is arithmetic, not a guess: we work out what
// she has spare each month from what she actually entered, then say what that
// means for this goal. Numbers a woman is going to act on should be computed,
// not invented.

import { sum, byMonth } from "../lib/format.js";

// Her average monthly surplus, from her own records.
export function monthlySurplus(record) {
  const inc = byMonth(record.income || []);
  const exp = byMonth(record.expenses || []);
  if (!inc.length) return null;

  const months = new Set([...inc.map((m) => m.key), ...exp.map((m) => m.key)]);
  const totalIn = sum(record.income || []);
  const totalOut = sum(record.expenses || []);
  return Math.round((totalIn - totalOut) / months.size);
}

function monthsUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  if (isNaN(target)) return null;
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return months;
}

// on-track / needs-attention / done / overdue
export function goalStatus(goal, record) {
  const target = Number(goal.target) || 0;
  const saved = Number(goal.saved) || 0;
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const remaining = Math.max(0, target - saved);
  const months = monthsUntil(goal.deadline);
  const surplus = monthlySurplus(record);

  // How much she must set aside each month to finish on time.
  const needPerMonth = months && months > 0 ? Math.ceil(remaining / months) : null;

  let state;
  if (remaining === 0) state = "done";
  else if (months === null) state = "ontrack";
  else if (months < 0) state = "overdue";
  else if (needPerMonth !== null && surplus !== null && needPerMonth > surplus) state = "attention";
  else state = "ontrack";

  return { pct, remaining, months, needPerMonth, surplus, state };
}

// The suggested next step. Every branch returns a translation key plus the
// numbers to drop into it, so this works in all five languages.
export function nextStep(goal, record) {
  const { remaining, months, needPerMonth, surplus, state } = goalStatus(goal, record);

  if (state === "done") return { key: "goalStepDone" };

  if (state === "overdue") {
    return { key: "goalStepOverdue", vals: [remaining] };
  }

  if (surplus === null) {
    return { key: "goalStepNoData" };
  }

  if (needPerMonth === null) {
    // No deadline set. Tell her how long it takes at her current rate.
    if (surplus <= 0) return { key: "goalStepNoSurplus" };
    const m = Math.ceil(remaining / surplus);
    return { key: "goalStepNoDeadline", vals: [m] };
  }

  if (needPerMonth > surplus) {
    // She cannot reach it at her current rate. Say by how much, and what a
    // realistic date would be — a shortfall with no way forward is not advice.
    const shortfall = needPerMonth - surplus;
    const realistic = surplus > 0 ? Math.ceil(remaining / surplus) : null;
    return realistic
      ? { key: "goalStepShort", vals: [needPerMonth, shortfall, realistic] }
      : { key: "goalStepNoSurplus" };
  }

  // Comfortably on track.
  const weekly = Math.ceil(needPerMonth / 4);
  return { key: "goalStepOnTrack", vals: [needPerMonth, weekly] };
}

export const GOAL_PRESETS = [
  { id: "buffer", icon: "🛡️", key: "goalPresetBuffer", months: 12 },
  { id: "stock", icon: "📦", key: "goalPresetStock", months: 6 },
  { id: "equipment", icon: "⚙️", key: "goalPresetEquipment", months: 18 },
  { id: "debt", icon: "🏦", key: "goalPresetDebt", months: 12 },
  { id: "school", icon: "🎒", key: "goalPresetSchool", months: 12 },
  { id: "custom", icon: "✏️", key: "goalPresetCustom", months: 12 }
];
