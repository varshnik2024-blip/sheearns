const TOKEN_KEY = "sheearns_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new Error(body?.error || "Could not reach the server. Is it running?");
  }
  return body;
}

export const api = {
  health: () => request("/health"),
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  getData: () => request("/data"),
  saveData: (record) => request("/data", { method: "PUT", body: JSON.stringify(record) }),
  deleteData: () => request("/data", { method: "DELETE" }),
  chat: (message, lang) => request("/chat", { method: "POST", body: JSON.stringify({ message, lang }) })
};
