// "If you do this, your score goes up by N points."
//
// Each suggestion is checked by actually re-running the real scoring engine on
// a copy of the user's data with one thing changed. Nothing here is estimated.

import { calculateScore } from "./scoring.js";

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

function addMonths(record, count) {
  const copy = clone(record);
  const income = copy.income || [];
  if (!income.length) return copy;

  const avg = income.reduce((a, e) => a + Number(e.amount || 0), 0) / income.length;
  const latest = income.map((e) => e.date).sort().slice(-1)[0] || new Date().toISOString().slice(0, 10);
  const start = new Date(latest);

  for (let m = 1; m <= count; m++) {
    for (let d = 0; d < 12; d++) {
      const day = new Date(start);
      day.setMonth(day.getMonth() + m);
      day.setDate(1 + d * 2);
      copy.income.push({
        id: `sim_${m}_${d}`,
        amount: Math.round(avg),
        date: day.toISOString().slice(0, 10),
        source: "simulated",
        note: ""
      });
    }
  }
  return copy;
}

function steadyIncome(record) {
  const copy = clone(record);
  const income = copy.income || [];
  if (!income.length) return copy;
  const avg = income.reduce((a, e) => a + Number(e.amount || 0), 0) / income.length;
  copy.income = income.map((e) => ({ ...e, amount: Math.round(avg) }));
  return copy;
}

function allSuppliersOnTime(record) {
  const copy = clone(record);
  const payments = copy.supplierPayments || [];
  if (!payments.length) {
    // Simulate a clean record of 12 on-time payments.
    copy.supplierPayments = Array.from({ length: 12 }, (_, i) => ({
      id: `sim_p_${i}`,
      supplier: "simulated",
      amount: 1000,
      date: new Date().toISOString().slice(0, 10),
      onTime: true
    }));
    return copy;
  }
  copy.supplierPayments = payments.map((p) => ({ ...p, onTime: true }));
  return copy;
}

function finishLessons(record, totalLessons) {
  const copy = clone(record);
  copy.lessons = {
    ...copy.lessons,
    completed: Array.from({ length: totalLessons }, (_, i) => `lesson-${i + 1}`),
    quizScore: Math.max(copy.lessons?.quizScore || 0, 80)
  };
  return copy;
}

function joinSHG(record) {
  const copy = clone(record);
  copy.profile = { ...copy.profile, shgMember: true, shgYears: Math.max(1, copy.profile?.shgYears || 0) };
  return copy;
}

export function buildActions(record, totalLessons = 6) {
  const current = calculateScore(record, totalLessons);
  if (!current.ready) return { current, actions: [], combined: null };

  const candidates = [
    {
      id: "record-3-months",
      titleKey: "cfRecord",
      whyKey: "cfRecordWhy",
      apply: (r) => addMonths(r, 3)
    },
    {
      id: "steady-income",
      titleKey: "cfSteady",
      whyKey: "cfSteadyWhy",
      apply: steadyIncome
    },
    {
      id: "suppliers-on-time",
      titleKey: "cfSuppliers",
      whyKey: "cfSuppliersWhy",
      apply: allSuppliersOnTime
    },
    {
      id: "finish-lessons",
      titleKey: "cfLessons",
      whyKey: "cfLessonsWhy",
      apply: (r) => finishLessons(r, totalLessons)
    },
    {
      id: "join-shg",
      titleKey: "cfShg",
      whyKey: "cfShgWhy",
      apply: joinSHG,
      skipIf: (r) => r.profile?.shgMember
    }
  ];

  const actions = candidates
    .filter((c) => !(c.skipIf && c.skipIf(record)))
    .map((c) => {
      const after = calculateScore(c.apply(record), totalLessons);
      return {
        id: c.id,
        titleKey: c.titleKey,
        whyKey: c.whyKey,
        gain: Math.max(0, (after.score || 0) - current.score)
      };
    })
    .filter((a) => a.gain > 0)
    .sort((a, b) => b.gain - a.gain);

  // Apply everything at once to get the honest combined figure. Gains are not
  // simply additive, so we recompute rather than summing.
  let stacked = clone(record);
  candidates
    .filter((c) => !(c.skipIf && c.skipIf(record)))
    .forEach((c) => {
      stacked = c.apply(stacked);
    });
  const combined = calculateScore(stacked, totalLessons);

  return { current, actions, combined };
}
