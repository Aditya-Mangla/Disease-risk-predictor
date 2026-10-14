export const DISEASE_API_URL = import.meta.env.VITE_DISEASE_API_URL || 'http://127.0.0.1:5000/predict-disease';
export const BACKEND_TIMEOUT = 15000;
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
const USER_KEY = 'diseaseRiskUser';
const ACCESS_TOKEN_KEY = 'diseaseRiskAccessToken';
const REFRESH_TOKEN_KEY = 'diseaseRiskRefreshToken';

export async function sendBackendRequest(url, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const type = response.headers.get('content-type') || '';
    if (!type.toLowerCase().includes('application/json')) throw new Error('Backend did not return JSON.');
    const data = await response.json();
    if (data === null || data === undefined) throw new Error('Backend returned an empty response.');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Backend timeout');
    if (error instanceof TypeError) throw new Error('Cannot connect to the backend. Start your backend and check the API URL.');
    throw error;
  } finally { clearTimeout(timeout); }
}

async function requestUserRoute(endpoint, { payload, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/users${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot connect to the user backend. Check that the backend is running and the API URL is correct.');
    }
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.toLowerCase().includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.message || `User backend returned ${response.status}.`);
  }
  if (!data || typeof data !== 'object') {
    throw new Error('User backend returned an invalid response.');
  }

  return data;
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function getCurrentUser() {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export async function registerUser({ fullName, email, mobileNumber, password }) {
  const response = await requestUserRoute('/register', {
    payload: { fullName, email, mobileNumber, password },
  });
  if (!response.data?._id) {
    throw new Error('Registration succeeded without returning the created user.');
  }
  return response.data;
}

export async function loginUser(email, password) {
  const response = await requestUserRoute('/login', {
    payload: { email: String(email || '').trim(), password: String(password || '') },
  });
  const { user, accessToken, refreshToken } = response.data || {};
  if (!user || !accessToken) {
    throw new Error('Login succeeded without returning a user and access token.');
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  return user;
}

export async function logout() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    clearUserSession();
    return;
  }

  await requestUserRoute('/logout', { token });
  clearUserSession();
}

function clearUserSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function extractResult(data) {
  if (typeof data === 'string') return { disease: data };
  if (!data || typeof data !== 'object') return null;
  return {
    disease: data.disease ?? data.prediction ?? data.predicted_disease ?? data.predictedDisease ?? data.result ?? null,
    percentage: data.risk_percentage ?? data.riskPercentage ?? data.risk_score ?? data.riskScore ?? data.percentage ?? null,
    level: data.risk_level ?? data.riskLevel ?? data.level ?? data.risk ?? null,
    raw: data
  };
}
