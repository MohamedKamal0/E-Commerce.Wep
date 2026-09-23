/**
 * Checkout page initialization
 */
import { initPage, showToast, showFieldError, clearFieldError } from '../ui.js';
import { requireAuth } from '../auth.js';
import {
  getBasket, getBasketSubtotal, setDeliveryMethod, formatPrice
} from '../basket.js';
import { getDeliveryMethods, createOrder, normalizeDeliveryMethod } from '../orders.js';
import { createPaymentIntent, loadStripeScript, initStripe, confirmPayment } from '../payment.js';
import { getBasketId, resetBasketId, escapeHtml } from '../api.js';

let selectedDeliveryId = null;
let stripeInstance = null;
let elementsInstance = null;

async function initCheckoutPage() {
  await initPage();

  if (!requireAuth('/pages/checkout.html')) return;

  await loadCheckout();
  bindEvents();
}

async function loadCheckout() {
  try {
    const basket = await getBasket();

    if (!basket.items.length) {
      window.location.href = '/pages/cart.html';
      return;
    }

    const subtotal = getBasketSubtotal(basket.items);
    document.getElementById('checkoutSubtotal').textContent = formatPrice(subtotal);
    document.getElementById('checkoutTotal').textContent = formatPrice(subtotal);

    const itemsHTML = basket.items.map((item) => `
      <div class="summary-row">
        <span>${escapeHtml(item.productName)} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');
    document.getElementById('checkoutItems').innerHTML = itemsHTML;

    await loadDeliveryMethods();

    try {
      const { getCurrentUserAddress } = await import('../auth.js');
      const address = await getCurrentUserAddress();
      if (address) {
        document.getElementById('firstName').value = address.fristName || address.FristName || '';
        document.getElementById('lastName').value = address.lastName || address.LastName || '';
        document.getElementById('street').value = address.street || address.Street || '';
        document.getElementById('city').value = address.city || address.City || '';
      }
    } catch {
      // No saved address
    }
  } catch (err) {
    showToast(err.message || 'Could not load checkout', 'error');
    document.getElementById('deliveryMethods').innerHTML = `
      <div class="alert alert-danger mb-0">
        Could not load checkout. ${escapeHtml(err.message || 'Please refresh the page.')}
      </div>
    `;
  }
}

async function loadDeliveryMethods() {
  const container = document.getElementById('deliveryMethods');
  if (!container) return;

  container.innerHTML = '<p class="text-muted mb-0"><i class="fas fa-spinner fa-spin me-2"></i>Loading delivery options...</p>';

  try {
    const methods = await getDeliveryMethods();
    const list = Array.isArray(methods) ? methods : [];

    if (!list.length) {
      container.innerHTML = `
        <div class="empty-state py-3">
          <p class="text-muted mb-2">No delivery options are available right now.</p>
          <button type="button" class="btn btn-outline btn-sm" id="retryDeliveryBtn">Try Again</button>
        </div>
      `;
      document.getElementById('retryDeliveryBtn')?.addEventListener('click', loadDeliveryMethods);
      return;
    }

    container.innerHTML = list.map((m) => {
      const dm = normalizeDeliveryMethod(m);
      return `
        <label class="delivery-option" data-id="${dm.id}" data-price="${dm.price}">
          <input type="radio" name="delivery" value="${dm.id}">
          <div class="delivery-option-info">
            <h6>${escapeHtml(dm.shortName)}</h6>
            <p>${escapeHtml(dm.description)} · ${escapeHtml(dm.deliveryTime)}</p>
          </div>
          <span class="delivery-option-price">${formatPrice(dm.price)}</span>
        </label>
      `;
    }).join('');

    container.querySelectorAll('.delivery-option').forEach((opt) => {
      opt.addEventListener('click', () => selectDelivery(opt));
    });

    if (list.length === 1) {
      await selectDelivery(container.querySelector('.delivery-option'));
    }
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger mb-0">
        Could not load delivery options. ${escapeHtml(err.message || 'Please try again.')}
        <button type="button" class="btn btn-sm btn-outline-danger ms-2" id="retryDeliveryBtn">Retry</button>
      </div>
    `;
    document.getElementById('retryDeliveryBtn')?.addEventListener('click', loadDeliveryMethods);
    showToast('Could not load delivery methods. ' + err.message, 'error');
  }
}

async function selectDelivery(optionEl) {
  if (!optionEl) return;

  document.querySelectorAll('.delivery-option').forEach((o) => o.classList.remove('selected'));
  optionEl.classList.add('selected');
  optionEl.querySelector('input').checked = true;

  selectedDeliveryId = parseInt(optionEl.dataset.id, 10);
  const shippingPrice = parseFloat(optionEl.dataset.price);

  document.getElementById('checkoutShipping').textContent = formatPrice(shippingPrice);

  const basket = await getBasket();
  const subtotal = getBasketSubtotal(basket.items);
  document.getElementById('checkoutTotal').textContent = formatPrice(subtotal + shippingPrice);

  await setDeliveryMethod(selectedDeliveryId, shippingPrice);
}

function bindEvents() {
  document.getElementById('checkoutForm')?.addEventListener('submit', handleCheckout);
}

async function handleCheckout(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const street = document.getElementById('street').value.trim();
  const city = document.getElementById('city').value.trim();

  let valid = true;
  ['firstName', 'lastName', 'street', 'city'].forEach((id) => {
    const el = document.getElementById(id);
    clearFieldError(el);
    if (!el.value.trim()) {
      showFieldError(el, 'This field is required');
      valid = false;
    }
  });

  if (!selectedDeliveryId) {
    showToast('Please select a delivery method', 'warning');
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

  try {
    const basketId = getBasketId();

    const paymentBasket = await createPaymentIntent(basketId);
    const clientSecret = paymentBasket.clientSecret || paymentBasket.ClientSecret;

    if (!clientSecret) {
      throw new Error('Could not initialize payment');
    }

    await loadStripeScript();

    if (!stripeInstance) {
      const { stripe, elements, paymentElement } = await initStripe(clientSecret);
      stripeInstance = stripe;
      elementsInstance = elements;
      paymentElement.mount('#payment-element');
    }

    await confirmPayment(stripeInstance, elementsInstance);

    await createOrder({
      basketId,
      deliveryMethodId: selectedDeliveryId,
      address: { firstName, lastName, street, city }
    });

    resetBasketId();
    showToast('Order placed successfully!', 'success');
    setTimeout(() => { window.location.href = '/pages/orders.html?success=true'; }, 1000);
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock me-2"></i>Pay Now';
  }
}

document.addEventListener('DOMContentLoaded', initCheckoutPage);
