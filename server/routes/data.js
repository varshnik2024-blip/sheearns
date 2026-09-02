import express from "express";
import { readDB, writeDB, blankRecord } from "../db.js";
import { requireAuth } from "./auth.js";

const router = express.Router();

// Everything below requires a logged-in user, and only ever touches that
// user's own record. One woman can never see another's data.
router.use(requireAuth);

// GET /api/data  -> this user's whole record
router.get("/", (req, res) => {
  const db = readDB();
  if (!db.records[req.user.id]) {
    db.records[req.user.id] = blankRecord();
    writeDB(db);
  }
  res.json(db.records[req.user.id]);
});

// PUT /api/data  -> replace this user's record
// The client keeps the record in memory and saves the whole thing. Simple,
// and with one user per record there is nothing to merge.
router.put("/", (req, res) => {
  const body = req.body || {};
  const db = readDB();
  const existing = db.records[req.user.id] || blankRecord();

  db.records[req.user.id] = {
    profile: { ...existing.profile, ...(body.profile || {}) },
    income: Array.isArray(body.income) ? body.income : existing.income,
    expenses: Array.isArray(body.expenses) ? body.expenses : existing.expenses,
    assets: Array.isArray(body.assets) ? body.assets : existing.assets,
    supplierPayments: Array.isArray(body.supplierPayments)
      ? body.supplierPayments
      : existing.supplierPayments,
    lessons: { ...existing.lessons, ...(body.lessons || {}) },
    settings: { ...existing.settings, ...(body.settings || {}) }
  };

  writeDB(db);
  res.json(db.records[req.user.id]);
});

// DELETE /api/data  -> erase everything this user entered, keep the account
router.delete("/", (req, res) => {
  const db = readDB();
  db.records[req.user.id] = blankRecord();
  writeDB(db);
  res.json(db.records[req.user.id]);
});

export default router;
