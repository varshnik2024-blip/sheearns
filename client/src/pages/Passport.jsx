import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { calculateScore } from "../engine/scoring.js";
import { baseline } from "../engine/simulator.js";
import { matchSchemes, BUSINESS_TYPES, labelOf } from "../data/schemes.js";
import { LESSONS } from "../data/lessons.js";
import { Empty, SpeakButton } from "../components/ui.jsx";
import { translateDetail } from "../i18n.js";
import { rupees, rupeesShort, sum } from "../lib/format.js";

// The Financing Passport.
//
// The rest of the app tells her she is ready. This is the piece of paper she
// can put on a loan officer's desk. It says what she has, where the numbers
// came from, and what the model will not claim — because a dossier that
// oversells her would fall apart at the counter and cost her the loan.

export default function Passport() {
  const { t, lang, record, user } = useApp();

  const result = useMemo(() => calculateScore(record, LESSONS.length), [record]);
  const base = useMemo(() => baseline(record), [record]);
  const schemes = useMemo(
    () => matchSchemes(record.profile || {}).filter((s) => s.qualifies),
    [record.profile]
  );

  const income = record.income || [];
  const payments = record.supplierPayments || [];
  const profile = record.profile || {};

  if (!result.ready || !base) {
    return (
      <>
        <div className="pagehead">
          <div>
            <h1>{t("passportTitle")}</h1>
            <p className="sub">{t("passportSub")}</p>
          </div>
        </div>
        <div className="card">
          <Empty icon="📄" text={`${t("needMoreDataHelp")} ${income.length}.`} />
        </div>
      </>
    );
  }

  const daysTraded = new Set(income.map((e) => e.date)).size;
  const monthsRecorded = new Set(income.map((e) => String(e.date).slice(0, 7))).size;
  const onTime = payments.filter((p) => p.onTime).length;
  const issued = new Date().toISOString().slice(0, 10);

  const spoken =
    `${t("passportTitle")}. ${user?.name}. ` +
    `${t("scoreTitle")} ${result.score} ${t("outOf")}. ${t("tier")} ${result.tier.level}. ` +
    `${t("passportEvidence")}: ${daysTraded} ${t("passportDays")}, ${monthsRecorded} ${t("passportMonths")}.`;

  return (
    <>
      <div className="pagehead no-print">
        <div>
          <h1>{t("passportTitle")}</h1>
          <p className="sub">{t("passportSub")}</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <SpeakButton text={spoken} />
          <button className="btn" onClick={() => window.print()}>
            🖨️ {t("passportPrint")}
          </button>
        </div>
      </div>

      <div className="banner info no-print">
        <span className="ic" aria-hidden="true">💡</span>
        <div>
          <b>{t("passportWhyTitle")}</b>
          <p style={{ marginTop: 4 }}>{t("passportWhy")}</p>
        </div>
      </div>

      {/* ------------------ the printable sheet ------------------ */}
      <article className="passport">
        <header className="passport-head">
          <div>
            <span className="passport-brand">SheEarns</span>
            <h2>{t("passportTitle")}</h2>
          </div>
          <div className="passport-issued">
            {t("passportIssued")}
            <br />
            <b>{issued}</b>
          </div>
        </header>

        <section className="passport-who">
          <div>
            <span className="stat-label">{t("passportName")}</span>
            <div className="passport-name">{user?.name}</div>
            <div className="passport-meta">
              {profile.businessName ? `${profile.businessName} · ` : ""}
              {labelOf(BUSINESS_TYPES, profile.businessType, lang)}
              {profile.yearsRunning ? ` · ${profile.yearsRunning}+ ${t("years")}` : ""}
            </div>
          </div>
          <div className="passport-score">
            <div className="passport-score-num">{result.score}</div>
            <div className="stat-label">{t("outOf")}</div>
            <span className="pill good" style={{ marginTop: 6 }}>
              {t("tier")} {result.tier.level}
            </span>
          </div>
        </section>

        <section>
          <h3 className="passport-h3">{t("passportEvidence")}</h3>
          <div className="passport-grid">
            <Fact label={t("passportDaysTraded")} value={daysTraded} />
            <Fact label={t("passportMonthsRecorded")} value={monthsRecorded} />
            <Fact
              label={t("passportSupplier")}
              value={payments.length ? `${onTime} / ${payments.length}` : "—"}
            />
            <Fact
              label={t("passportShg")}
              value={
                profile.shgMember
                  ? `${profile.shgYears || 0} ${t("years")}, ${profile.shgMissedPayments || 0} ${t("passportMissed")}`
                  : t("no")
              }
            />
            <Fact label={t("passportTurnover")} value={rupeesShort(sum(income))} />
            <Fact label={t("passportMonthlyIncome")} value={rupees(base.monthlyIncome)} />
            <Fact label={t("passportMonthlySpare")} value={rupees(base.surplus)} />
            <Fact
              label={t("passportRunway")}
              value={base.runwayMonths === null ? "—" : `${base.runwayMonths} ${t("simMonths")}`}
            />
          </div>
        </section>

        <section>
          <h3 className="passport-h3">{t("passportHowScored")}</h3>
          <table className="data passport-table">
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
                <td colSpan={2}>
                  <b>{t("startingPoints")}</b>
                </td>
                <td className="num">
                  <b>{result.base}</b>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <b>{t("yourScoreRow")}</b>
                </td>
                <td className="num">
                  <b>{result.score}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {schemes.length > 0 && (
          <section>
            <h3 className="passport-h3">{t("passportSchemes")}</h3>
            <ul className="passport-list">
              {schemes.map((s) => (
                <li key={s.id}>
                  <b>{s.name}</b> — {t("upTo")} {rupeesShort(s.max)}
                  {s.collateralFree ? ` · ${t("noCollateral")}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="passport-excluded">
          <h3 className="passport-h3">{t("passportNotUsed")}</h3>
          <p>{t("scoreNoLookAt")}</p>
        </section>

        <footer className="passport-foot">
          <b>{t("passportLimitTitle")}</b>
          <p>{t("passportLimit")}</p>
        </footer>
      </article>
    </>
  );
}

function Fact({ label, value }) {
  return (
    <div className="passport-fact">
      <span className="stat-label">{label}</span>
      <b>{value}</b>
    </div>
  );
}
