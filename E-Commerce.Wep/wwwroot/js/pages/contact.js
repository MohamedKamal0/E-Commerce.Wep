/**
 * Contact page initialization
 */
import { initPage, showToast } from '../ui.js';

async function initContactPage() {
  await initPage();

  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you! We will get back to you soon.', 'success');
    e.target.reset();
  });
}

document.addEventListener('DOMContentLoaded', initContactPage);
