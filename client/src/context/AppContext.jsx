import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api, getToken, setToken, clearToken } from "../lib/api.js";
import { translate, LANGUAGES } from "../i18n.js";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const blank = {
  profile: {
    businessType: "",
    businessName: "",
    yearsRunning: null,
    shgMember: false,
    shgYears: 0,
    shgMissedPayments: 0,
    completedOnboarding: false
  },
  income: [],
  expenses: [],
  assets: [],
  supplierPayments: [],
  lessons: { completed: [], quizScore: null, quizAnswers: {} },
  settings: { language: "en", fontSize: "md", contrast: "normal", discreet: false }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const saveTimer = useRef(null);

  const lang = record.settings?.language || "en";
  const t = useCallback((key, params) => translate(lang, key, params), [lang]);
  const speechLang = LANGUAGES.find((l) => l.code === lang)?.speech || "en-IN";

  // --- session restore -------------------------------------------------------
  useEffect(() => {
    async function boot() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.me();
        setUser(user);
        const data = await api.getData();
        setRecord({ ...blank, ...data });
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  // --- apply display settings to the page ------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-font", record.settings?.fontSize || "md");
    root.setAttribute("data-contrast", record.settings?.contrast || "normal");
    root.setAttribute("lang", lang);
    root.setAttribute("data-lang", lang);
  }, [record.settings?.fontSize, record.settings?.contrast, lang]);

  // --- saving ----------------------------------------------------------------
  // Saves 700ms after the last change, so typing does not fire a request per key.
  const scheduleSave = useCallback((next) => {
    // Before login there is nowhere to save to. This happens when she picks a
    // language on the login screen, which must still work.
    if (!getToken()) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.saveData(next);
      } catch (err) {
        setToast({ type: "error", text: err.message });
      } finally {
        setSaving(false);
      }
    }, 700);
  }, []);

  const update = useCallback(
    (patch) => {
      setRecord((prev) => {
        const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  // --- list helpers ----------------------------------------------------------
  const addEntry = useCallback(
    (listName, entry) => {
      const withId = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, ...entry };
      update((prev) => ({ ...prev, [listName]: [...(prev[listName] || []), withId] }));
      return withId;
    },
    [update]
  );

  const removeEntry = useCallback(
    (listName, id) => {
      update((prev) => ({ ...prev, [listName]: (prev[listName] || []).filter((e) => e.id !== id) }));
    },
    [update]
  );

  const setSetting = useCallback(
    (key, value) => {
      update((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
    },
    [update]
  );

  // --- auth ------------------------------------------------------------------
  const login = useCallback(async (phone, pin) => {
    const { token, user } = await api.login({ phone, pin });
    setToken(token);
    setUser(user);
    const data = await api.getData();
    setRecord({ ...blank, ...data });
  }, []);

  const signup = useCallback(async (name, phone, pin) => {
    const { token, user } = await api.signup({ name, phone, pin });
    setToken(token);
    setUser(user);

    // Keep the display settings she already chose on the login screen —
    // especially her language. Starting a new account in English when she
    // just picked Tamil would be a bad first impression.
    setRecord((prev) => {
      const fresh = { ...blank, settings: { ...blank.settings, ...prev.settings } };
      api.saveData(fresh).catch(() => {});
      return fresh;
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setRecord(blank);
  }, []);

  const wipeData = useCallback(async () => {
    const fresh = await api.deleteData();
    setRecord({ ...blank, ...fresh });
    setToast({ type: "ok", text: "Everything you entered has been deleted." });
  }, []);

  // --- toast auto-dismiss ----------------------------------------------------
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const value = {
    user,
    record,
    loading,
    saving,
    toast,
    setToast,
    lang,
    t,
    speechLang,
    update,
    addEntry,
    removeEntry,
    setSetting,
    login,
    signup,
    logout,
    wipeData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
