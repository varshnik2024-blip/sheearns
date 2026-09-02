// Voice input and read-aloud, using the browser's built-in Web Speech API.
//
// This works in Chrome and Edge, which is what a demo laptop will be running.
// Firefox has speech recognition disabled, so we detect that and tell the user
// plainly instead of silently doing nothing.

const Recognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const speechSupported = Boolean(Recognition);
export const speakSupported = typeof window !== "undefined" && "speechSynthesis" in window;

// Starts listening. Calls onResult with the recognised text.
// Returns a stop() function.
export function listen({ lang = "en-IN", onResult, onError, onEnd }) {
  if (!Recognition) {
    onError?.("Voice input needs Google Chrome or Microsoft Edge.");
    onEnd?.();
    return () => {};
  }

  const rec = new Recognition();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;

  rec.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onResult?.(text);
  };

  rec.onerror = (event) => {
    const messages = {
      "no-speech": "I did not hear anything. Please try again.",
      "audio-capture": "No microphone found. Please check your microphone.",
      "not-allowed": "Please allow microphone access in your browser.",
      network: "Voice needs an internet connection."
    };
    onError?.(messages[event.error] || "Voice did not work. Please type instead.");
  };

  rec.onend = () => onEnd?.();

  try {
    rec.start();
  } catch {
    onError?.("Voice is already running.");
    onEnd?.();
  }

  return () => {
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
  };
}

// Is a voice for this language actually installed on this device?
//
// Windows ships only a few voices by default. If the Tamil voice is missing,
// the browser reads Tamil words with an English voice, which sounds wrong even
// though the text is correct. We detect that so we can tell the user why,
// instead of leaving them thinking the translation failed.
export function hasVoiceFor(lang) {
  if (!speakSupported) return false;
  const base = lang.split("-")[0];
  return window.speechSynthesis
    .getVoices()
    .some((v) => v.lang === lang || v.lang?.replace("_", "-").startsWith(base));
}

// Reads text aloud in the given language.
// Returns true if a proper voice was used, false if it fell back.
export function speak(text, lang = "en-IN") {
  if (!speakSupported || !text) return false;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.92; // slightly slower is easier to follow

  const base = lang.split("-")[0];
  const voices = window.speechSynthesis.getVoices();
  const match =
    voices.find((v) => v.lang === lang) ||
    voices.find((v) => v.lang?.replace("_", "-").startsWith(base));

  if (match) utter.voice = match;
  window.speechSynthesis.speak(utter);
  return Boolean(match);
}

export function stopSpeaking() {
  if (speakSupported) window.speechSynthesis.cancel();
}

// Pulls the first number out of spoken text, e.g. "I earned 1400 rupees" -> 1400.
// Also handles a few spoken words people use.
export function extractNumber(text) {
  const cleaned = String(text || "").toLowerCase().replace(/,/g, "");

  const words = {
    hundred: 100,
    thousand: 1000,
    lakh: 100000,
    lakhs: 100000,
    crore: 10000000
  };

  const digits = cleaned.match(/\d+(\.\d+)?/g);
  if (!digits) return null;

  let value = parseFloat(digits[0]);

  // "five thousand" style: multiply if a scale word follows the number.
  for (const [word, mult] of Object.entries(words)) {
    const pattern = new RegExp(`${digits[0]}\\s*${word}`);
    if (pattern.test(cleaned)) {
      value = value * mult;
      break;
    }
  }

  return Math.round(value);
}
