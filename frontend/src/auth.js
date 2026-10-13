const USER_KEY = 'diseaseRiskUser';
const LOGIN_KEY = 'diseaseRiskLoggedIn';
const ACCESS_TOKEN_KEY = 'diseaseRiskAccessToken';
const REFRESH_TOKEN_KEY = 'diseaseRiskRefreshToken';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function requestAuth(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Authentication failed. Please try again.');
  }

  return data;
}

export function isLoggedIn() {
  return localStorage.getItem(LOGIN_KEY) === 'true';
}

export function getCurrentUser() {
  return getStoredUser();
}

export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/users/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Ignore logout failures and clear local auth state anyway.
  }

  localStorage.removeItem(LOGIN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function registerUser(user) {
  const source = user && typeof user === 'object' ? user : {};
  const payload = {
    fullName: source.fullName || source.name || '',
    email: source.email || '',
    mobileNumber: source.mobileNumber || source.phone || '',
    password: source.password || '',
  };

  const result = await requestAuth('/users/register', payload);
  const userData = result?.data || result?.user || null;

  if (userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  if (result?.data?.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
  }
  if (result?.data?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
  }

  localStorage.setItem(LOGIN_KEY, 'true');
  return true;
}

export async function loginUser(email, password) {
  const result = await requestAuth('/users/login', {
    email: String(email || '').trim(),
    password: String(password || ''),
  });

  const userData = result?.data?.user || result?.user || null;
  if (userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  if (result?.data?.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
  }
  if (result?.data?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
  }

  localStorage.setItem(LOGIN_KEY, 'true');
  return true;
}
