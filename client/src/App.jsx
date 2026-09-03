import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";

import Layout from "./components/Layout.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Auth from "./pages/Auth.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import MoneyMap from "./pages/MoneyMap.jsx";
import Score from "./pages/Score.jsx";
import Path from "./pages/Path.jsx";
import Compare from "./pages/Compare.jsx";
import Chat from "./pages/Chat.jsx";
import Lessons from "./pages/Lessons.jsx";
import Goals from "./pages/Goals.jsx";
import Schemes from "./pages/Schemes.jsx";
import Fairness from "./pages/Fairness.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const { user, record, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-page">
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </div>
    );
  }

  // Three states: logged out, logged in but has not told us about her work yet,
  // and the full app.
  if (!user) return <Auth />;
  if (!record.profile?.completedOnboarding) return <Onboarding />;

  return (
    <Layout>
      {/* keyed on the path so a crash on one page clears when you navigate away */}
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<MoneyMap />} />
          <Route path="/score" element={<Score />} />
          <Route path="/path" element={<Path />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/fairness" element={<Fairness />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}
