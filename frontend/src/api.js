const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const DISEASE_API_URL = import.meta.env.VITE_DISEASE_API_URL || `${API_BASE_URL}/prediction/disease-prediction`;
export const BACKEND_TIMEOUT = 15000;
const USER_KEY = 'diseaseRiskUser';
const ACCESS_TOKEN_KEY = 'diseaseRiskAccessToken';
const REFRESH_TOKEN_KEY = 'diseaseRiskRefreshToken';

async function requestBackend(url, { method = 'POST', payload } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
      signal: controller.signal
    });
    const type = response.headers.get('content-type') || '';
    const isJson = type.toLowerCase().includes('application/json');
    const data = isJson ? await response.json() : null;
    if (!response.ok) {
      throw new Error(data?.message || `Server returned ${response.status}`);
    }
    if (!isJson) throw new Error('Backend did not return JSON.');
    if (data === null || data === undefined) throw new Error('Backend returned an empty response.');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Backend timeout');
    if (error instanceof TypeError) throw new Error('Cannot reach the backend. Check that it is running, the API URL is correct, and CORS allows this frontend origin.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export function sendBackendRequest(url, payload) {
  return requestBackend(url, { method: 'POST', payload });
}

export function savePrediction(payload) {
  return sendBackendRequest(`${API_BASE_URL}/prediction/create`, payload);
}

export async function getPredictionHistory() {
  const response = await requestBackend(`${API_BASE_URL}/prediction/history`, {
    method: 'GET',
  });
  if (!Array.isArray(response.data)) {
    throw new Error('Backend returned an invalid prediction history.');
  }
  return response.data;
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
      throw new Error('Cannot reach the user backend. Check that it is running, the API URL is correct, and CORS allows this frontend origin.');
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
  const resultData = data && typeof data === 'object' && data.data !== undefined
    ? data.data
    : data;
  if (typeof resultData === 'string') return { disease: resultData };
  if (!resultData || typeof resultData !== 'object') return null;
  return {
    disease: resultData.disease ?? resultData.prediction ?? resultData.predicted_disease ?? resultData.predictedDisease ?? resultData.result ?? null,
    percentage: resultData.risk_percentage ?? resultData.riskPercentage ?? resultData.risk_score ?? resultData.riskScore ?? resultData.percentage ?? null,
    level: resultData.risk_level ?? resultData.riskLevel ?? resultData.level ?? resultData.risk ?? null,
    raw: resultData
  };
}
