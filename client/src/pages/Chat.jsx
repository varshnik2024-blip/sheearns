import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";
import { MicButton, SpeakButton } from "../components/ui.jsx";

export default function Chat() {
  const { t, lang } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const ask = async (text) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;

    setMessages((m) => [...m, { role: "you", text: question }]);
    setInput("");
    setBusy(true);

    try {
      const { reply, source } = await api.chat(question, lang);
      setMessages((m) => [...m, { role: "ai", text: reply, source }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "ai", text: err.message, source: "error" }]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [t("q1"), t("q2"), t("q3")];

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("chatTitle")}</h1>
          <p className="sub">{t("chatSub")}</p>
        </div>
      </div>

      <div className="card" style={{ gap: 16 }}>
        <div className="chat-scroll" ref={scrollRef} role="log" aria-live="polite" aria-label={t("chatTitle")}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "28px 12px", color: "var(--muted)" }}>
              <div style={{ fontSize: "2.4rem" }} aria-hidden="true">💬</div>
              <p style={{ marginTop: 8 }}>{t("chatEmpty")}</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div className={`msg ${m.role}`} key={i}>
              <span className="who-label">{m.role === "you" ? "You" : t("appName")}</span>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              {m.role === "ai" && (
                <div style={{ marginTop: 9 }}>
                  <SpeakButton text={m.text} />
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="msg ai">
              <span className="who-label">{t("appName")}</span>
              {t("thinking")}
            </div>
          )}
        </div>

        {messages.length === 0 && (
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 8 }}>{t("tryAsking")}</p>
            <div className="row">
              {suggestions.map((s) => (
                <button key={s} className="btn ghost sm" onClick={() => ask(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Type or speak. The microphone fills the same box, so there is only
            ever one place the question goes. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="input-with-voice"
        >
          <label className="sr-only" htmlFor="chat-input">{t("chatPlaceholder")}</label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chatPlaceholder")}
            style={{
              font: "inherit", minHeight: 52, padding: "12px 14px",
              border: "2px solid var(--line)", borderRadius: 8,
              background: "var(--surface)", color: "var(--ink)"
            }}
          />
          <MicButton onText={(text) => { setInput(text); ask(text); }} />
          <button className="btn" type="submit" disabled={busy || !input.trim()}>
            {t("send")}
          </button>
        </form>

        <p className="card-hint">
          {t("chatDisclaimer")}
        </p>
      </div>
    </>
  );
}
