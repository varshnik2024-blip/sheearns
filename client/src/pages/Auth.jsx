import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { LANGUAGES } from "../i18n.js";
import { Field } from "../components/ui.jsx";

export default function Auth() {
  const { t, login, signup, lang, setSetting } = useApp();
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Checked here too so the user gets an answer instantly, not after a round trip.
    if (isSignup && name.trim().length < 2) return setError(t("errName"));
    if (phone.replace(/\D/g, "").length !== 10) return setError(t("errPhone"));
    if (!/^\d{4,6}$/.test(pin)) return setError(t("errPin"));

    setBusy(true);
    try {
      if (isSignup) await signup(name.trim(), phone, pin);
      else await login(phone, pin);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="row" style={{ justifyContent: "center", gap: 10 }}>
          <span className="brand-mark" aria-hidden="true" style={{ width: 34, height: 34, fontSize: "1rem" }}>
            S
          </span>
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>{t("appName")}</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{t("tagline")}</p>
          </div>
        </div>

        {/* Language is chosen before anything else, so the whole form is
            readable from the very first screen. */}
        <div className="field">
          <label htmlFor="auth-lang">{t("language")}</label>
          <select
            id="auth-lang"
            value={lang}
            onChange={(e) => setSetting("language", e.target.value)}
            style={{
              font: "inherit",
              minHeight: 52,
              padding: "12px 14px",
              borderRadius: 8,
              border: "2px solid var(--line)",
              background: "var(--surface)",
              color: "var(--ink)"
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
        </div>

        <form className="card pad-lg" onSubmit={submit} style={{ gap: 16 }}>
          <h2>{isSignup ? t("createAccountTitle") : t("loginTitle")}</h2>

          {isSignup && (
            <Field
              name="name"
              label={t("name")}
              value={name}
              onChange={setName}
              voice
              autoComplete="name"
            />
          )}

          <Field
            name="phone"
            label={t("phone")}
            help={t("phoneHelp")}
            value={phone}
            onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            autoComplete="tel"
          />

          <Field
            name="pin"
            label={t("pin")}
            help={isSignup ? t("pinHelp") : undefined}
            value={pin}
            onChange={(v) => setPin(v.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
          />

          {error && (
            <div className="banner bad">
              <span className="ic" aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button className="btn block" type="submit" disabled={busy}>
            {busy ? t("loading") : isSignup ? t("signup") : t("login")}
          </button>

          <button
            type="button"
            className="btn ghost block"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setError("");
            }}
          >
            {isSignup ? t("haveAccount") : t("noAccount")}
          </button>
        </form>
      </div>
    </div>
  );
}
