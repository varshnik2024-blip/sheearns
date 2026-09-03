// What-If simulator and the "can I afford this?" check.
//
// Everything here is arithmetic on numbers she entered. No estimates dressed
// up as predictions. Where a figure cannot honestly be produced, the function
// says so rather than inventing one.

import { sum, byMonth } from "../lib/format.js";

const EMERGENCY_MONTHS = 3; // what counts as a safe cushion

/* -------------------------------------------------------------------------
   Baseline: her actual monthly position.
   ------------------------------------------------------------------------- */
export function baseline(record) {
  const income = record.income || [];
  const expenses = record.expenses || [];
  const inc = byMonth(income);
  const exp = byMonth(expenses);

  if (!inc.length) return null;

  const months = new Set([...inc.map((m) => m.key), ...exp.map((m) => m.key)]).size;
  const monthlyIncome = Math.round(sum(income) / months);
  const monthlyExpense = Math.round(sum(expenses) / months);

  // Money she can actually reach quickly: savings-type assets in her own name,
  // plus what she has already put aside in goals.
  const savingsAssets = sum(
    (record.assets || []).filter((a) => a.type === "savings" && a.ownedBy === "mine")
  );
  const inGoals = (record.goals || []).reduce((a, g) => a + (Number(g.saved) || 0), 0);
  const reserves = savingsAssets + inGoals;

  // Loan repayments she is already committed to.
  const loanPerMonth = Math.round(
    sum((record.expenses || []).filter((e) => e.category === "loan")) / months
  );

  return {
    months,
    monthlyIncome,
    monthlyExpense,
    surplus: monthlyIncome - monthlyExpense,
    reserves,
    loanPerMonth,
    runwayMonths: monthlyExpense > 0 ? +(reserves / monthlyExpense).toFixed(1) : null
  };
}

/* -------------------------------------------------------------------------
   Financial health, 0-100.

   Deliberately NOT the credit score. The credit score is built from her
   trading record, and saving more money does not change how many days she
   worked. This measures something different — how sturdy her position is —
   and it does respond to every slider, so the simulator can move it honestly.
   ------------------------------------------------------------------------- */
export function financialHealth(state) {
  const { monthlyIncome, monthlyExpense, surplus, reserves, loanPerMonth } = state;
  if (!monthlyIncome) return 0;

  // 45 points: what share of income she keeps. Full marks at 40% — a rate a
  // 3-month target alone would have let almost everyone max out, which made
  // the whole measure stop responding.
  const savingsRate = surplus / monthlyIncome;
  const savingsPts = Math.max(0, Math.min(45, Math.round((savingsRate / 0.4) * 45)));

  // 35 points: how many months she could survive with no income. Six months
  // is full marks; three is the minimum we treat as safe elsewhere.
  const runway = monthlyExpense > 0 ? reserves / monthlyExpense : 0;
  const runwayPts = Math.max(0, Math.min(35, Math.round((runway / (EMERGENCY_MONTHS * 2)) * 35)));

  // 20 points: how heavy her loan repayments are. Above 40% of income is bad.
  const debtRatio = monthlyIncome > 0 ? loanPerMonth / monthlyIncome : 0;
  const debtPts = Math.max(0, Math.min(20, Math.round((1 - debtRatio / 0.4) * 20)));

  return Math.max(0, Math.min(100, savingsPts + runwayPts + debtPts));
}

/* -------------------------------------------------------------------------
   Apply the sliders.
   ------------------------------------------------------------------------- */
export function simulate(record, changes) {
  const base = baseline(record);
  if (!base) return null;

  // "Save this much more" means money she frees up by spending less on things
  // she chooses to. It has to come from somewhere, so it behaves exactly like
  // cutting an expense. Treating it as an independent lever would let the
  // simulator conjure savings out of nothing.
  const extraSaving = Number(changes.extraSaving) || 0;
  const revenueChange = Number(changes.revenue) || 0;
  const expenseChange = Number(changes.expense) || 0; // negative = cutting costs
  const debtPrepay = Number(changes.debtPrepay) || 0;

  const after = {
    monthlyIncome: base.monthlyIncome + revenueChange,
    monthlyExpense: Math.max(0, base.monthlyExpense + expenseChange - extraSaving)
  };
  after.surplus = after.monthlyIncome - after.monthlyExpense;

  // Paying extra off a loan uses up spare money, so it competes with saving.
  // She cannot prepay more than she has spare.
  const overreach = Math.max(0, debtPrepay - Math.max(0, after.surplus));
  const actualPrepay = Math.min(debtPrepay, Math.max(0, after.surplus));
  const putAside = Math.max(0, after.surplus - actualPrepay);

  after.loanPerMonth = Math.max(0, base.loanPerMonth - actualPrepay);

  // Both sides are projected the same distance ahead, so the comparison is
  // like for like. Comparing today's reserves against next year's would show
  // an improvement even when nothing has been changed.
  const savedNow = Math.max(0, base.surplus);
  const reservesBefore = base.reserves + savedNow * 12;
  after.reserves = base.reserves + putAside * 12;

  const projectedBefore = {
    ...base,
    reserves: reservesBefore
  };

  after.runwayMonths =
    after.monthlyExpense > 0 ? +(after.reserves / after.monthlyExpense).toFixed(1) : null;
  const runwayBefore =
    base.monthlyExpense > 0 ? +(reservesBefore / base.monthlyExpense).toFixed(1) : null;

  const beforeHealth = financialHealth(projectedBefore);
  const afterHealth = financialHealth(after);

  return {
    base,
    after,
    putAside,
    overreach,
    savedIn12Months: putAside * 12,
    extraVsToday: (putAside - savedNow) * 12,
    health: { before: beforeHealth, after: afterHealth, delta: afterHealth - beforeHealth },
    runway: { before: runwayBefore, after: after.runwayMonths }
  };
}

/* -------------------------------------------------------------------------
   What the sliders do to her nearest goal.
   ------------------------------------------------------------------------- */
export function goalImpact(record, result) {
  const goals = record.goals || [];
  if (!goals.length || !result) return null;

  // The goal she is closest to finishing.
  const goal = [...goals]
    .filter((g) => (Number(g.saved) || 0) < (Number(g.target) || 0))
    .sort(
      (a, b) =>
        (Number(a.target) - Number(a.saved)) - (Number(b.target) - Number(b.saved))
    )[0];

  if (!goal) return null;

  const remaining = Number(goal.target) - Number(goal.saved || 0);
  const rateBefore = Math.max(0, result.base.surplus);
  const rateAfter = Math.max(0, result.putAside);

  return {
    goal,
    remaining,
    monthsBefore: rateBefore > 0 ? Math.ceil(remaining / rateBefore) : null,
    monthsAfter: rateAfter > 0 ? Math.ceil(remaining / rateAfter) : null
  };
}

/* -------------------------------------------------------------------------
   "Can I afford this?"
   ------------------------------------------------------------------------- */
export function affordability(record, cost) {
  const base = baseline(record);
  if (!base) return { verdict: "nodata" };

  const price = Number(cost) || 0;
  if (price <= 0) return { verdict: "nodata" };

  const safetyNet = base.monthlyExpense * EMERGENCY_MONTHS;
  const spare = base.reserves - safetyNet; // reserves above her cushion
  const leftAfter = base.reserves - price;
  const runwayAfter = base.monthlyExpense > 0
    ? +(Math.max(0, leftAfter) / base.monthlyExpense).toFixed(1)
    : null;

  // Months of saving needed to buy it without touching the cushion.
  const monthsToSave = base.surplus > 0 ? Math.ceil(price / base.surplus) : null;
  const perMonth = monthsToSave ? Math.ceil(price / monthsToSave) : null;

  let verdict;
  if (price <= base.surplus) verdict = "easy";           // one month's spare covers it
  else if (price <= spare) verdict = "yes";              // cushion stays intact
  else if (price <= base.reserves) verdict = "caution";  // eats into the cushion
  else verdict = "no";                                   // more than she has

  return {
    verdict,
    price,
    reserves: base.reserves,
    safetyNet,
    leftAfter: Math.max(0, leftAfter),
    shortfall: Math.max(0, price - base.reserves),
    runwayAfter,
    monthsToSave,
    perMonth,
    surplus: base.surplus
  };
}
