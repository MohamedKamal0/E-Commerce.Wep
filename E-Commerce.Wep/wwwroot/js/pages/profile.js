/**
 * Profile page initialization
 */
import { initPage, showToast, showFieldError, clearFieldError } from '../ui.js';
import {
  requireAuth, getCurrentUser, getCurrentUserAddress, updateUserAddress
} from '../auth.js';

async function initProfilePage() {
  await initPage();

  if (!requireAuth('/pages/profile.html')) return;

  await loadProfile();
  bindEvents();
}

async function loadProfile() {
  try {
    const [user, address] = await Promise.all([
      getCurrentUser(),
      getCurrentUserAddress().catch(() => null)
    ]);

    const displayName = user.displayName || user.DisplayName || 'User';
    const email = user.email || user.Email || '';
    const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    document.getElementById('profileName').textContent = displayName;
    document.getElementById('profileEmail').textContent = email;
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('infoDisplayName').textContent = displayName;
    document.getElementById('infoEmail').textContent = email;

    if (address) {
      document.getElementById('firstName').value = address.fristName || address.FristName || '';
      document.getElementById('lastName').value = address.lastName || address.LastName || '';
      document.getElementById('street').value = address.street || address.Street || '';
      document.getElementById('city').value = address.city || address.City || '';
      document.getElementById('country').value = address.country || address.Country || '';
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function bindEvents() {
  document.getElementById('addressForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = ['firstName', 'lastName', 'street', 'city'];
    let valid = true;

    fields.forEach((id) => {
      const el = document.getElementById(id);
      clearFieldError(el);
      if (!el.value.trim()) {
        showFieldError(el, 'Required');
        valid = false;
      }
    });
    if (!valid) return;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      await updateUserAddress({
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        street: document.getElementById('street').value.trim(),
        city: document.getElementById('city').value.trim(),
        country: document.getElementById('country').value.trim()
      });
      showToast('Address updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', initProfilePage);
