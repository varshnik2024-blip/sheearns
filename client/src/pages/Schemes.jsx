import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { matchSchemes } from "../data/schemes.js";
import { SpeakButton } from "../components/ui.jsx";
import { rupeesShort } from "../lib/format.js";

const RIGHTS = [
  {
    icon: "🚫",
    title: "No collateral for a Mudra loan",
    text: "For a Mudra loan up to 10 lakh rupees, no land, gold or security is needed. If someone asks you for collateral on a Mudra loan, that is wrong. Ask them to show you the rule in writing."
  },
  {
    icon: "✍️",
    title: "No male co-signer where it is not required",
    text: "A bank cannot demand your husband's or father's signature for a scheme that does not require one. Say: please show me where this is written."
  },
  {
    icon: "📄",
    title: "You have the right to a reason",
    text: "If a bank refuses your loan, you can ask why in writing. Keep that paper. It is what makes a complaint work later."
  },
  {
    icon: "🏛️",
    title: "Free complaints to the RBI Ombudsman",
    text: "If a bank treats you unfairly you can complain to the RBI Ombudsman. It costs nothing and you do not need a lawyer. Call 14448 or go to cms.rbi.org.in."
  },
  {
    icon: "🏠",
    title: "Your share in family property",
    text: "Daughters have the same right to ancestral property as sons. This has been the law since 2005 and applies even if you were born before then."
  }
];

const HELPLINES = [
  { label: "Women's Helpline (all India)", number: "181" },
  { label: "RBI Ombudsman", number: "14448" },
  { label: "National Commission for Women", number: "7827170170" },
  { label: "Free legal aid (NALSA)", number: "15100" }
];

export default function Schemes() {
  const { t, record } = useApp();
  const [openScheme, setOpenScheme] = useState(null);
  const profile = record.profile || {};
  const schemes = useMemo(() => matchSchemes(profile), [profile]);

  if (!profile.completedOnboarding) {
    return (
      <div className="card">
        <p>{t("schemesEmpty")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("schemesTitle")}</h1>
          <p className="sub">{t("schemesSub")}</p>
        </div>
        <SpeakButton
          text={
            `${t("schemesTitle")}. ` +
            schemes.filter((s) => s.qualifies).map((s) => `${s.name}, up to ${rupeesShort(s.max)}`).join(". ")
          }
        />
      </div>

      <div className="grid" style={{ gap: 10 }}>
        {schemes.map((s) => (
          <div className="card" key={s.id} style={{ borderColor: s.qualifies ? "var(--accent)" : "var(--line)" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 9 }}>
                  <h3>{s.name}</h3>
                  <span className={`pill ${s.qualifies ? "good" : "warn"}`}>
                    {s.qualifies ? `✓ ${t("youQualify")}` : `? ${t("maybeQualify")}`}
                  </span>
                  {s.collateralFree && <span className="pill info">🔓 {t("noCollateral")}</span>}
                </div>
                <p style={{ marginTop: 6 }}>{s.blurb}</p>
                <p style={{ color: "var(--muted)", fontSize: "0.87rem", marginTop: 3 }}>{s.who}</p>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <div className="stat-label">{t("upTo")}</div>
                <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>{rupeesShort(s.max)}</div>
              </div>
            </div>

            <button
              className="btn ghost sm"
              style={{ alignSelf: "flex-start" }}
              onClick={() => setOpenScheme(openScheme === s.id ? null : s.id)}
              aria-expanded={openScheme === s.id}
            >
              {openScheme === s.id ? `▲ ${t("hide")}` : "▼"} {t("whatYouNeed")}
            </button>

            {openScheme === s.id && (
              <ul style={{ margin: 0, paddingLeft: "1.2em", display: "flex", flexDirection: "column", gap: 6 }}>
                {s.docs.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 12 }}>{t("knowYourRights")}</h2>
      <div className="grid g2">
        {RIGHTS.map((r) => (
          <div className="card" key={r.title}>
            <div className="row" style={{ gap: 9 }}>
              <span style={{ fontSize: "1.4rem" }} aria-hidden="true">{r.icon}</span>
              <span className="card-title">{r.title}</span>
            </div>
            <p style={{ fontSize: "0.92rem" }}>{r.text}</p>
            <SpeakButton text={`${r.title}. ${r.text}`} />
          </div>
        ))}
      </div>

      <div className="card">
        <span className="card-title">{t("freeNumbers")}</span>
        <div className="tablewrap">
          <table className="data">
            <tbody>
              {HELPLINES.map((h) => (
                <tr key={h.number}>
                  <td>{h.label}</td>
                  <td className="num">
                    <a href={`tel:${h.number}`} style={{ fontWeight: 700, color: "var(--accent)" }}>
                      {h.number}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
