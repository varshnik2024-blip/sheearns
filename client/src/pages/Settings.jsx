import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { LANGUAGES } from "../i18n.js";
import { ChoiceGrid, Modal } from "../components/ui.jsx";
import { speechSupported, speakSupported } from "../lib/speech.js";

export default function Settings() {
  const { t, record, setSetting, wipeData, user } = useApp();
  const [confirm, setConfirm] = useState(false);
  const s = record.settings || {};

  return (
    <>
      <div className="pagehead">
        <div><h1>{t("settingsTitle")}</h1></div>
      </div>

      <div className="card">
        <ChoiceGrid
          label={t("language")}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.native, icon: "🌐" }))}
          value={s.language || "en"}
          onChange={(v) => setSetting("language", v)}
        />
      </div>

      <div className="card">
        <ChoiceGrid
          label={t("textSize")}
          options={[
            { value: "sm", label: t("small"), icon: "A" },
            { value: "md", label: t("medium"), icon: "A" },
            { value: "lg", label: t("large"), icon: "A" }
          ]}
          value={s.fontSize || "md"}
          onChange={(v) => setSetting("fontSize", v)}
        />
      </div>

      <div className="card">
        <ChoiceGrid
          label={t("contrast")}
          options={[
            { value: "normal", label: t("off"), icon: "🌗" },
            { value: "high", label: t("on"), icon: "⬛" }
          ]}
          value={s.contrast || "normal"}
          onChange={(v) => setSetting("contrast", v)}
        />
        <span className="card-hint">{t("contrastHelp")}</span>
      </div>

      <div className="card">
        <ChoiceGrid
          label={t("discreet")}
          options={[
            { value: "no", label: t("off"), icon: "👁️" },
            { value: "yes", label: t("on"), icon: "🙈" }
          ]}
          value={s.discreet ? "yes" : "no"}
          onChange={(v) => setSetting("discreet", v === "yes")}
        />
        <span className="card-hint">{t("discreetHelp")}</span>
      </div>

      <div className="banner info">
        <span className="ic" aria-hidden="true">⎋</span>
        <span>{t("quickExit")}</span>
      </div>

      <div className="card">
        <span className="card-title">{t("whatWorksDevice")}</span>
        <div className="tablewrap">
          <table className="data">
            <tbody>
              <tr>
                <td>{t("voiceInput")}</td>
                <td className="num">
                  <span className={`pill ${speechSupported ? "good" : "warn"}`}>
                    {speechSupported ? `✓ ${t("itWorks")}` : `! ${t("needsChrome")}`}
                  </span>
                </td>
              </tr>
              <tr>
                <td>{t("readingAloud")}</td>
                <td className="num">
                  <span className={`pill ${speakSupported ? "good" : "warn"}`}>
                    {speakSupported ? `✓ ${t("itWorks")}` : `! ${t("notAvailable")}`}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <span className="card-title">{t("yourData")}</span>
        <p className="card-hint">
          {t("dataPrivateNote")}
        </p>
        <button className="btn danger" style={{ alignSelf: "flex-start" }} onClick={() => setConfirm(true)}>
          🗑 {t("deleteData")}
        </button>
      </div>

      {confirm && (
        <Modal title={t("deleteData")} onClose={() => setConfirm(false)}>
          <div className="banner bad">
            <span className="ic" aria-hidden="true">⚠</span>
            <span>{t("deleteConfirm")}</span>
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn ghost" onClick={() => setConfirm(false)}>{t("cancel")}</button>
            <button
              className="btn danger"
              onClick={async () => {
                await wipeData();
                setConfirm(false);
              }}
            >
              {t("delete")}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
