/**
 * API module — base URL, fetch wrapper, JWT handling, error handling
 */
import { CONFIG } from './config.js';

/** Get stored JWT token */
export function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

/** Store JWT token */
export function setToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

/** Get stored user info */
export function getStoredUser() {
  const raw = localStorage.getItem(CONFIG.USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Store user info */
export function setStoredUser(user) {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

/** Clear authentication data */
export function clearAuth() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.USER_KEY);
}

/** Get or create basket ID */
export function getBasketId() {
  let id = localStorage.getItem(CONFIG.BASKET_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CONFIG.BASKET_ID_KEY, id);
  }
  return id;
}

/** Reset basket ID (after successful order) */
export function resetBasketId() {
  const newId = crypto.randomUUID();
  localStorage.setItem(CONFIG.BASKET_ID_KEY, newId);
  return newId;
}

/** Check if user is authenticated */
export function isAuthenticated() {
  return !!getToken();
}

/** Resolve product image URL to an absolute same-origin path */
export function resolveImageUrl(url, options = {}) {
  const { placeholder = true } = options;

  if (!url || String(url).trim() === '') {
    return placeholder ? CONFIG.PLACEHOLDER_IMAGE : '';
  }

  const trimmed = String(url).trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Normalize relative paths (handle missing leading slash and Windows separators)
  const path = trimmed.startsWith('/')
    ? trimmed
    : `/${trimmed.replace(/\\/g, '/')}`;

  const base = (CONFIG.API_BASE || window.location.origin).replace(/\/$/, '');
  return `${base}${path}`;
}

/** HTML-escape for safe use inside attributes and text nodes */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Standard img attributes with optional broken-image fallback */
export function productImageAttrs(url, alt = '', options = {}) {
  const usePlaceholder = options.usePlaceholder !== false;
  const src = resolveImageUrl(url, { placeholder: usePlaceholder });

  if (!src) {
    return `alt="${escapeHtml(alt)}" role="presentation"`;
  }

  const placeholder = escapeHtml(CONFIG.PLACEHOLDER_IMAGE);
  const onerror = usePlaceholder
    ? ` onerror="this.onerror=null;this.src='${placeholder}'"`
    : ' onerror="this.style.display=\'none\'"';

  return `src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy"${onerror}`;
}

/** Format price as currency */
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount ?? 0);
}

/**
 * Core fetch wrapper with JWT and error handling
 * @param {string} endpoint - API endpoint (e.g. /api/Product)
 * @param {object} options - fetch options; set auth: false to skip token
 */
export async function apiFetch(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: 'application/json',
    ...options.headers
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.auth !== false && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...options
  };

  if (options.body instanceof FormData) {
    config.body = options.body;
  } else if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  delete config.auth;

  const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { ErrorMessage: response.statusText || 'Request failed' };
    }

    const message =
      errorData.ErrorMessage ||
      errorData.errorMessage ||
      (errorData.ValidationErrors &&
        errorData.ValidationErrors.map((v) => v.Errors?.join(', ')).join('; ')) ||
      (errorData.Errores && errorData.Errores.join(', ')) ||
      'Something went wrong';

    const error = new Error(message);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
