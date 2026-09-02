import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useApp } from "../context/AppContext.jsx";
import { Amount, ChoiceGrid, Field, Modal, Stat, Empty, SpeakButton } from "../components/ui.jsx";
import { EXPENSE_CATEGORIES, INCOME_SOURCES, ASSET_TYPES, localise, labelOf } from "../data/schemes.js";
import { byMonth, sum, thisMonth, todayISO, rupees } from "../lib/format.js";

export default function MoneyMap() {
  const { t, lang, record, addEntry, removeEntry } = useApp();
  const [form, setForm] = useState(null);

  const income = record.income || [];
  const expenses = record.expenses || [];
  const assets = record.assets || [];

  const monthIncome = sum(thisMonth(income));
  const monthExpense = sum(thisMonth(expenses));
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : null;
  const myAssets = sum(assets.filter((a) => a.ownedBy === "mine"));

  // Merge income and expenses into one month-by-month series for the chart.
  const chartData = useMemo(() => {
    const inc = byMonth(income);
    const exp = byMonth(expenses);
    const keys = [...new Set([...inc.map((m) => m.key), ...exp.map((m) => m.key)])].sort().slice(-6);
    return keys.map((k) => ({
      month: inc.find((m) => m.key === k)?.label || exp.find((m) => m.key === k)?.label || k,
      earned: inc.find((m) => m.key === k)?.total || 0,
      spent: exp.find((m) => m.key === k)?.total || 0
    }));
  }, [income, expenses]);

  const spendByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .map(([cat, amount]) => ({
        cat,
        label: labelOf(EXPENSE_CATEGORIES, cat, lang),
        icon: EXPENSE_CATEGORIES.find((c) => c.value === cat)?.icon || "•",
        amount,
        pct: total ? Math.round((amount / total) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, lang]);

  const recent = useMemo(() => {
    const all = [
      ...income.map((e) => ({ ...e, kind: "income" })),
      ...expenses.map((e) => ({ ...e, kind: "expense" })),
      ...(record.supplierPayments || []).map((e) => ({ ...e, kind: "supplier" }))
    ];
    return all.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);
  }, [income, expenses, record.supplierPayments]);

  // --- financial abuse pattern check ------------------------------------------
  // Rule based and informational only. Never diagnostic.
  const flags = useMemo(() => {
    const out = [];
    if (assets.length >= 3 && assets.every((a) => a.ownedBy !== "mine")) {
      out.push("Nothing you have added is in your name only. It may be worth opening one account or asset in your own name.");
    }
    if (income.length >= 10 && assets.length === 0) {
      out.push("You have recorded earnings but nothing you own. Many women find it useful to start a savings account in their own name.");
    }
    const loanRepay = expenses.filter((e) => e.category === "loan");
    if (loanRepay.length >= 3 && income.length >= 5 && sum(loanRepay) > monthIncome * 0.5) {
      out.push("More than half of what you earn is going to loan repayment. This is a heavy load. It may help to talk to your SHG or a free legal aid centre.");
    }
    return out;
  }, [assets, income, expenses, monthIncome]);

  const nothingYet = income.length === 0 && expenses.length === 0 && assets.length === 0;

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("moneyTitle")}</h1>
          <p className="sub">{t("moneySub")}</p>
        </div>
        <SpeakButton text={`${t("moneyTitle")}. ${t("moneySub")}`} />
      </div>

      {/* The four add buttons are the main thing on this page. */}
      <div className="grid g4">
        <button className="btn" onClick={() => setForm("income")}>➕ {t("addIncome")}</button>
        <button className="btn ghost" onClick={() => setForm("expense")}>➖ {t("addExpense")}</button>
        <button className="btn ghost" onClick={() => setForm("asset")}>📦 {t("addAsset")}</button>
        <button className="btn ghost" onClick={() => setForm("supplier")}>🤝 {t("addSupplier")}</button>
      </div>

      {nothingYet ? (
        <div className="card">
          <Empty icon="👋" text={t("noEntries")} />
        </div>
      ) : (
        <>
          <div className="grid g4">
            <Stat label={t("monthIncome")} value={<Amount value={monthIncome} />} />
            <Stat label={t("monthExpense")} value={<Amount value={monthExpense} />} />
            <Stat
              label={t("savingsRate")}
              value={savingsRate === null ? "—" : `${savingsRate}%`}
              tone={savingsRate === null ? undefined : savingsRate >= 15 ? "pos" : savingsRate >= 0 ? "warn" : "crit"}
              note={
                savingsRate === null
                  ? t("emptyStart")
                  : savingsRate >= 0
                  ? `You keep about ${rupees(monthIncome - monthExpense)} this month`
                  : "You are spending more than you earn this month"
              }
            />
            <Stat
              label={t("myAssets")}
              value={<Amount value={myAssets} />}
              note={`${assets.filter((a) => a.ownedBy === "mine").length} of ${assets.length} in your name`}
            />
          </div>

          {flags.map((text, i) => (
            <div className="banner warn" key={i}>
              <span className="ic" aria-hidden="true">💡</span>
              <div>
                <b>{t("worthLooking")}</b>
                <p style={{ marginTop: 4 }}>{text}</p>
                <p style={{ marginTop: 6, fontSize: "0.85rem", color: "var(--muted)" }}>
                  {t("onlyYouSee")}
                </p>
              </div>
            </div>
          ))}

          <div className="split">
            <div className="card">
              <span className="card-title">{t("incomeVsExpense")}</span>
              {chartData.length === 0 ? (
                <Empty icon="📊" text={t("emptyStart")} />
              ) : (
                <>
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                        <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
                        <YAxis stroke="var(--muted)" fontSize={12} width={54} />
                        <Tooltip
                          formatter={(v) => rupees(v)}
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--line)",
                            borderRadius: 8,
                            color: "var(--ink)"
                          }}
                        />
                        <Legend />
                        <Bar dataKey="earned" name="Earned" fill="var(--accent)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="spent" name="Spent" fill="var(--brass)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* A table under every chart, for screen readers and for
                      anyone who finds numbers easier than pictures. */}
                  <details>
                    <summary style={{ cursor: "pointer", fontSize: "0.85rem", color: "var(--muted)" }}>
                      {t("showAsList")}
                    </summary>
                    <div className="tablewrap">
                      <table className="data">
                        <thead>
                          <tr><th>{t("thMonth")}</th><th className="num">{t("thEarned")}</th><th className="num">{t("thSpent")}</th></tr>
                        </thead>
                        <tbody>
                          {chartData.map((r) => (
                            <tr key={r.month}>
                              <td>{r.month}</td>
                              <td className="num">{rupees(r.earned)}</td>
                              <td className="num">{rupees(r.spent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </>
              )}
            </div>

            <div className="card">
              <span className="card-title">{t("whereMoneyGoes")}</span>
              {spendByCategory.length === 0 ? (
                <Empty icon="🧾" text={t("addMoreEntries")} />
              ) : (
                <div className="tablewrap">
                  <table className="data">
                    <tbody>
                      {spendByCategory.map((c) => (
                        <tr key={c.cat}>
                          <td><span aria-hidden="true">{c.icon}</span> {c.label}</td>
                          <td className="num"><Amount value={c.amount} /></td>
                          <td className="num" style={{ color: "var(--muted)" }}>{c.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <span className="card-title">{t("recent")}</span>
            <div className="tablewrap">
              <table className="data">
                <thead>
                  <tr><th>{t("thWhat")}</th><th>{t("thDay")}</th><th className="num">{t("thAmount")}</th><th /></tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id}>
                      <td>
                        {e.kind === "income" && "💰 "}
                        {e.kind === "expense" && "🧾 "}
                        {e.kind === "supplier" && "🤝 "}
                        {e.note || e.supplier ||
                          (e.category && labelOf(EXPENSE_CATEGORIES, e.category, lang)) ||
                          (e.source && labelOf(INCOME_SOURCES, e.source, lang)) ||
                          "—"}
                      </td>
                      <td>{e.date}</td>
                      <td className="num"><Amount value={e.amount} /></td>
                      <td className="num">
                        <button
                          className="btn ghost sm"
                          onClick={() =>
                            removeEntry(
                              e.kind === "income" ? "income" : e.kind === "expense" ? "expenses" : "supplierPayments",
                              e.id
                            )
                          }
                          aria-label={`${t("delete")} ${e.date}`}
                        >
                          {t("delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {assets.length > 0 && (
            <div className="card">
              <span className="card-title">{t("myAssets")}</span>
              <div className="tablewrap">
                <table className="data">
                  <thead>
                    <tr><th>{t("thWhat")}</th><th className="num">{t("thWorth")}</th><th>{t("thInWhoseName")}</th><th /></tr>
                  </thead>
                  <tbody>
                    {assets.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <span aria-hidden="true">{ASSET_TYPES.find((x) => x.value === a.type)?.icon}</span>{" "}
                          {a.note || labelOf(ASSET_TYPES, a.type, lang)}
                        </td>
                        <td className="num"><Amount value={a.amount} /></td>
                        <td>
                          <span className={`pill ${a.ownedBy === "mine" ? "good" : "warn"}`}>
                            {a.ownedBy === "mine" ? `✓ ${t("ownMine")}` : a.ownedBy === "joint" ? `~ ${t("ownJoint")}` : `! ${t("ownOther")}`}
                          </span>
                        </td>
                        <td className="num">
                          <button className="btn ghost sm" onClick={() => removeEntry("assets", a.id)}>
                            {t("delete")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* key={form} forces a fresh form when the entry type changes, so no
          field is ever left over from a previous entry. */}
      {form && <EntryForm key={form} kind={form} onClose={() => setForm(null)} onSave={addEntry} />}
    </>
  );
}

/* ---------------------------------------------------------------------------
   One form for all four entry types. Voice input on every number field.
   --------------------------------------------------------------------------- */
function EntryForm({ kind, onClose, onSave }) {
  const { t, lang } = useApp();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [choice, setChoice] = useState("");
  const [note, setNote] = useState("");
  const [onTime, setOnTime] = useState(null);
  const [error, setError] = useState("");

  const config = {
    income: { title: t("addIncome"), list: "income", options: localise(INCOME_SOURCES, lang), choiceLabel: t("source"), key: "source" },
    expense: { title: t("addExpense"), list: "expenses", options: localise(EXPENSE_CATEGORIES, lang), choiceLabel: t("category"), key: "category" },
    asset: { title: t("addAsset"), list: "assets", options: localise(ASSET_TYPES, lang), choiceLabel: t("item"), key: "type" },
    supplier: { title: t("addSupplier"), list: "supplierPayments", options: null, choiceLabel: null, key: null }
  }[kind];

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const value = Number(String(amount).replace(/[^\d.]/g, ""));
    if (!value || value <= 0) return setError(t("errAmount"));
    if (config.options && !choice) return setError(t("errChoose"));
    if (kind === "supplier" && !note.trim()) return setError(t("errSupplierName"));
    if (kind === "supplier" && onTime === null) return setError(t("errOnTime"));

    const entry = { amount: value, date, note: note.trim() };
    if (config.key) entry[config.key] = choice;
    if (kind === "supplier") {
      entry.supplier = note.trim();
      entry.onTime = onTime;
    }
    if (kind === "asset") entry.ownedBy = onTime === null ? "mine" : onTime;

    onSave(config.list, entry);
    onClose();
  };

  return (
    <Modal title={config.title} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field
          name="amount"
          label={kind === "asset" ? t("value") : t("amount")}
          value={amount}
          onChange={setAmount}
          inputMode="numeric"
          voice
          numeric
          autoFocus
          placeholder="1400"
        />

        {config.options && (
          <ChoiceGrid
            label={config.choiceLabel}
            options={config.options}
            value={choice}
            onChange={setChoice}
          />
        )}

        {kind === "asset" && (
          <ChoiceGrid
            label={t("ownedBy")}
            options={[
              { value: "mine", label: t("ownMine"), icon: "✅" },
              { value: "joint", label: t("ownJoint"), icon: "🤝" },
              { value: "other", label: t("ownOther"), icon: "⚠️" }
            ]}
            value={onTime === null ? "mine" : onTime}
            onChange={setOnTime}
          />
        )}

        {kind === "supplier" && (
          <>
            <Field name="supp" label={t("supplierName")} value={note} onChange={setNote} voice />
            <ChoiceGrid
              label={t("paidOnTime")}
              options={[
                { value: "yes", label: t("yes"), icon: "✅" },
                { value: "no", label: t("no"), icon: "❌" }
              ]}
              value={onTime === null ? "" : onTime ? "yes" : "no"}
              onChange={(v) => setOnTime(v === "yes")}
            />
          </>
        )}

        {kind !== "supplier" && kind !== "asset" && (
          <Field name="note" label={t("note")} value={note} onChange={setNote} voice />
        )}

        {kind === "asset" && (
          <Field name="note" label={t("note")} value={note} onChange={setNote} voice />
        )}

        <div className="field">
          <label htmlFor="date">{t("date")}</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
        </div>

        {error && (
          <div className="banner bad">
            <span className="ic" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn ghost" onClick={onClose}>{t("cancel")}</button>
          <button type="submit" className="btn">{t("save")}</button>
        </div>
      </form>
    </Modal>
  );
}
