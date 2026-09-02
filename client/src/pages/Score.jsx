import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { translateDetail } from "../i18n.js";
import { calculateScore } from "../engine/scoring.js";
import { LESSONS } from "../data/lessons.js";
import { Empty, SpeakButton } from "../components/ui.jsx";
import { rupeesShort } from "../lib/format.js";

export default function Score() {
  const { t, lang, record } = useApp();
  const result = useMemo(() => calculateScore(record, LESSONS.length), [record]);

  if (!result.ready) {
    return (
      <>
        <div className="pagehead">
          <div>
            <h1>{t("scoreTitle")}</h1>
            <p className="sub">{t("scoreSub")}</p>
          </div>
        </div>
        <div className="card">
          <Empty
            icon="📊"
            text={`${t("needMoreData")}. ${t("needMoreDataHelp")} ${(record.income || []).length}.`}
          />
          <Link to="/" className="btn" style={{ alignSelf: "center" }}>
            ➕ {t("addIncome")}
          </Link>
        </div>
      </>
    );
  }

  const { score, tier, contributions } = result;
  const pct = (score - 300) / 600;
  const circumference = 2 * Math.PI * 70;

  const spokenSummary =
    `${t("scoreTitle")}: ${score} ${t("outOf")}. ${t("tier")} ${tier.level}. ` +
    contributions.map((c) => `${t(c.labelKey)}: ${t(c.relative > 0 ? "plus" : "minus")} ${Math.abs(c.relative)}`).join(". ");

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("scoreTitle")}</h1>
          <p className="sub">{t("scoreSub")}</p>
        </div>
        <SpeakButton text={spokenSummary} />
      </div>

      <div className="split">
        <div className="card pad-lg" style={{ alignItems: "center", justifyContent: "center", gap: 14 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" role="img"
               aria-label={`Your score is ${score} out of 900`}>
            <circle cx="100" cy="100" r="70" fill="none" stroke="var(--surface-2)" strokeWidth="18" />
            <circle
              cx="100" cy="100" r="70" fill="none"
              stroke="var(--accent)" strokeWidth="18" strokeLinecap="round"
              strokeDasharray={`${circumference * pct} ${circumference}`}
              transform="rotate(-90 100 100)"
            />
            <text x="100" y="98" textAnchor="middle" fill="var(--ink)" fontSize="46" fontWeight="700">
              {score}
            </text>
            <text x="100" y="122" textAnchor="middle" fill="var(--muted)" fontSize="13">
              {t("outOf")}
            </text>
          </svg>

          <span className={`pill ${tier.level >= 3 ? "good" : tier.level >= 1 ? "info" : "warn"}`}>
            {tier.level >= 1 ? "✓" : "○"} {t("tier")} {tier.level}
          </span>

          {tier.ceiling > 0 && (
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.92rem" }}>
              {t("ceiling")}: <b style={{ color: "var(--ink)" }}>{rupeesShort(tier.ceiling)}</b>
              <br />
              {tier.rate} {t("perYear")}
            </p>
          )}
        </div>

        <div className="card">
          <span className="card-title">{t("whatMoved")}</span>
          <div>
            {contributions.map((c) => {
              const width = Math.min(48, (Math.abs(c.relative) / 90) * 48);
              const positive = c.relative >= 0;
              return (
                <div className="factor" key={c.id}>
                  <div>
                    <div className="fl">{t(c.plainKey)}</div>
                    <div className="fd">{translateDetail(lang, c.detail)}</div>
                  </div>
                  <div className="track" role="img"
                       aria-label={`${t(c.labelKey)}: ${t(positive ? "plus" : "minus")} ${Math.abs(c.relative)} ${t("points")}`}>
                    <i className={positive ? "p" : "n"} style={{ width: `${width}%` }} />
                  </div>
                  <div className={`fnum ${positive ? "p" : "n"}`}>
                    {positive ? "+" : "−"}{Math.abs(c.relative)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="card-hint" style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
            {t("scoreFromYou")}
          </p>
        </div>
      </div>

      <div className="banner info">
        <span className="ic" aria-hidden="true">ℹ️</span>
        <div>
          <b>{t("scoreChangeable")}</b>
          <p style={{ marginTop: 4 }}>
            {t("scoreNoLookAt")}{" "}
            <Link to="/fairness">{t("seeHowWorks")} →</Link>
          </p>
        </div>
      </div>

      <Link to="/path" className="btn" style={{ alignSelf: "flex-start" }}>
        🪜 {t("navPath")} →
      </Link>
    </>
  );
}
