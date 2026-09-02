import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { buildActions } from "../engine/counterfactuals.js";
import { LESSONS } from "../data/lessons.js";
import { Stat, Empty, SpeakButton } from "../components/ui.jsx";
import { rupeesShort } from "../lib/format.js";

export default function Path() {
  const { t, record } = useApp();
  const { current, actions, combined } = useMemo(
    () => buildActions(record, LESSONS.length),
    [record]
  );

  if (!current.ready) {
    return (
      <>
        <div className="pagehead">
          <div>
            <h1>{t("pathTitle")}</h1>
            <p className="sub">{t("pathSub")}</p>
          </div>
        </div>
        <div className="card">
          <Empty icon="🪜" text={t("noActions")} />
          <Link to="/" className="btn" style={{ alignSelf: "center" }}>➕ {t("addIncome")}</Link>
        </div>
      </>
    );
  }

  const spoken =
    `${t("today")}: ${current.score}. ` +
    actions.map((a) => `${t(a.titleKey)}. ${t("plus")} ${a.gain} ${t("points")}.`).join(" ");

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("pathTitle")}</h1>
          <p className="sub">{t("pathSub")}</p>
        </div>
        <SpeakButton text={spoken} />
      </div>

      <div className="grid g3">
        <Stat label={t("today")} value={current.score} note={`${t("tier")} ${current.tier.level}`} />
        <Stat
          label={t("ifYouDo")}
          value={combined.score}
          tone="pos"
          note={`${t("tier")} ${combined.tier.level}`}
        />
        <Stat
          label={t("ceiling")}
          value={rupeesShort(combined.tier.ceiling)}
          note={`from ${rupeesShort(current.tier.ceiling)}`}
        />
      </div>

      {actions.length === 0 ? (
        <div className="card">
          <Empty icon="🎉" text={t("allDoing")} />
        </div>
      ) : (
        <div className="grid" style={{ gap: 10 }}>
          {actions.map((a, i) => (
            <div className="card" key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <span
                aria-hidden="true"
                style={{
                  fontWeight: 700, color: "var(--muted)", minWidth: 26,
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{t(a.titleKey)}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.87rem" }}>{t(a.whyKey)}</div>
              </div>
              <span className="pill good">▲ +{a.gain} {t("points")}</span>
            </div>
          ))}
        </div>
      )}

      <div className="banner info">
        <span className="ic" aria-hidden="true">🧮</span>
        <div>
          <b>{t("pathNumbersReal")}</b>
          <p style={{ marginTop: 4 }}>
            {t("pathNumbersHow")}
          </p>
        </div>
      </div>
    </>
  );
}
