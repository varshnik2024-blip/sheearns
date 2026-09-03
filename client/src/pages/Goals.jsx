import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { goalStatus, nextStep, monthlySurplus, GOAL_PRESETS } from "../engine/goals.js";
import { Amount, ChoiceGrid, Field, Modal, Stat, Empty, SpeakButton } from "../components/ui.jsx";
import Quote from "../components/Quote.jsx";
import { rupees, todayISO } from "../lib/format.js";

export default function Goals() {
  const { t, record, update } = useApp();
  const [editing, setEditing] = useState(null); // goal object, or "new"
  const [funding, setFunding] = useState(null);

  const goals = record.goals || [];
  const surplus = monthlySurplus(record);

  const saveGoal = (goal) => {
    update((prev) => {
      const list = prev.goals || [];
      const exists = list.some((g) => g.id === goal.id);
      return {
        ...prev,
        goals: exists ? list.map((g) => (g.id === goal.id ? goal : g)) : [...list, goal]
      };
    });
    setEditing(null);
  };

  const removeGoal = (id) => {
    update((prev) => ({ ...prev, goals: (prev.goals || []).filter((g) => g.id !== id) }));
    setEditing(null);
  };

  const addFunds = (id, amount) => {
    update((prev) => ({
      ...prev,
      goals: (prev.goals || []).map((g) =>
        g.id === id ? { ...g, saved: (Number(g.saved) || 0) + amount } : g
      )
    }));
    setFunding(null);
  };

  const totalTarget = goals.reduce((a, g) => a + (Number(g.target) || 0), 0);
  const totalSaved = goals.reduce((a, g) => a + (Number(g.saved) || 0), 0);
  const onTrack = goals.filter((g) => goalStatus(g, record).state === "ontrack").length;

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("goalsTitle")}</h1>
          <p className="sub">{t("goalsSub")}</p>
        </div>
        <button className="btn" onClick={() => setEditing("new")}>
          ➕ {t("goalNew")}
        </button>
      </div>

      <Quote />

      {goals.length === 0 ? (
        <div className="card">
          <Empty icon="🎯" text={t("goalsEmpty")} />
          <button className="btn" style={{ alignSelf: "center" }} onClick={() => setEditing("new")}>
            ➕ {t("goalNew")}
          </button>
        </div>
      ) : (
        <>
          <div className="grid g3">
            <Stat label={t("goalsSaved")} value={<Amount value={totalSaved} />} note={`${t("of")} ${rupees(totalTarget)}`} />
            <Stat label={t("goalsOnTrack")} value={`${onTrack} / ${goals.length}`} />
            <Stat
              label={t("goalsSpare")}
              value={surplus === null ? "—" : <Amount value={surplus} />}
              note={surplus === null ? t("goalsSpareNoData") : t("goalsSpareNote")}
              tone={surplus !== null && surplus < 0 ? "crit" : undefined}
            />
          </div>

          <h2 style={{ marginTop: 6 }}>
            {t("goalsActive")} ({goals.length})
          </h2>

          <div className="goal-grid">
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onEdit={() => setEditing(g)}
                onFund={() => setFunding(g)}
              />
            ))}
          </div>
        </>
      )}

      {editing && (
        <GoalForm
          goal={editing === "new" ? null : editing}
          onSave={saveGoal}
          onDelete={removeGoal}
          onClose={() => setEditing(null)}
        />
      )}

      {funding && (
        <FundForm goal={funding} onAdd={addFunds} onClose={() => setFunding(null)} />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */

function GoalCard({ goal, onEdit, onFund }) {
  const { t, record } = useApp();
  const status = goalStatus(goal, record);
  const step = nextStep(goal, record);
  const stepText = t(step.key, (step.vals || []).map((v, i) =>
    // amounts get rupee formatting, plain counts do not
    step.key === "goalStepNoDeadline" || (step.key === "goalStepShort" && i === 2) ? v : typeof v === "number" && v > 100 ? rupees(v) : v
  ));

  const badge = {
    done: { cls: "good", label: `✓ ${t("goalDone")}` },
    ontrack: { cls: "good", label: `✓ ${t("goalOnTrack")}` },
    attention: { cls: "warn", label: `! ${t("goalAttention")}` },
    overdue: { cls: "bad", label: `✕ ${t("goalOverdue")}` }
  }[status.state];

  return (
    <div className="goal-card">
      <div className="goal-top">
        <span className={`pill ${badge.cls}`}>{badge.label}</span>
        {goal.deadline && <span className="goal-date">🗓 {goal.deadline}</span>}
      </div>

      <div>
        <div className="goal-title">
          {goal.icon && <span aria-hidden="true">{goal.icon} </span>}
          {goal.title}
        </div>
        <div className="goal-amounts" style={{ marginTop: 5 }}>
          <Amount value={Number(goal.saved) || 0} />{" "}
          <span className="of">/ {rupees(goal.target)}</span>
        </div>
      </div>

      <div>
        <div className="goal-bar-row">
          <span>{t("goalProgress")}</span>
          <b style={{ color: "var(--ink)" }}>{status.pct}%</b>
        </div>
        <div
          className="goal-bar"
          role="img"
          aria-label={`${status.pct}% ${t("goalProgress")}`}
          style={{ marginTop: 5 }}
        >
          <i
            className={status.state === "attention" ? "attention" : status.state === "overdue" ? "overdue" : ""}
            style={{ width: `${status.pct}%` }}
          />
        </div>
      </div>

      <div className="goal-step">
        <span className="step-label">✦ {t("goalNextStep")}</span>
        {stepText}
      </div>

      <div className="goal-foot">
        <button className="btn ghost sm" onClick={onEdit}>
          ✏️ {t("goalEdit")}
        </button>
        <div className="row" style={{ gap: 6 }}>
          <SpeakButton text={`${goal.title}. ${stepText}`} />
          <button className="btn sm" onClick={onFund} disabled={status.state === "done"}>
            + {t("goalSaveFunds")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function GoalForm({ goal, onSave, onDelete, onClose }) {
  const { t } = useApp();
  const isNew = !goal;

  const [preset, setPreset] = useState(goal ? "custom" : "");
  const [title, setTitle] = useState(goal?.title || "");
  const [target, setTarget] = useState(goal ? String(goal.target) : "");
  const [saved, setSaved] = useState(goal ? String(goal.saved || 0) : "0");
  const [deadline, setDeadline] = useState(goal?.deadline || "");
  const [error, setError] = useState("");

  const choosePreset = (value) => {
    setPreset(value);
    const p = GOAL_PRESETS.find((x) => x.id === value);
    if (!p) return;
    if (value !== "custom") setTitle(t(p.key));
    const d = new Date();
    d.setMonth(d.getMonth() + p.months);
    setDeadline(d.toISOString().slice(0, 10));
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError(t("goalErrTitle"));
    const targetNum = Number(String(target).replace(/[^\d.]/g, ""));
    if (!targetNum || targetNum <= 0) return setError(t("goalErrTarget"));
    const savedNum = Number(String(saved).replace(/[^\d.]/g, "")) || 0;
    if (savedNum > targetNum) return setError(t("goalErrSaved"));

    onSave({
      id: goal?.id || `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      icon: goal?.icon || GOAL_PRESETS.find((p) => p.id === preset)?.icon || "🎯",
      title: title.trim(),
      target: targetNum,
      saved: savedNum,
      deadline: deadline || null
    });
  };

  return (
    <Modal title={isNew ? t("goalNew") : t("goalEdit")} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {isNew && (
          <ChoiceGrid
            label={t("goalWhatFor")}
            options={GOAL_PRESETS.map((p) => ({ value: p.id, label: t(p.key), icon: p.icon }))}
            value={preset}
            onChange={choosePreset}
          />
        )}

        <Field name="goaltitle" label={t("goalName")} value={title} onChange={setTitle} voice />

        <Field
          name="goaltarget"
          label={t("goalTarget")}
          help={t("goalTargetHelp")}
          value={target}
          onChange={setTarget}
          inputMode="numeric"
          voice
          numeric
          placeholder="50000"
        />

        <Field
          name="goalsaved"
          label={t("goalAlreadySaved")}
          value={saved}
          onChange={setSaved}
          inputMode="numeric"
          voice
          numeric
        />

        <div className="field">
          <label htmlFor="goaldeadline">{t("goalBy")}</label>
          <span className="help">{t("goalByHelp")}</span>
          <input
            id="goaldeadline"
            type="date"
            value={deadline}
            min={todayISO()}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {error && (
          <div className="banner bad">
            <span className="ic" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="row" style={{ justifyContent: "space-between" }}>
          {!isNew ? (
            <button type="button" className="btn danger sm" onClick={() => onDelete(goal.id)}>
              🗑 {t("delete")}
            </button>
          ) : (
            <span />
          )}
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn ghost" onClick={onClose}>
              {t("cancel")}
            </button>
            <button type="submit" className="btn">
              {t("save")}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */

function FundForm({ goal, onAdd, onClose }) {
  const { t, record } = useApp();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const status = goalStatus(goal, record);

  const quick = [100, 500, 1000].filter((n) => n <= status.remaining);
  if (status.remaining > 0 && !quick.includes(status.remaining)) quick.push(status.remaining);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const n = Number(String(amount).replace(/[^\d.]/g, ""));
    if (!n || n <= 0) return setError(t("errAmount"));
    if (n > status.remaining) return setError(t("goalErrTooMuch", [rupees(status.remaining)]));
    onAdd(goal.id, n);
  };

  return (
    <Modal title={`${t("goalSaveFunds")} — ${goal.title}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p className="card-hint">
          {t("goalRemaining")}: <b style={{ color: "var(--ink)" }}>{rupees(status.remaining)}</b>
        </p>

        <div className="row">
          {quick.map((n) => (
            <button key={n} type="button" className="btn ghost sm" onClick={() => setAmount(String(n))}>
              {rupees(n)}
            </button>
          ))}
        </div>

        <Field
          name="fundamount"
          label={t("amount")}
          value={amount}
          onChange={setAmount}
          inputMode="numeric"
          voice
          numeric
          autoFocus
        />

        {error && (
          <div className="banner bad">
            <span className="ic" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn ghost" onClick={onClose}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn">
            {t("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
