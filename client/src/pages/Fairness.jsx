import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { FACTORS, calculateScore } from "../engine/scoring.js";
import { LESSONS } from "../data/lessons.js";
import { SpeakButton } from "../components/ui.jsx";
import { translateDetail } from "../i18n.js";

const EXCLUDED = ["Marital", "Caste", "Location", "Contacts", "MaleIncome", "Age"];

// Sources stay in English on purpose: these are names of real institutions and
// published methods (RBI, NABARD, Kaleidofin), and translating them would make
// them harder, not easier, for anyone to go and check.
const SOURCES = {
  supplier: "Trade-credit repayment research; microfinance field practice",
  deposits: "RBI financial inclusion indicators",
  shg: "NABARD SHG-Bank Linkage repayment records",
  activity: "Cash-flow underwriting precedent (Kaleidofin ki-score, Tala, Kiva)",
  stability: "Volatility-adjusted affordability models",
  literacy: "Our own choice. Lowest weight, easiest to improve."
};

export default function Fairness() {
  const { t, lang, record } = useApp();
  const result = useMemo(() => calculateScore(record, LESSONS.length), [record]);

  const spoken =
    `${t("fairTitle")}. ${t("excluded")}: ` +
    EXCLUDED.map((e) => t("excl" + e)).join(", ") + `. ${t("limitationText")}`;

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("fairTitle")}</h1>
          <p className="sub">{t("fairSub")}</p>
        </div>
        <SpeakButton text={spoken} />
      </div>

      <div className="card">
        <span className="card-title">{t("weights")}</span>
        <div className="tablewrap">
          <table className="data">
            <thead>
              <tr>
                <th>{t("thWhatWeLookAt")}</th>
                <th className="num">{t("thHowMuch")}</th>
                <th>{t("thWhereFrom")}</th>
              </tr>
            </thead>
            <tbody>
              {FACTORS.map((f) => (
                <tr key={f.id}>
                  <td>
                    <b>{t(f.labelKey)}</b>
                    <div style={{ color: "var(--muted)", fontSize: "0.83rem" }}>{t(f.plainKey)}</div>
                  </td>
                  <td className="num">{Math.round(f.weight * 100)}%</td>
                  <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{SOURCES[f.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <span className="card-title">{t("excluded")}</span>
        <div className="grid g2">
          {EXCLUDED.map((e) => (
            <div key={e} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--crit)", fontWeight: 700, flex: "none" }} aria-hidden="true">✕</span>
              <div>
                <b>{t("excl" + e)}</b>
                <div style={{ color: "var(--muted)", fontSize: "0.87rem" }}>{t("excl" + e + "Why")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.ready && (
        <div className="card">
          <span className="card-title">{t("yourScoreBreakdown")}</span>
          <div className="tablewrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t("thFactor")}</th>
                  <th>{t("thWhatWeFound")}</th>
                  <th className="num">{t("thPoints")}</th>
                </tr>
              </thead>
              <tbody>
                {result.contributions.map((c) => (
                  <tr key={c.id}>
                    <td>{t(c.labelKey)}</td>
                    <td style={{ color: "var(--muted)" }}>{translateDetail(lang, c.detail)}</td>
                    <td className="num">{c.points}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}><b>{t("startingPoints")}</b></td>
                  <td className="num"><b>{result.base}</b></td>
                </tr>
                <tr>
                  <td colSpan={2}><b>{t("yourScoreRow")}</b></td>
                  <td className="num"><b>{result.score}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="banner warn">
        <span className="ic" aria-hidden="true">⚠️</span>
        <div>
          <b>{t("limitation")}</b>
          <p style={{ marginTop: 4 }}>{t("limitationText")}</p>
          <p style={{ marginTop: 6, fontSize: "0.87rem" }}>
            {t("fairnessCaveat")}
          </p>
        </div>
      </div>
    </>
  );
}
