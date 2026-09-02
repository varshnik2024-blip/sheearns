import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { calculateScore } from "../engine/scoring.js";
import { LESSONS } from "../data/lessons.js";
import { Empty, SpeakButton } from "../components/ui.jsx";
import { rupeesShort, sum } from "../lib/format.js";

export default function Compare() {
  const { t, record, user } = useApp();
  const result = useMemo(() => calculateScore(record, LESSONS.length), [record]);

  const income = record.income || [];
  const assets = record.assets || [];
  const payments = record.supplierPayments || [];
  const profile = record.profile || {};

  // What a conventional lender would say, built from the same data.
  const bankReasons = useMemo(() => {
    const out = [];
    out.push({ key: "cmpNoHistory" });
    if (!assets.some((a) => a.ownedBy === "mine")) {
      out.push({ key: "cmpNoProperty" });
    } else {
      out.push({ key: "cmpNotValued" });
    }
    out.push({ key: "cmpCashIncome" });
    out.push({ key: "cmpNotRegistered" });
    return out;
  }, [assets]);

  // What we say, built from the same data.
  const ourReasons = useMemo(() => {
    const out = [];
    // Only claim this as a strength if it actually is one. Listing
    // "0 of 1 paid on time" with a tick would be dishonest.
    const onTime = payments.filter((p) => p.onTime).length;
    if (payments.length && onTime / payments.length >= 0.7) {
      out.push({ key: "cmpSupplierOk", vals: [onTime, payments.length] });
    }
    const days = new Set(income.map((e) => e.date)).size;
    if (days) out.push({ key: "cmpDays", vals: [days] });
    const months = new Set(income.map((e) => String(e.date).slice(0, 7))).size;
    if (months) out.push({ key: "cmpMonths", vals: [months] });
    if (profile.shgMember) {
      out.push({ key: "cmpShg", vals: [profile.shgYears || 0, profile.shgMissedPayments || 0] });
    }
    if (income.length) {
      out.push({ key: "cmpTotal", vals: [rupeesShort(sum(income))] });
    }
    return out;
  }, [payments, income, profile]);

  if (!result.ready) {
    return (
      <>
        <div className="pagehead">
          <div><h1>{t("compareTitle")}</h1><p className="sub">{t("compareSub")}</p></div>
        </div>
        <div className="card">
          <Empty icon="⚖️" text={`${t("needMoreDataHelp")} ${income.length}.`} />
          <Link to="/" className="btn" style={{ alignSelf: "center" }}>➕ {t("addIncome")}</Link>
        </div>
      </>
    );
  }

  const spoken =
    `${t("oldWay")}: ${t("rejected")}. ${t("ourWay")}: ${t("approved")}. ` +
    `${result.score} ${t("outOf")}. ${t("compareNote")}`;

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("compareTitle")}</h1>
          <p className="sub">{t("compareSub")}</p>
        </div>
        <SpeakButton text={spoken} />
      </div>

      <div className="split" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card pad-lg" style={{ borderColor: "var(--crit)", gap: 14 }}>
          <span className="stat-label">{t("oldWay")}</span>
          <h2 style={{ color: "var(--crit)" }}>❌ {t("rejected")}</h2>
          <span className="pill bad">✕ {t("cmpNoFile")}</span>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {bankReasons.map((r, i) => (
              <li key={i} style={{ display: "flex", gap: 9, fontSize: "0.92rem" }}>
                <span style={{ color: "var(--crit)", fontWeight: 700 }} aria-hidden="true">✕</span>
                <span>{t(r.key, r.vals)}</span>
              </li>
            ))}
          </ul>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, fontSize: "0.92rem" }}>
            {t("offered")}: <b>₹0</b>
          </div>
        </div>

        <div className="card pad-lg" style={{ borderColor: "var(--accent)", gap: 14 }}>
          <span className="stat-label">{t("ourWay")}</span>
          <h2 style={{ color: "var(--pos)" }}>✅ {t("approved")}</h2>
          <span className="pill good">✓ {result.score} / 900 · {t("tier")} {result.tier.level}</span>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {ourReasons.map((r, i) => (
              <li key={i} style={{ display: "flex", gap: 9, fontSize: "0.92rem" }}>
                <span style={{ color: "var(--pos)", fontWeight: 700 }} aria-hidden="true">✓</span>
                <span>{t(r.key, r.vals)}</span>
              </li>
            ))}
          </ul>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, fontSize: "0.92rem" }}>
            {t("offered")}: <b>{rupeesShort(result.tier.ceiling)}</b> · {result.tier.rate} {t("perYear")}
          </div>
        </div>
      </div>

      <div className="banner info">
        <span className="ic" aria-hidden="true">💡</span>
        <div>
          <b>{t("compareNote")}</b>
          <p style={{ marginTop: 4 }}>
            {t("bothSame")}
          </p>
        </div>
      </div>

      <Link to="/schemes" className="btn" style={{ alignSelf: "flex-start" }}>
        🏛️ {t("navSchemes")} →
      </Link>
    </>
  );
}
