// Tiny JSON-file database. No native dependencies, so it installs cleanly on Windows.
// Everything lives in server/data/db.json. Delete that file to reset the app.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");

const EMPTY = { users: [], records: {} };

function ensureFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY, null, 2), "utf8");
  }
}

export function readDB() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return { users: parsed.users || [], records: parsed.records || {} };
  } catch (err) {
    console.error("db.json was unreadable, starting fresh:", err.message);
    return { ...EMPTY };
  }
}

// Writes to a temp file first, then renames. Prevents a half-written db.json
// if the process is killed mid-save.
export function writeDB(data) {
  ensureFile();
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, DB_PATH);
}

// The shape of one user's data. Nothing is pre-filled — the user creates all of it.
export function blankRecord() {
  return {
    profile: {
      businessType: "",
      businessName: "",
      yearsRunning: null,
      shgMember: false,
      shgYears: 0,
      shgMissedPayments: 0,
      completedOnboarding: false
    },
    income: [],
    expenses: [],
    assets: [],
    supplierPayments: [],
    lessons: { completed: [], quizScore: null, quizAnswers: {} },
    settings: { language: "en", fontSize: "md", contrast: "normal", discreet: false }
  };
}
