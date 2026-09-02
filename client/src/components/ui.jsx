import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { listen, speak, stopSpeaking, speechSupported, speakSupported, extractNumber } from "../lib/speech.js";
import { rupees } from "../lib/format.js";

/* ------------------------------------------------------------------
   Amount — respects the "hide my amounts" setting.
   ------------------------------------------------------------------ */
export function Amount({ value, short = false }) {
  const { record } = useApp();
  const [shown, setShown] = useState(false);
  const discreet = record.settings?.discreet;
  const text = short && value >= 100000 ? `₹${(value / 100000).toFixed(1)} lakh` : rupees(value);

  if (discreet && !shown) {
    return (
      <button
        type="button"
        className="hidden-amount"
        onClick={() => setShown(true)}
        aria-label="Tap to show the amount"
        style={{ border: "none", font: "inherit", padding: "0 6px" }}
      />
    );
  }
  return <span>{text}</span>;
}

/* ------------------------------------------------------------------
   SpeakButton — reads any text aloud in the chosen language.
   ------------------------------------------------------------------ */
export function SpeakButton({ text, label }) {
  const { speechLang, t, setToast } = useApp();
  const [on, setOn] = useState(false);

  if (!speakSupported) return null;

  const toggle = () => {
    if (on) {
      stopSpeaking();
      setOn(false);
    } else {
      const usedRealVoice = speak(text, speechLang);
      // The words are translated correctly, but this device may have no voice
      // for the language. Say so, rather than let it look like a bug.
      if (!usedRealVoice && speechLang !== "en-IN") {
        setToast({ type: "info", text: t("voiceMissing") });
      }
      setOn(true);
      // speechSynthesis has no reliable finish event across browsers, so we
      // poll for the queue emptying.
      const check = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setOn(false);
          clearInterval(check);
        }
      }, 400);
    }
  };

  return (
    <button type="button" className="btn ghost sm" onClick={toggle} aria-label={label || t("listen")}>
      {on ? "⏹" : "🔊"} {on ? t("stopListen") : t("listen")}
    </button>
  );
}

/* ------------------------------------------------------------------
   MicButton — voice input for any text or number field.
   ------------------------------------------------------------------ */
export function MicButton({ onText, numeric = false }) {
  const { speechLang, t, setToast } = useApp();
  const [on, setOn] = useState(false);
  const stopRef = useRef(null);

  useEffect(() => () => stopRef.current?.(), []);

  if (!speechSupported) return null;

  const start = () => {
    if (on) {
      stopRef.current?.();
      setOn(false);
      return;
    }
    setOn(true);
    stopRef.current = listen({
      lang: speechLang,
      onResult: (text) => {
        if (numeric) {
          const n = extractNumber(text);
          if (n === null) {
            setToast({ type: "error", text: `I heard "${text}" but could not find a number. Please type it.` });
          } else {
            onText(String(n));
          }
        } else {
          onText(text);
        }
      },
      onError: (msg) => setToast({ type: "error", text: msg }),
      onEnd: () => setOn(false)
    });
  };

  return (
    <button
      type="button"
      className={`mic${on ? " on" : ""}`}
      onClick={start}
      aria-label={on ? t("listening") : t("tapToSpeak")}
      title={on ? t("listening") : t("tapToSpeak")}
    >
      {on ? "●" : "🎤"}
    </button>
  );
}

/* ------------------------------------------------------------------
   Field — a labelled input with optional voice and a clear error.
   ------------------------------------------------------------------ */
export function Field({ label, help, error, value, onChange, voice = false, numeric = false, ...rest }) {
  return (
    <div className={`field${error ? " invalid" : ""}`}>
      <label htmlFor={rest.id || rest.name}>{label}</label>
      {help && <span className="help">{help}</span>}
      {voice ? (
        <div className="input-with-voice">
          <input
            id={rest.id || rest.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            {...rest}
          />
          <MicButton numeric={numeric} onText={onChange} />
        </div>
      ) : (
        <input
          id={rest.id || rest.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          {...rest}
        />
      )}
      {error && <span className="err">⚠ {error}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------
   ChoiceGrid — big tappable tiles instead of a dropdown.
   ------------------------------------------------------------------ */
export function ChoiceGrid({ options, value, onChange, label }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="choices" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="choice"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.icon && <span className="ic" aria-hidden="true">{o.icon}</span>}
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Modal
   ------------------------------------------------------------------ */
export function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Stat tile
   ------------------------------------------------------------------ */
export function Stat({ label, value, note, tone }) {
  return (
    <div className="card">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={tone ? { color: `var(--${tone})` } : undefined}>
        {value}
      </span>
      {note && <span className="stat-note">{note}</span>}
    </div>
  );
}

export function Empty({ icon = "📝", text }) {
  return (
    <div className="empty">
      <div className="big" aria-hidden="true">{icon}</div>
      <p>{text}</p>
    </div>
  );
}
