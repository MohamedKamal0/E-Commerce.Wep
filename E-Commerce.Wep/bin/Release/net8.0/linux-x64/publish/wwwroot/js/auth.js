/**
 * Authentication module — login, register, logout, profile
 */
import { apiFetch, setToken, setStoredUser, clearAuth, getStoredUser, isAuthenticated } from './api.js';

/** Login user */
export async function login(email, password) {
  const result = await apiFetch('/api/Authentication/login', {
    method: 'POST',
    body: { Email: email, Password: password },
    auth: false
  });

  setToken(result.token || result.Token);
  setStoredUser({
    email: result.email || result.Email,
    displayName: result.displayName || result.DisplayName
  });

  return result;
}

/** Register new user */
export async function register({ displayName, email, phone, password, userName }) {
  const result = await apiFetch('/api/Authentication/register', {
    method: 'POST',
    body: {
      DisplayName: displayName,
      Email: email,
      phoneNumber: phone,
      Password: password,
      UserName: userName || email.split('@')[0]
    },
    auth: false
  });

  setToken(result.token || result.Token);
  setStoredUser({
    email: result.email || result.Email,
    displayName: result.displayName || result.DisplayName
  });

  return result;
}

/** Check if email is available */
export async function checkEmail(email) {
  return apiFetch(`/api/Authentication/CheckEmail?email=${encodeURIComponent(email)}`, {
    auth: false
  });
}

/** Get current user profile */
export async function getCurrentUser() {
  return apiFetch('/api/Authentication/CurrentUsre');
}

/** Get current user address */
export async function getCurrentUserAddress() {
  return apiFetch('/api/Authentication/CurrentUsreAddress');
}

/** Update user address */
export async function updateUserAddress(address) {
  return apiFetch('/api/Authentication/Addresss', {
    method: 'POST',
    body: {
      FristName: address.firstName,
      LastName: address.lastName,
      City: address.city,
      Country: address.country || '',
      Street: address.street
    }
  });
}

/** Logout user */
export function logout() {
  clearAuth();
  window.location.href = '/pages/login.html';
}

/** Redirect to login if not authenticated */
export function requireAuth(redirectUrl) {
  if (!isAuthenticated()) {
    const returnUrl = redirectUrl || window.location.pathname;
    window.location.href = `/pages/login.html?returnUrl=${encodeURIComponent(returnUrl)}`;
    return false;
  }
  return true;
}

/** Get display name from storage or API */
export async function getUserDisplayName() {
  const stored = getStoredUser();
  if (stored?.displayName) return stored.displayName;

  if (isAuthenticated()) {
    try {
      const user = await getCurrentUser();
      const name = user.displayName || user.DisplayName;
      setStoredUser({ ...stored, displayName: name, email: user.email || user.Email });
      return name;
    } catch {
      return 'Account';
    }
  }

  return null;
}
