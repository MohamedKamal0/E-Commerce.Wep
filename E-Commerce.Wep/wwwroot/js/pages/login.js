/**
 * Login page initialization
 */
import { initPage, showToast, validateEmail, validatePassword, showFieldError, clearFieldError } from '../ui.js';
import { login } from '../auth.js';
import { isAuthenticated } from '../api.js';

async function initLoginPage() {
  await initPage();

  if (isAuthenticated()) {
    window.location.href = '/pages/profile.html';
    return;
  }

  const form = document.getElementById('loginForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    let valid = true;

    clearFieldError(document.getElementById('email'));
    clearFieldError(document.getElementById('password'));

    if (!validateEmail(email)) {
      showFieldError(document.getElementById('email'), 'Please enter a valid email');
      valid = false;
    }
    if (!validatePassword(password)) {
      showFieldError(document.getElementById('password'), 'Password must be at least 6 characters');
      valid = false;
    }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing in...';

    try {
      await login(email, password);
      showToast('Welcome back!', 'success');

      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl') || '/pages/index.html';
      setTimeout(() => { window.location.href = returnUrl; }, 800);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  });
}

document.addEventListener('DOMContentLoaded', initLoginPage);
