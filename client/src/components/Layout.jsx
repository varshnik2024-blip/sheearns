import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { LANGUAGES } from "../i18n.js";

const NAV = [
  { to: "/", key: "navHome", icon: "🏠", end: true },
  { to: "/score", key: "navScore", icon: "📊" },
  { to: "/path", key: "navPath", icon: "🪜" },
  { to: "/compare", key: "navCompare", icon: "⚖️" },
  { to: "/goals", key: "navGoals", icon: "🎯" },
  { to: "/chat", key: "navChat", icon: "💬" },
  { to: "/lessons", key: "navLessons", icon: "📖" },
  { to: "/schemes", key: "navSchemes", icon: "🏛️" },
  { to: "/fairness", key: "navFairness", icon: "🔍" },
  { to: "/settings", key: "navSettings", icon: "⚙️" }
];

export default function Layout({ children }) {
  const { t, user, logout, lang, setSetting, saving, toast, setToast } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Quick Exit. Escape sends the browser to a harmless page.
  // Best practice is to land somewhere plausible, not a blank tab, because an
  // empty history is itself suspicious.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !document.querySelector(".overlay")) {
        window.location.replace("https://www.google.com/search?q=weather+today");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app">
      <nav className={`sidebar${open ? " open" : ""}`} aria-label="Main menu">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>{t("appName")}</span>
        </div>

        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `navlink${isActive ? " active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <span className="ic" aria-hidden="true">{n.icon}</span>
            <span>{t(n.key)}</span>
          </NavLink>
        ))}

        <div className="sidebar-foot">
          <div className="who">
            <b>{user?.name}</b>
            <span>{user?.phone}</span>
          </div>
          <button className="btn ghost sm" onClick={handleLogout}>
            {t("logout")}
          </button>
        </div>
      </nav>

      <div className="main">
        <header className="topbar">
          <button
            className="btn ghost sm menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            ☰
          </button>

          <div className="spacer" />

          {saving && <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Saving…</span>}

          <label className="sr-only" htmlFor="lang-select">
            {t("language")}
          </label>
          <select
            id="lang-select"
            value={lang}
            onChange={(e) => setSetting("language", e.target.value)}
            style={{
              font: "inherit",
              minHeight: 44,
              padding: "8px 12px",
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
        </header>

        <main className="content">{children}</main>
      </div>

      {open && (
        <div
          className="overlay"
          style={{ zIndex: 40 }}
          onClick={() => setOpen(false)}
          role="presentation"
        />
      )}

      {toast && (
        <div className={`toast${toast.type === "error" ? " error" : ""}`} role="status" onClick={() => setToast(null)}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
