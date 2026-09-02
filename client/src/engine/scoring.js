// The credit readiness engine.
//
// This is a pure function: the same data always produces the same score, and
// you can read every step of it. That is deliberate. A woman should be able to
// see exactly why she got the number she got.
//
// It runs on data SHE entered. Nothing is assumed and nothing is pre-filled.

export const FACTORS = [
  {
    id: "supplier",
    weight: 0.24,
    labelKey: "factorSupplier",
    plainKey: "factorSupplierPlain"
  },
  {
    id: "deposits",
    weight: 0.21,
    labelKey: "factorDeposits",
    plainKey: "factorDepositsPlain"
  },
  {
    id: "shg",
    weight: 0.2,
    labelKey: "factorShg",
    plainKey: "factorShgPlain"
  },
  {
    id: "activity",
    weight: 0.15,
    labelKey: "factorActivity",
    plainKey: "factorActivityPlain"
  },
  {
    id: "stability",
    weight: 0.12,
    labelKey: "factorStability",
    plainKey: "factorStabilityPlain"
  },
  {
    id: "literacy",
    weight: 0.08,
    labelKey: "factorLiteracy",
    plainKey: "factorLiteracyPlain"
  }
];

const MIN_SCORE = 300;
const MAX_SCORE = 900;
const RANGE = MAX_SCORE - MIN_SCORE;
const NEUTRAL = 0.5; // a factor at 0.5 contributes nothing either way

const clamp01 = (n) => Math.max(0, Math.min(1, n));

function monthKey(dateStr) {
  return String(dateStr || "").slice(0, 7); // "2026-09"
}

// --- individual factor calculations -----------------------------------------

function supplierFactor(payments) {
  if (!payments.length) return { value: NEUTRAL, detail: { key: "detNoSupplier" } };

  const onTime = payments.filter((p) => p.onTime).length;

  // Smoothing. A raw ratio would treat "0 of 1" as badly as "0 of 40", which is
  // not fair and not statistically sound. We add the equivalent of 4 neutral
  // payments, so a small number of records pulls the value only gently away
  // from the middle. The more real history she has, the more it counts.
  const PRIOR = 4;
  const smoothed = (onTime + PRIOR * NEUTRAL) / (payments.length + PRIOR);

  return {
    value: clamp01(smoothed),
    detail: {
      key: payments.length < PRIOR ? "detSupplierFew" : "detSupplier",
      vals: [onTime, payments.length]
    }
  };
}

function depositFactor(income) {
  if (!income.length) return { value: 0, detail: { key: "detNoIncome" } };
  const months = new Set(income.map((e) => monthKey(e.date)));
  // 6 months of activity is treated as a full mark.
  const value = clamp01(months.size / 6);
  return { value, detail: { key: "detMonths", vals: [months.size] } };
}

function shgFactor(profile) {
  if (!profile.shgMember) {
    return { value: 0.3, detail: { key: "detNoShg" } };
  }
  const years = Number(profile.shgYears) || 0;
  const missed = Number(profile.shgMissedPayments) || 0;
  const tenure = clamp01(years / 5); // 5 years counts as full
  const penalty = clamp01(missed * 0.15);
  const value = clamp01(tenure - penalty);
  return { value, detail: { key: "detShg", vals: [years, missed] } };
}

function activityFactor(income) {
  if (!income.length) return { value: 0, detail: { key: "detNoDays" } };
  const days = new Set(income.map((e) => e.date)).size;
  // 60 recorded working days is treated as a full mark.
  return { value: clamp01(days / 60), detail: { key: "detDays", vals: [days] } };
}

function stabilityFactor(income) {
  const byMonth = {};
  income.forEach((e) => {
    const k = monthKey(e.date);
    byMonth[k] = (byMonth[k] || 0) + Number(e.amount || 0);
  });
  const totals = Object.values(byMonth);

  if (totals.length < 2) {
    return { value: NEUTRAL, detail: { key: "detNeedTwo" } };
  }

  const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
  if (mean === 0) return { value: 0, detail: { key: "detNoEarnings" } };

  const variance = totals.reduce((a, b) => a + (b - mean) ** 2, 0) / totals.length;
  const cv = Math.sqrt(variance) / mean; // coefficient of variation

  // cv of 0 is perfectly steady, cv of 0.6 or more is very up-and-down.
  const value = clamp01(1 - cv / 0.6);
  return { value, detail: { key: "detVary", vals: [Math.round(cv * 100)] } };
}

function literacyFactor(lessons, totalLessons) {
  const done = (lessons.completed || []).length;
  const quiz = lessons.quizScore;
  const lessonPart = totalLessons ? clamp01(done / totalLessons) : 0;
  const quizPart = quiz === null || quiz === undefined ? 0 : clamp01(quiz / 100);
  const value = clamp01(lessonPart * 0.6 + quizPart * 0.4);
  return {
    value,
    detail:
      quiz == null
        ? { key: "detLessons", vals: [done] }
        : { key: "detLessonsQuiz", vals: [done, quiz] }
  };
}

// --- tiers -------------------------------------------------------------------

export function tierFor(score) {
  if (score >= 780) return { level: 4, ceiling: 500000, rate: "11-13%" };
  if (score >= 690) return { level: 3, ceiling: 150000, rate: "13-15%" };
  if (score >= 600) return { level: 2, ceiling: 60000, rate: "14-16%" };
  if (score >= 500) return { level: 1, ceiling: 25000, rate: "16-18%" };
  return { level: 0, ceiling: 0, rate: "-" };
}

// --- the main entry point ----------------------------------------------------

export function calculateScore(record, totalLessons = 6) {
  const income = record.income || [];
  const payments = record.supplierPayments || [];
  const profile = record.profile || {};
  const lessons = record.lessons || { completed: [] };

  // Not enough entered yet to say anything honest.
  const ready = income.length >= 5;

  const raw = {
    supplier: supplierFactor(payments),
    deposits: depositFactor(income),
    shg: shgFactor(profile),
    activity: activityFactor(income),
    stability: stabilityFactor(income),
    literacy: literacyFactor(lessons, totalLessons)
  };

  let total = MIN_SCORE;
  const contributions = FACTORS.map((f) => {
    const { value, detail } = raw[f.id];
    const points = value * f.weight * RANGE;
    total += points;
    // Shown to the user as + or - relative to a neutral middle.
    const relative = Math.round((value - NEUTRAL) * f.weight * RANGE);
    return {
      id: f.id,
      labelKey: f.labelKey,
      plainKey: f.plainKey,
      weight: f.weight,
      value,
      detail,
      points: Math.round(points),
      relative
    };
  });

  const score = Math.round(total);

  return {
    ready,
    entriesNeeded: Math.max(0, 5 - income.length),
    score: ready ? score : null,
    tier: ready ? tierFor(score) : null,
    contributions,
    base: MIN_SCORE
  };
}
