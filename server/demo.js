// Demo accounts, for showing the app without typing data first.
//
// These are REAL accounts with fixed phone numbers and PINs, created once on
// startup. That is deliberate: a demo persona is a separate login, so nobody's
// own data is ever touched, overwritten, or mixed with sample figures.
//
// Every screen labels these as examples. They exist to demonstrate, not to
// pretend the app comes pre-filled.

import bcrypt from "bcryptjs";
import { readDB, writeDB, blankRecord } from "./db.js";

const DEMO_PIN = "1234";

// Builds a realistic year of trading: seasonal, uneven, with the occasional
// bad month. Flat invented numbers would make the score meaningless.
function tradingYear({ base, swing, daysPerMonth, seed }) {
  const rows = [];
  const now = new Date();
  let n = seed;
  const rand = () => {
    n = (n * 1103515245 + 12345) % 2147483648;
    return n / 2147483648;
  };

  for (let back = 11; back >= 0; back--) {
    const month = new Date(now.getFullYear(), now.getMonth() - back, 1);
    // Festival months (Oct/Nov) earn more; monsoon (Jun/Jul) earns less.
    const m = month.getMonth();
    const season = m === 9 || m === 10 ? 1.35 : m === 5 || m === 6 ? 0.7 : 1;

    for (let d = 0; d < daysPerMonth; d++) {
      const day = new Date(month.getFullYear(), month.getMonth(), 1 + Math.floor(d * (28 / daysPerMonth)));
      if (day > now) continue;
      rows.push({
        id: `d${back}_${d}_${seed}`,
        amount: Math.round((base + (rand() - 0.5) * swing) * season),
        date: day.toISOString().slice(0, 10),
        source: "sales",
        note: ""
      });
    }
  }
  return rows;
}

function expenses(income, ratio, categories, seed) {
  const byMonth = {};
  income.forEach((e) => {
    const k = e.date.slice(0, 7);
    byMonth[k] = (byMonth[k] || 0) + e.amount;
  });
  const rows = [];
  Object.entries(byMonth).forEach(([month, total], i) => {
    categories.forEach((c, j) => {
      rows.push({
        id: `e${i}_${j}_${seed}`,
        amount: Math.round(total * ratio * c.share),
        date: `${month}-${String(5 + j * 4).padStart(2, "0")}`,
        category: c.category,
        note: ""
      });
    });
  });
  return rows;
}

function supplierRun(count, lateCount, seed) {
  return Array.from({ length: count }, (_, i) => ({
    id: `s${i}_${seed}`,
    supplier: "supplier",
    amount: 2000,
    date: new Date(Date.now() - i * 26 * 86400000).toISOString().slice(0, 10),
    onTime: i >= lateCount
  }));
}

const STANDARD_EXPENSES = [
  { category: "stock", share: 0.55 },
  { category: "household", share: 0.25 },
  { category: "rent", share: 0.12 },
  { category: "transport", share: 0.08 }
];

function futureDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export const DEMO_PERSONAS = [
  {
    phone: "9000000001",
    name: "Lakshmi",
    label: "Vegetable seller, 4 years in an SHG",
    build: () => {
      const income = tradingYear({ base: 620, swing: 260, daysPerMonth: 18, seed: 11 });
      return {
        profile: {
          businessType: "vegetables",
          businessName: "Lakshmi Vegetables",
          yearsRunning: 4,
          shgMember: true,
          shgYears: 4,
          shgMissedPayments: 0,
          completedOnboarding: true
        },
        income,
        expenses: expenses(income, 0.74, STANDARD_EXPENSES, 11),
        assets: [
          { id: "a1", type: "vehicle", amount: 14000, ownedBy: "mine", note: "Push cart", date: futureDate(-20) },
          { id: "a2", type: "gold", amount: 32000, ownedBy: "joint", note: "", date: futureDate(-30) }
        ],
        supplierPayments: supplierRun(14, 2, 11),
        goals: [
          { id: "g1", icon: "🛡️", title: "Emergency buffer for 3 months", target: 30000, saved: 16500, deadline: futureDate(8) },
          { id: "g2", icon: "📦", title: "Second cart and stock", target: 55000, saved: 9000, deadline: futureDate(10) }
        ],
        lessons: { completed: ["lesson-1", "lesson-2", "lesson-3"], quizScore: 67, quizAnswers: {} }
      };
    }
  },
  {
    phone: "9000000002",
    name: "Fatima",
    label: "Tailor, strong record, ready to scale",
    build: () => {
      const income = tradingYear({ base: 1150, swing: 200, daysPerMonth: 22, seed: 23 });
      return {
        profile: {
          businessType: "tailoring",
          businessName: "Fatima Tailors",
          yearsRunning: 6,
          shgMember: true,
          shgYears: 6,
          shgMissedPayments: 0,
          completedOnboarding: true
        },
        income,
        expenses: expenses(income, 0.62, STANDARD_EXPENSES, 23),
        assets: [
          { id: "a1", type: "equipment", amount: 46000, ownedBy: "mine", note: "Two sewing machines", date: futureDate(-40) },
          { id: "a2", type: "savings", amount: 38000, ownedBy: "mine", note: "", date: futureDate(-6) }
        ],
        supplierPayments: supplierRun(20, 0, 23),
        goals: [
          { id: "g1", icon: "⚙️", title: "Buy an embroidery machine", target: 120000, saved: 74000, deadline: futureDate(9) },
          { id: "g2", icon: "🎒", title: "Daughter's college fees", target: 60000, saved: 41000, deadline: futureDate(14) }
        ],
        lessons: {
          completed: ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5", "lesson-6"],
          quizScore: 100,
          quizAnswers: {}
        }
      };
    }
  },
  {
    phone: "9000000003",
    name: "Sunita",
    label: "Just starting out, nothing in her name",
    build: () => {
      const income = tradingYear({ base: 430, swing: 380, daysPerMonth: 9, seed: 37 }).slice(-26);
      return {
        profile: {
          businessType: "snacks",
          businessName: "",
          yearsRunning: 1,
          shgMember: false,
          shgYears: 0,
          shgMissedPayments: 0,
          completedOnboarding: true
        },
        income,
        expenses: expenses(income, 0.88, STANDARD_EXPENSES, 37),
        assets: [
          { id: "a1", type: "land", amount: 240000, ownedBy: "other", note: "House, in husband's name", date: futureDate(-50) }
        ],
        supplierPayments: supplierRun(4, 2, 37),
        goals: [
          { id: "g1", icon: "🛡️", title: "First ₹5,000 of savings", target: 5000, saved: 900, deadline: futureDate(6) }
        ],
        lessons: { completed: [], quizScore: null, quizAnswers: {} }
      };
    }
  }
];

// Creates any demo account that does not exist yet, and always refreshes the
// data so the dates stay recent however long the app has been deployed.
export async function seedDemoAccounts() {
  const db = readDB();
  const passwordHash = await bcrypt.hash(DEMO_PIN, 10);
  let created = 0;

  for (const persona of DEMO_PERSONAS) {
    let user = db.users.find((u) => u.phone === persona.phone);

    if (!user) {
      user = {
        id: `demo_${persona.phone}`,
        name: persona.name,
        phone: persona.phone,
        passwordHash,
        isDemo: true,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      created++;
    }

    db.records[user.id] = {
      ...blankRecord(),
      ...persona.build(),
      settings: { language: "en", fontSize: "md", contrast: "normal", discreet: false }
    };
  }

  writeDB(db);
  return { created, total: DEMO_PERSONAS.length };
}

// What the login screen needs in order to offer the buttons. The PIN is
// included because these are public sample accounts by design.
export function demoList() {
  return DEMO_PERSONAS.map((p) => ({
    phone: p.phone,
    name: p.name,
    label: p.label,
    pin: DEMO_PIN
  }));
}
