import express from "express";
import { requireAuth } from "./auth.js";

const router = express.Router();
router.use(requireAuth);

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam"
};

// The offline answer bank. This is what runs when no API key is configured,
// so the chat is never a dead button. Keys are matched against the question.
const FALLBACK = [
  {
    match: ["emi", "instalment", "installment", "monthly payment"],
    en: "EMI means Equated Monthly Instalment. It is the fixed amount you pay the lender every month. It has two parts: some of the money you borrowed, and the interest on it. Ask the lender for the EMI amount in rupees before you sign anything."
  },
  {
    match: ["reducing balance", "flat rate", "flat interest"],
    en: "Reducing balance means interest is charged only on the money you still owe, so it gets smaller each month. Flat rate charges interest on the full original amount the whole time. Flat rate always costs you more. Always ask which one the lender is using."
  },
  {
    match: ["collateral", "security", "guarantee", "guarantor"],
    en: "Collateral is something valuable you promise to the bank in case you cannot repay, like land or gold. Many government schemes for women do not need collateral at all. A Mudra loan up to 10 lakh rupees needs no collateral."
  },
  {
    match: ["mudra", "shishu", "kishore", "tarun"],
    en: "Mudra is a government loan scheme for small businesses. There are three sizes: Shishu up to 50,000 rupees, Kishore up to 5 lakh, and Tarun up to 10 lakh. No collateral is needed. You apply at any bank branch with your Aadhaar, PAN and a simple business plan."
  },
  {
    match: ["credit score", "cibil", "score"],
    en: "A credit score is a number banks use to decide if they will lend to you. It is built from your past loan repayments. If you have never taken a formal loan, you have no score, and banks often say no. That is exactly the problem this app is built to solve."
  },
  {
    match: ["shg", "self help group", "sangam"],
    en: "A Self Help Group is a small group of women who save together and lend to each other. Banks trust SHG members because the group repayment record is very good. Being in an SHG for a long time with no missed payments makes you much more likely to get a bigger loan."
  },
  {
    match: ["save", "saving", "savings"],
    en: "A good goal is to keep aside a little every single day, even 20 rupees, rather than a large amount once a month. Daily saving is easier to keep up. Try to build a buffer equal to one month of your business costs before you take a new loan."
  },
  {
    match: ["separate", "business money", "household money", "mix"],
    en: "Keep business money and household money apart. Use two different places to hold them, even two envelopes. When they are mixed you cannot see if the business is actually making a profit, and lenders cannot see it either."
  },
  {
    match: ["husband", "co-signer", "cosigner", "signature", "permission"],
    en: "A bank cannot demand a male co-signer for a Mudra loan or most women's schemes. If a loan officer asks for your husband's signature when the scheme does not require it, you can ask for the rule in writing, and you can complain to the RBI Ombudsman for free."
  },
  {
    match: ["interest rate", "how much interest", "rate"],
    en: "For small business loans in India, roughly 10 to 16 percent per year on a reducing balance is a fair rate. Above 24 percent is expensive. Moneylenders often charge much more. Always compare at least two lenders before you agree."
  }
];

function fallbackAnswer(message) {
  const q = String(message || "").toLowerCase();
  const hit = FALLBACK.find((item) => item.match.some((m) => q.includes(m)));
  if (hit) return hit.en;
  return (
    "I can help with questions about loans, interest, EMI, saving money, credit scores, " +
    "self help groups, and government schemes for women. Try asking something like " +
    '"what is EMI?" or "what is a Mudra loan?".'
  );
}

const SYSTEM_PROMPT = `You are a financial helper for women micro-entrepreneurs in India.

Rules you must follow every time:
- Use very simple words. Short sentences. No jargon.
- If you must use a banking word, explain it in the same sentence.
- Give amounts in Indian rupees and use lakh/crore where natural.
- Be practical and specific. Suggest what she can actually do next.
- Never give personalised investment advice. You are informational only.
- Never shame the user or assume she has done something wrong.
- If you do not know, say so plainly.
- Keep the answer under 120 words.`;

// POST /api/chat  { message, lang }
router.post("/", async (req, res) => {
  const message = String(req.body.message || "").trim();
  const lang = LANGUAGE_NAMES[req.body.lang] ? req.body.lang : "en";

  if (!message) {
    return res.status(400).json({ error: "Please type or say a question first." });
  }

  const key = process.env.GEMINI_API_KEY;

  // No key configured: answer from the built-in bank so the feature still works.
  if (!key) {
    return res.json({ reply: fallbackAnswer(message), source: "offline" });
  }

  try {
    const prompt =
      `${SYSTEM_PROMPT}\n\n` +
      `Answer entirely in ${LANGUAGE_NAMES[lang]}. Do not use any other language.\n\n` +
      `Her question: ${message}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
        })
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Gemini error:", response.status, detail.slice(0, 300));
      return res.json({ reply: fallbackAnswer(message), source: "offline" });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) return res.json({ reply: fallbackAnswer(message), source: "offline" });
    res.json({ reply, source: "ai" });
  } catch (err) {
    console.error("Chat failed:", err.message);
    res.json({ reply: fallbackAnswer(message), source: "offline" });
  }
});

export default router;
