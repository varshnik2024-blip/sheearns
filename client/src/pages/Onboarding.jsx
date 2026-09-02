import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { BUSINESS_TYPES, localise } from "../data/schemes.js";
import { ChoiceGrid, Field, SpeakButton } from "../components/ui.jsx";

// One question per screen. Research on low-literacy interfaces is consistent
// that a linear step-by-step flow works far better than one long form.
export default function Onboarding() {
  const { t, lang, update, record } = useApp();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({
    businessType: record.profile?.businessType || "",
    businessName: record.profile?.businessName || "",
    yearsRunning: record.profile?.yearsRunning ?? "",
    shgMember: record.profile?.shgMember ?? null,
    shgYears: record.profile?.shgYears ?? "",
    shgMissedPayments: record.profile?.shgMissedPayments ?? ""
  });

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const yearOptions = [
    { value: "0", label: t("yrUnder1"), icon: "🌱" },
    { value: "1", label: t("yr1to2"), icon: "🌿" },
    { value: "3", label: t("yr3to5"), icon: "🌳" },
    { value: "6", label: t("yrOver5"), icon: "🏆" }
  ];

  const finish = () => {
    update((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        businessType: draft.businessType,
        businessName: draft.businessName,
        yearsRunning: Number(draft.yearsRunning) || 0,
        shgMember: Boolean(draft.shgMember),
        shgYears: Number(draft.shgYears) || 0,
        shgMissedPayments: Number(draft.shgMissedPayments) || 0,
        completedOnboarding: true
      }
    }));
  };

  const steps = [
    {
      valid: Boolean(draft.businessType),
      render: () => (
        <ChoiceGrid
          label={t("onbBusinessType")}
          options={localise(BUSINESS_TYPES, lang)}
          value={draft.businessType}
          onChange={(v) => set("businessType", v)}
        />
      )
    },
    {
      valid: true,
      render: () => (
        <Field
          name="bizname"
          label={t("onbBusinessName")}
          help={t("onbBusinessNameHelp")}
          value={draft.businessName}
          onChange={(v) => set("businessName", v)}
          voice
        />
      )
    },
    {
      valid: draft.yearsRunning !== "",
      render: () => (
        <ChoiceGrid
          label={t("onbYears")}
          options={yearOptions}
          value={String(draft.yearsRunning)}
          onChange={(v) => set("yearsRunning", v)}
        />
      )
    },
    {
      valid: draft.shgMember !== null,
      render: () => (
        <>
          <ChoiceGrid
            label={t("onbShg")}
            options={[
              { value: "yes", label: t("yes"), icon: "👭" },
              { value: "no", label: t("no"), icon: "🚫" }
            ]}
            value={draft.shgMember === null ? "" : draft.shgMember ? "yes" : "no"}
            onChange={(v) => set("shgMember", v === "yes")}
          />
          {draft.shgMember && (
            <>
              <Field
                name="shgyears"
                label={t("onbShgYears")}
                value={String(draft.shgYears)}
                onChange={(v) => set("shgYears", v.replace(/\D/g, ""))}
                inputMode="numeric"
                voice
                numeric
              />
              <Field
                name="shgmissed"
                label={t("onbShgMissed")}
                value={String(draft.shgMissedPayments)}
                onChange={(v) => set("shgMissedPayments", v.replace(/\D/g, ""))}
                inputMode="numeric"
                voice
                numeric
              />
            </>
          )}
        </>
      )
    }
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 560 }}>
        <div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h1 style={{ fontSize: "1.4rem" }}>{t("onbTitle")}</h1>
            <SpeakButton text={t("onbTitle") + ". " + t("onbSub")} />
          </div>
          <p style={{ color: "var(--muted)", marginTop: 4 }}>{t("onbSub")}</p>
        </div>

        {/* Progress dots, so she can see how much is left */}
        <div className="row" style={{ gap: 6 }} aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((_, i) => (
            <span
              key={i}
              style={{
                height: 8,
                flex: 1,
                borderRadius: 99,
                background: i <= step ? "var(--accent)" : "var(--surface-2)",
                border: "1px solid var(--line)"
              }}
            />
          ))}
        </div>

        <div className="card pad-lg" style={{ gap: 18 }}>
          {current.render()}

          <div className="row" style={{ justifyContent: "space-between" }}>
            {step > 0 ? (
              <button className="btn ghost" onClick={() => setStep((s) => s - 1)}>
                ← {t("cancel")}
              </button>
            ) : (
              <span />
            )}

            {isLast ? (
              <button className="btn" onClick={finish} disabled={!current.valid}>
                {t("onbFinish")} →
              </button>
            ) : (
              <button className="btn" onClick={() => setStep((s) => s + 1)} disabled={!current.valid}>
                {t("next")} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
