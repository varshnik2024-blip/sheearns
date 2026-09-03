import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { baseline, simulate, goalImpact, affordability } from "../engine/simulator.js";
import { Amount, Field, Modal, Empty, SpeakButton } from "../components/ui.jsx";
import { rupees } from "../lib/format.js";

const ZERO = { extraSaving: 0, revenue: 0, expense: 0, debtPrepay: 0 };

export default function Future() {
  const { t, record } = useApp();
  const [tab, setTab] = useState("simulator");
  const base = baseline(record);

  if (!base) {
    return (
      <>
        <div className="pagehead">
          <div>
            <h1>{t("futureTitle")}</h1>
            <p className="sub">{t("futureSub")}</p>
          </div>
        </div>
        <div className="card">
          <Empty icon="🔮" text={t("futureNoData")} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("futureTitle")}</h1>
          <p className="sub">{t("futureSub")}</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "simulator"}
          className={`tab${tab === "simulator" ? " on" : ""}`}
          onClick={() => setTab("simulator")}
        >
          🎚️ {t("tabSimulator")}
        </button>
        <button
          role="tab"
          aria-selected={tab === "afford"}
          className={`tab${tab === "afford" ? " on" : ""}`}
          onClick={() => setTab("afford")}
        >
          🛒 {t("tabAfford")}
        </button>
      </div>

      {tab === "simulator" ? <Simulator base={base} /> : <Afford base={base} />}
    </>
  );
}

/* ==========================================================================
   What-If simulator
   ========================================================================== */
function Simulator({ base }) {
  const { t, record } = useApp();
  const [changes, setChanges] = useState(ZERO);

  const result = useMemo(() => simulate(record, changes), [record, changes]);
  const impact = useMemo(() => goalImpact(record, result), [record, result]);

  const set = (k, v) => setChanges((c) => ({ ...c, [k]: Number(v) }));
  const touched = Object.values(changes).some((v) => v !== 0);

  // Slider ranges scale to her actual income, so a woman earning ₹8,000
  // and one earning ₹80,000 both get a useful range.
  const step = Math.max(100, Math.round(base.monthlyIncome / 40 / 100) * 100);
  const maxSave = Math.max(step * 10, Math.round(base.monthlyIncome * 0.5));
  const maxRev = Math.max(step * 10, Math.round(base.monthlyIncome * 0.5));
  const maxExp = Math.max(step * 6, Math.round(base.monthlyExpense * 0.3));

  const presets = [
    { key: "presetSaveMore", apply: { ...ZERO, extraSaving: Math.round(maxSave * 0.3) } },
    { key: "presetRevenueUp", apply: { ...ZERO, revenue: Math.round(base.monthlyIncome * 0.2) } },
    { key: "presetCutCosts", apply: { ...ZERO, expense: -Math.round(maxExp * 0.5) } },
    { key: "presetPayDebt", apply: { ...ZERO, debtPrepay: Math.round(step * 3) } }
  ];

  const spoken =
    `${t("simResultTitle")}. ${t("simHealth")}: ${result.health.after}. ` +
    (impact?.monthsAfter ? `${t("simGoalDate")}: ${impact.monthsAfter} ${t("simMonths")}.` : "");

  return (
    <>
      <div className="row" style={{ gap: 8 }}>
        {presets.map((p) => (
          <button key={p.key} className="btn ghost sm" onClick={() => setChanges(p.apply)}>
            {t(p.key)}
          </button>
        ))}
        {touched && (
          <button className="btn ghost sm" onClick={() => setChanges(ZERO)}>
            ↻ {t("simReset")}
          </button>
        )}
      </div>

      <div className="split">
        {/* ---------------- sliders ---------------- */}
        <div className="card" style={{ gap: 20 }}>
          <Slider
            label={t("simExtraSaving")}
            value={changes.extraSaving}
            onChange={(v) => set("extraSaving", v)}
            min={0}
            max={maxSave}
            step={step}
            leftNote={`${t("simBaseline")}: ${rupees(Math.max(0, base.surplus))}`}
            rightNote={`+${rupees(maxSave)}`}
          />
          <Slider
            label={t("simRevenue")}
            value={changes.revenue}
            onChange={(v) => set("revenue", v)}
            min={-Math.round(maxRev / 2)}
            max={maxRev}
            step={step}
            leftNote={`−${rupees(Math.round(maxRev / 2))}`}
            rightNote={`${t("simBaseline")}: ${rupees(base.monthlyIncome)}`}
          />
          <Slider
            label={t("simExpense")}
            value={changes.expense}
            onChange={(v) => set("expense", v)}
            min={-maxExp}
            max={maxExp}
            step={step}
            leftNote={`−${rupees(maxExp)} (${t("simCut")})`}
            rightNote={`${t("simBaseline")}: ${rupees(base.monthlyExpense)}`}
          />
          <Slider
            label={t("simDebtPrepay")}
            value={changes.debtPrepay}
            onChange={(v) => set("debtPrepay", v)}
            min={0}
            max={Math.max(step * 6, base.loanPerMonth * 2 || step * 6)}
            step={step}
            leftNote="₹0"
            rightNote={`${t("simLoanNow")}: ${rupees(base.loanPerMonth)}`}
          />
        </div>

        {/* ---------------- consequences ---------------- */}
        <div className="card sim-result" style={{ gap: 14 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="card-title">✦ {t("simResultTitle")}</span>
            <SpeakButton text={spoken} />
          </div>

          {impact && (
            <div className="sim-headline">
              <span className="stat-label">{t("simGoalDate")} — {impact.goal.title}</span>
              <div className="row" style={{ gap: 10, alignItems: "baseline" }}>
                {impact.monthsBefore && impact.monthsAfter && impact.monthsAfter < impact.monthsBefore && (
                  <s style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
                    {impact.monthsBefore} {t("simMonths")}
                  </s>
                )}
                <span className="sim-big">
                  {impact.monthsAfter ? `${impact.monthsAfter} ${t("simMonths")}` : "—"}
                </span>
              </div>
              {impact.monthsBefore && impact.monthsAfter && impact.monthsAfter < impact.monthsBefore && (
                <span className="pill good">
                  ⚡ {t("simEarlier", [impact.monthsBefore - impact.monthsAfter])}
                </span>
              )}
              {!impact.monthsAfter && (
                <span className="pill warn">! {t("simNoProgress")}</span>
              )}
            </div>
          )}

          <div className="grid g2">
            <MiniStat label={t("sim12Savings")} value={<Amount value={result.savedIn12Months} />} />
            <MiniStat
              label={t("simRunway")}
              value={result.runway.after === null ? "—" : `${result.runway.after} ${t("simMonths")}`}
              delta={
                result.runway.before !== null && result.runway.after !== null
                  ? +(result.runway.after - result.runway.before).toFixed(1)
                  : null
              }
            />
            <MiniStat
              label={t("simHealth")}
              value={`${result.health.after}`}
              delta={result.health.delta}
            />
            <MiniStat label={t("simMonthlySpare")} value={<Amount value={result.after.surplus} />} />
          </div>

          {result.overreach > 0 && (
            <div className="banner warn">
              <span className="ic" aria-hidden="true">⚠</span>
              <span>{t("simOverreach", [rupees(result.overreach)])}</span>
            </div>
          )}

          <div className="sim-note">
            <span className="step-label">✦ {t("simWhatThisMeans")}</span>
            {touched
              ? t("simExplain", [
                  rupees(result.putAside),
                  rupees(result.savedIn12Months),
                  result.health.delta >= 0 ? `+${result.health.delta}` : `${result.health.delta}`
                ])
              : t("simMoveSliders")}
          </div>

          <p className="card-hint">{t("simScoreNote")}</p>
        </div>
      </div>
    </>
  );
}

function Slider({ label, value, onChange, min, max, step, leftNote, rightNote }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="sim-slider">
      <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
        <label htmlFor={id} style={{ fontWeight: 700, fontSize: "0.92rem" }}>
          {label}
        </label>
        <b style={{ color: value === 0 ? "var(--muted)" : "var(--accent)", whiteSpace: "nowrap" }}>
          {value > 0 ? "+" : ""}
          {rupees(value)}
        </b>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="row" style={{ justifyContent: "space-between", fontSize: "0.72rem", color: "var(--muted)" }}>
        <span>{leftNote}</span>
        <span>{rightNote}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, delta }) {
  return (
    <div className="mini-stat">
      <span className="stat-label">{label}</span>
      <span className="mini-value">{value}</span>
      {delta !== null && delta !== undefined && delta !== 0 && (
        <span className={`mini-delta ${delta > 0 ? "up" : "down"}`}>
          {delta > 0 ? "▲ +" : "▼ "}
          {delta}
        </span>
      )}
    </div>
  );
}

/* ==========================================================================
   Can I afford this?
   ========================================================================== */
function Afford({ base }) {
  const { t, record, update } = useApp();
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [checked, setChecked] = useState(null);
  const [planMade, setPlanMade] = useState(false);

  const check = (e) => {
    e.preventDefault();
    setPlanMade(false);
    setChecked(affordability(record, cost));
  };

  const createPlan = () => {
    const months = checked.monthsToSave;
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    update((prev) => ({
      ...prev,
      goals: [
        ...(prev.goals || []),
        {
          id: `g_${Date.now().toString(36)}`,
          icon: "🛒",
          title: name.trim() || t("affordItem"),
          target: checked.price,
          saved: 0,
          deadline: d.toISOString().slice(0, 10)
        }
      ]
    }));
    setPlanMade(true);
  };

  const verdictInfo = checked && {
    easy: { cls: "good", icon: "✓", label: t("affordEasy") },
    yes: { cls: "good", icon: "✓", label: t("affordYes") },
    caution: { cls: "warn", icon: "!", label: t("affordCaution") },
    no: { cls: "bad", icon: "✕", label: t("affordNo") },
    nodata: { cls: "warn", icon: "?", label: t("affordNoData") }
  }[checked.verdict];

  return (
    <div className="split">
      <div className="card" style={{ gap: 16 }}>
        <form onSubmit={check} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field name="affordname" label={t("affordItem")} value={name} onChange={setName} voice
                 placeholder={t("affordItemEg")} />
          <Field name="affordcost" label={t("affordCost")} value={cost} onChange={setCost}
                 inputMode="numeric" voice numeric placeholder="60000" />
          <button className="btn block" type="submit">
            🔎 {t("affordCheck")}
          </button>
        </form>

        <div className="card sunk" style={{ gap: 6, background: "var(--surface-2)", border: "none" }}>
          <span className="card-title">{t("affordYourPosition")}</span>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>{t("affordReserves")}</span>
            <b><Amount value={base.reserves} /></b>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>{t("affordSpareMonth")}</span>
            <b><Amount value={base.surplus} /></b>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>{t("affordRunway")}</span>
            <b>{base.runwayMonths === null ? "—" : `${base.runwayMonths} ${t("simMonths")}`}</b>
          </div>
        </div>
      </div>

      <div className="card" style={{ gap: 14 }}>
        {!checked ? (
          <Empty icon="🛒" text={t("affordEmpty")} />
        ) : checked.verdict === "nodata" ? (
          <Empty icon="🛒" text={t("affordNoData")} />
        ) : (
          <>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="card-title">{t("affordRating")}</span>
              <span className={`pill ${verdictInfo.cls}`}>
                {verdictInfo.icon} {verdictInfo.label}
              </span>
            </div>

            <div className={`banner ${verdictInfo.cls === "good" ? "good" : verdictInfo.cls === "warn" ? "warn" : "bad"}`}>
              <span className="ic" aria-hidden="true">{verdictInfo.icon}</span>
              <span>
                {checked.verdict === "no"
                  ? t("affordMsgNo", [name || t("affordItem"), rupees(checked.price), rupees(checked.reserves)])
                  : checked.verdict === "caution"
                  ? t("affordMsgCaution", [rupees(checked.price), rupees(checked.safetyNet)])
                  : checked.verdict === "easy"
                  ? t("affordMsgEasy", [rupees(checked.price)])
                  : t("affordMsgYes", [rupees(checked.price)])}
              </span>
            </div>

            <div className="grid g2">
              <MiniStat label={t("affordLeftAfter")} value={<Amount value={checked.leftAfter} />} />
              <MiniStat
                label={t("affordRunwayAfter")}
                value={checked.runwayAfter === null ? "—" : `${checked.runwayAfter} ${t("simMonths")}`}
              />
            </div>

            {checked.verdict !== "easy" && checked.monthsToSave && (
              <div className="sim-note">
                <span className="step-label">✦ {t("affordPlanTitle")}</span>
                {t("affordPlanText", [rupees(checked.perMonth), checked.monthsToSave])}
                {!planMade ? (
                  <button className="btn" style={{ marginTop: 12 }} onClick={createPlan}>
                    🎯 {t("affordCreatePlan")} →
                  </button>
                ) : (
                  <p className="pill good" style={{ marginTop: 12, display: "inline-flex" }}>
                    ✓ {t("affordPlanMade")}
                  </p>
                )}
              </div>
            )}

            {checked.verdict !== "easy" && !checked.monthsToSave && (
              <div className="banner bad">
                <span className="ic" aria-hidden="true">⚠</span>
                <span>{t("affordNoSurplus")}</span>
              </div>
            )}

            <SpeakButton
              text={`${verdictInfo.label}. ${
                checked.verdict === "no"
                  ? t("affordMsgNo", [name || t("affordItem"), rupees(checked.price), rupees(checked.reserves)])
                  : ""
              }`}
            />
          </>
        )}
      </div>
    </div>
  );
}
