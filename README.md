# SheEarns

An alternative credit-readiness platform for women micro-entrepreneurs in India.

Conventional banks look for credit history, collateral and salary slips. A woman who
sells vegetables or stitches clothes has none of those, so she is refused — not because
she is risky, but because the bank is looking in the wrong place.

SheEarns scores her on what she actually has: supplier payments made on time, days
worked, regular earnings, and Self Help Group standing. Every factor is visible to her,
and every factor is something she can change.

---

## Before you start: install Node.js

This project needs Node.js. Check whether you have it:

```bash
node -v
```

If you see a version number like `v22.11.0`, skip to **Running the app**.

If you see `'node' is not recognized`, install it:

1. Go to **https://nodejs.org**
2. Click the big green **LTS** button
3. Run the downloaded installer and accept every default
4. **Restart VS Code completely** (close every window, then reopen)
5. Run `node -v` again — you should now see a version number

---

## Running the app

You need **two terminals** running at the same time. In VS Code, press
`` Ctrl + ` `` to open a terminal, then click the **+** icon to open a second one.

### Terminal 1 — the backend

```bash
cd server
npm install
npm run dev
```

You should see:

```
  SheEarns server running on http://localhost:4000
  AI chat: offline mode (no API key)
```

Leave this terminal running.

### Terminal 2 — the frontend

```bash
cd client
npm install
npm run dev
```

You should see:

```
  VITE v5.4.8  ready in 412 ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in **Chrome or Edge** (voice input needs one of these).

---

## Turning on the AI chat

The chat works immediately using built-in answers. To use real AI:

1. Go to https://aistudio.google.com/apikey and create a free key
2. Open `server/.env`
3. Put your key after `GEMINI_API_KEY=`
4. Stop the server (`Ctrl + C`) and run `npm run dev` again

You should now see `AI chat: Gemini connected`.

---

## Testing every feature

Work through this list. Each step should behave exactly as described.

| # | Do this | You should see |
|---|---|---|
| 1 | Open http://localhost:5173 | The login screen, with a language dropdown at the top |
| 2 | Change the language to தமிழ் | Every label changes to Tamil immediately |
| 3 | Create an account: any name, a 10-digit number, a 4-digit PIN | The onboarding questions appear |
| 4 | Type only 5 digits in the phone box and submit | A clear red message: "Please type a 10 digit mobile number." |
| 5 | Answer the four onboarding questions | The My Money page opens, completely empty |
| 6 | Click **Money I earned**, type 1400, pick a source, save | A stat tile appears showing ₹1,400 |
| 7 | Click the 🎤 button next to the amount and say "one thousand four hundred" | The box fills with 1400 |
| 8 | Add five or more income entries across two different months | A bar chart appears |
| 9 | Go to **My Score** | A score dial with six factor bars, each showing + or − points |
| 10 | Go to **How to Improve** | Ranked actions, each with a real points gain |
| 11 | Go to **Bank vs SheEarns** | Two panels: rejected on the left, ready on the right |
| 12 | Go to **Ask a Question**, ask "what is EMI?" | A plain-language answer, with a 🔊 button |
| 13 | Click 🔊 | The answer is read aloud |
| 14 | Go to **Lessons**, open one, click "I finished this" | It shows as done, and your score rises |
| 15 | Take the quiz | A percentage result, saved to your account |
| 16 | Go to **Loans For Me** | Schemes matched to what you entered |
| 17 | Go to **Settings**, set text size to Large | Everything gets bigger |
| 18 | Turn on High contrast | Black on white, heavy borders |
| 19 | Turn on "Hide my amounts" | All rupee figures become ●●●● until tapped |
| 20 | Press **Escape** anywhere | The browser leaves for a weather search |
| 21 | Log out, then log back in | All your data is still there |
| 22 | Create a second account with a different number | Its dashboard is empty — data is per user |

---

## If something goes wrong

**`'node' is not recognized`**
Node.js is not installed, or VS Code was not restarted after installing it. See the top of this file.

**`Could not reach the server. Is it running?`**
Terminal 1 is not running. Go to it and run `npm run dev` in the `server` folder.

**`EADDRINUSE: port 4000 already in use`**
Another copy of the server is still running. Close the other terminal, or change `PORT` in `server/.env`.

**The microphone button does nothing**
You are in Firefox. Firefox has speech recognition disabled. Use Chrome or Edge.
Also check that you clicked **Allow** on the microphone permission popup.

**Text shows as boxes (□□□) instead of Tamil or Malayalam**
The Google Fonts stylesheet did not load. Check your internet connection and refresh.

**The Save button does nothing when I add an entry**
Check the date. Future dates are deliberately refused — you cannot record money you have
not earned yet. Pick today or earlier.

**I want to start completely fresh**
Stop the server, delete `server/data/db.json`, and start it again. All accounts are erased.

---

## Deliberate behaviours, in case they look like bugs

- **Future dates are refused.** You cannot log earnings for a day that has not happened.
- **The score needs 5 income entries.** Below that it says so rather than showing a
  number it cannot justify.
- **A few supplier payments count less than many.** "0 of 1 paid on time" is not treated
  as harshly as "0 of 40". The engine smooths small samples toward the middle
  (`PRIOR = 4` in `src/engine/scoring.js`), because punishing someone at full weight for
  a single record would be both unfair and statistically wrong.
- **Escape leaves the site immediately.** That is the Quick Exit feature, not a crash.

---

## How it fits together

```
Browser (React + Vite, port 5173)
   │
   │  scoring runs HERE, in the browser, as a pure function
   │  → src/engine/scoring.js
   │  → src/engine/counterfactuals.js
   │
   │  /api/* is proxied to ↓
   │
Server (Express, port 4000)
   ├── /api/auth   signup, login, session   (bcryptjs + JWT)
   ├── /api/data   read and write one user's own record
   └── /api/chat   proxies to Gemini, keeps the API key off the browser
   │
Storage: server/data/db.json
```

The scoring engine deliberately runs in the browser. It is a pure function — the same
inputs always give the same score, and you can read every line of it. That is what makes
the "if you do this, +34 points" figures real rather than estimated, and what makes the
fairness claims checkable instead of a promise.

---

## Features

**Accounts** — signup and login with a mobile number and a 4–6 digit PIN. Passwords
hashed with bcrypt, sessions via JWT, rate limiting on login attempts. Each user's data
is completely separate.

**My Money** — log income, expenses, assets and supplier payments. Voice input on every
number field. Charts with a data table underneath. Asset register tracks whose name each
item is in.

**My Score** — six-factor credit readiness score from 300 to 900, with each factor's
contribution shown as + or − points and explained in plain words.

**How to Improve** — ranked actions with real point gains, each computed by re-running
the scoring engine with one input changed.

**Bank vs SheEarns** — the same data, two verdicts, side by side.

**Ask a Question** — multilingual AI chat with voice input and read-aloud. Falls back to
a built-in answer bank when no API key is set, so it is never a dead button.

**Lessons** — six lessons plus a quiz. Results feed the credit score.

**Loans For Me** — Mudra, Stand-Up India, Annapurna, Udyogini and SHG linkage matched
against the user's own profile, plus rights cards and free helplines.

**How This Works** — factor weights with their sources, and the list of things the model
deliberately refuses to look at.

**Settings** — five languages, three text sizes, high contrast, hidden amounts, and
delete-all-my-data.

**Accessibility** — read-aloud on every page, voice input, 48px minimum touch targets,
visible focus rings, semantic HTML with ARIA labels, data tables under every chart,
colour never used alone, and Escape as a quick exit.

**Languages** — English, हिन्दी, தமிழ், తెలుగు, മലയാളം. **220 strings, complete in all
five languages** — menus, buttons, form labels, dropdown options, hints, alerts,
validation errors, table headers and explanations. Per-script fonts and line heights
(Tamil and Malayalam get extra line height so their ligatures do not clip).

### What is still in English

Three pieces of long-form content are English only, and you should know this before
a judge finds it:

- the six lesson bodies in `src/data/lessons.js`
- the scheme descriptions and rights cards in `src/data/schemes.js` and `src/pages/Schemes.jsx`
- the offline fallback answers in `server/routes/chat.js`

The AI chat itself **does** answer in the selected language, so this gap does not affect
the chat when an API key is configured. Translating the lesson prose is the one place
that genuinely needs a native speaker rather than machine translation, because the
content is advice about money and a mistranslation there would be worse than English.

---

## Deploying — getting a link you can share

The Express server also serves the built website, so this deploys as **one service with
one URL**. There is no separate frontend to host.

### Step 1 — put the code on GitHub

In the `sheearns` folder:

```bash
git init
```
```bash
git add .
```
```bash
git commit -m "SheEarns"
```

Then create an empty repository at [github.com/new](https://github.com/new) (do **not**
tick "add a README"), and run the two commands GitHub shows you under
*"push an existing repository"*.

**Before you push, check that `server/.env` is not included.** `.gitignore` already
excludes it, so `git status` should never list it. That file holds your API key.

### Step 2 — deploy on Render

1. Sign up at [render.com](https://render.com) with your GitHub account
2. **New → Web Service**, pick your repository
3. Render reads `render.yaml` and fills everything in — leave the settings alone
4. **Create Web Service**, then wait about 3 minutes

You get a URL like `https://sheearns.onrender.com`. That is the link to send.

### Step 3 — turn on the AI (optional)

In Render: **Environment → Add Environment Variable**, key `GEMINI_API_KEY`, value from
[aistudio.google.com/apikey](https://aistudio.google.com/apikey). Save, and it redeploys.

---

### Two things to warn your friends about

**The first visit is slow.** Render's free tier puts the service to sleep after 15
minutes of no traffic. The next visit takes 30–60 seconds to wake it. Open the link
yourself a minute before you demo.

**Accounts do not survive a sleep.** This is the important one. The free tier has no
permanent disk, so `server/data/db.json` resets to empty every time the service
restarts. Your friends can sign up and use the app fully in one sitting, but if they
come back tomorrow their account will be gone.

For a hackathon demo that is usually fine. If you need it to last, the fix is to replace
the JSON file with a hosted Postgres database (a free permanent one from
[neon.tech](https://neon.tech) works well). **Only `server/db.js` has to change** — the
rest of the app never touches the file directly, which is why it was written that way.
