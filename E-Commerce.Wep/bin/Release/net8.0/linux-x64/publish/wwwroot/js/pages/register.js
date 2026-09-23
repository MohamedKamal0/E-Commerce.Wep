/**
 * Register page initialization
 */
import {
  initPage, showToast, validateEmail, validatePassword,
  showFieldError, clearFieldError
} from '../ui.js';
import { register, checkEmail } from '../auth.js';
import { isAuthenticated } from '../api.js';

async function initRegisterPage() {
  await initPage();

  if (isAuthenticated()) {
    window.location.href = '/pages/profile.html';
    return;
  }

  const form = document.getElementById('registerForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const displayName = document.getElementById('displayName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let valid = true;
    ['displayName', 'email', 'phone', 'password', 'confirmPassword'].forEach((id) => {
      clearFieldError(document.getElementById(id));
    });

    if (!displayName) {
      showFieldError(document.getElementById('displayName'), 'Name is required');
      valid = false;
    }
    if (!validateEmail(email)) {
      showFieldError(document.getElementById('email'), 'Please enter a valid email');
      valid = false;
    }
    if (!phone) {
      showFieldError(document.getElementById('phone'), 'Phone number is required');
      valid = false;
    }
    if (!validatePassword(password)) {
      showFieldError(document.getElementById('password'), 'Password must be at least 6 characters');
      valid = false;
    }
    if (password !== confirmPassword) {
      showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
      valid = false;
    }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating account...';

    try {
      const emailExists = await checkEmail(email);
      if (emailExists) {
        showFieldError(document.getElementById('email'), 'This email is already registered');
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
        return;
      }

      await register({ displayName, email, phone, password });
      showToast('Account created successfully!', 'success');
      setTimeout(() => { window.location.href = '/pages/index.html'; }, 800);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = 'Create Account';
    }
  });
}

document.addEventListener('DOMContentLoaded', initRegisterPage);
