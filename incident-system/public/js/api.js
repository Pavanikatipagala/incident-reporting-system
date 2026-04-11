/**
 * Shared Fetch wrapper: attaches JWT from localStorage, parses JSON errors.
 */
const TOKEN_KEY = 'incident_token';
const USER_KEY = 'incident_user';

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/api${p}`;
}

/** Store session after login/register */
function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Low-level request: options same as fetch (method, body, etc.)
 */
async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(apiUrl(path), { ...options, headers });
  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    /* non-JSON body */
  }
  if (!res.ok) {
    let msg = data.message || res.statusText;
    if (Array.isArray(data.errors)) {
      msg = data.errors.map((e) => e.msg || e.message || JSON.stringify(e)).join(', ');
    }
    throw new Error(msg);
  }
  return data;
}

/** Redirect to correct dashboard based on stored user role */
function goToRoleHome() {
  const user = getUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }
  if (user.role === 'admin') window.location.href = '/admin.html';
  else if (user.role === 'department') window.location.href = '/department.html';
  else window.location.href = '/citizen.html';
}
