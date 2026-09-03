import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { readDB, writeDB, blankRecord } from "../db.js";
import { demoList } from "../demo.js";

const router = express.Router();

// GET /api/auth/demo — the sample accounts offered on the login screen.
router.get("/demo", (req, res) => res.json({ demos: demoList() }));

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const TOKEN_LIFE = "7d";

// Slows down anyone trying to guess a PIN by brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many attempts. Please wait 15 minutes and try again." }
});

function normalisePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function signToken(user) {
  return jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: TOKEN_LIFE });
}

// POST /api/auth/signup  { name, phone, pin }
router.post("/signup", authLimiter, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalisePhone(req.body.phone);
  const pin = String(req.body.pin || "");

  if (name.length < 2) {
    return res.status(400).json({ error: "Please type your name." });
  }
  if (phone.length !== 10) {
    return res.status(400).json({ error: "Please type a 10 digit mobile number." });
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return res.status(400).json({ error: "Your PIN must be 4 to 6 numbers." });
  }

  const db = readDB();
  if (db.users.some((u) => u.phone === phone)) {
    return res.status(409).json({ error: "This number already has an account. Please log in." });
  }

  const passwordHash = await bcrypt.hash(pin, 10);
  const user = {
    id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    phone,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  db.records[user.id] = blankRecord();
  writeDB(db);

  res.json({ token: signToken(user), user: { id: user.id, name: user.name, phone: user.phone } });
});

// POST /api/auth/login  { phone, pin }
router.post("/login", authLimiter, async (req, res) => {
  const phone = normalisePhone(req.body.phone);
  const pin = String(req.body.pin || "");

  const db = readDB();
  const user = db.users.find((u) => u.phone === phone);

  // Same message for "no such user" and "wrong PIN" so an attacker cannot
  // work out which numbers are registered.
  const fail = () => res.status(401).json({ error: "Wrong mobile number or PIN. Please try again." });

  if (!user) return fail();
  const ok = await bcrypt.compare(pin, user.passwordHash);
  if (!ok) return fail();

  res.json({ token: signToken(user), user: { id: user.id, name: user.name, phone: user.phone } });
});

// Middleware used by the other routes.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Please log in again." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Your session ended. Please log in again." });
  }
}

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: "Please log in again." });
  res.json({ user: { id: user.id, name: user.name, phone: user.phone } });
});

export default router;
