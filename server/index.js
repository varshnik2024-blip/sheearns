import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import chatRoutes from "./routes/chat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/chat", chatRoutes);

// --- serving the built website ------------------------------------------------
// In development, Vite serves the site on port 5173 and proxies /api here.
// When deployed, there is no Vite: we serve the built files ourselves, so the
// whole app is ONE service with ONE URL. Simpler to deploy and to share.
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");
const INDEX_HTML = path.join(CLIENT_DIST, "index.html");

// Mounted unconditionally. express.static simply passes the request along if
// the folder or file is missing, so this is safe in development too — and it
// means the server does not have to be restarted after the first build.
app.use(express.static(CLIENT_DIST));

// React Router owns the URLs. Any request that is not an API call and not a
// real file gets index.html, so refreshing on /score does not 404.
app.get(/^(?!\/api).*/, (req, res, next) => {
  if (!fs.existsSync(INDEX_HTML)) return next();
  res.sendFile(INDEX_HTML);
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`\n  SheEarns server running on http://localhost:${PORT}`);
  console.log(`  AI chat: ${process.env.GEMINI_API_KEY ? "Gemini connected" : "offline mode (no API key)"}`);
  console.log(
    fs.existsSync(INDEX_HTML)
      ? `  Website: serving the built site from this same address`
      : `  Website: run "npm run dev" in the client folder (development mode)`
  );
  console.log("");
});
