import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { QUOTES, quoteOfTheDay } from "../data/quotes.js";
import { SpeakButton } from "./ui.jsx";

export default function Quote({ compact = false }) {
  const { lang } = useApp();
  const [quote, setQuote] = useState(() => quoteOfTheDay());

  const shuffle = () => {
    const others = QUOTES.filter((q) => q.id !== quote.id);
    setQuote(others[Math.floor(Math.random() * others.length)]);
  };

  const text = quote.text[lang] || quote.text.en;

  if (compact) {
    return (
      <p className="quote-compact">
        <span aria-hidden="true">✦</span> {text}
        {quote.author && <cite> — {quote.author}</cite>}
      </p>
    );
  }

  return (
    <figure className="quote-card">
      <blockquote>{text}</blockquote>
      <figcaption>
        {quote.author ? `— ${quote.author}` : "— SheEarns"}
        <span className="quote-actions">
          <SpeakButton text={quote.author ? `${text} ${quote.author}` : text} />
          <button type="button" className="btn ghost sm" onClick={shuffle}>
            ↻
          </button>
        </span>
      </figcaption>
    </figure>
  );
}
