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
import { getBasketId, resetBasketId } from '../api.js';

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
  const basket = await getBasket();

  if (!basket.items.length) {
    window.location.href = '/pages/cart.html';
    return;
  }

  const subtotal = getBasketSubtotal(basket.items);
  document.getElementById('checkoutSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('checkoutTotal').textContent = formatPrice(subtotal);

  // Render order items
  const itemsHTML = basket.items.map((item) => `
    <div class="summary-row">
      <span>${item.productName} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');
  document.getElementById('checkoutItems').innerHTML = itemsHTML;

  // Load delivery methods
  try {
    const methods = await getDeliveryMethods();
    const container = document.getElementById('deliveryMethods');
    container.innerHTML = methods.map((m) => {
      const dm = normalizeDeliveryMethod(m);
      return `
        <label class="delivery-option" data-id="${dm.id}" data-price="${dm.price}">
          <input type="radio" name="delivery" value="${dm.id}">
          <div class="delivery-option-info">
            <h6>${dm.shortName}</h6>
            <p>${dm.description} · ${dm.deliveryTime}</p>
          </div>
          <span class="delivery-option-price">${formatPrice(dm.price)}</span>
        </label>
      `;
    }).join('');

    container.querySelectorAll('.delivery-option').forEach((opt) => {
      opt.addEventListener('click', () => selectDelivery(opt));
    });
  } catch (err) {
    showToast('Could not load delivery methods. ' + err.message, 'error');
  }

  // Pre-fill address if available
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
}

async function selectDelivery(optionEl) {
  document.querySelectorAll('.delivery-option').forEach((o) => o.classList.remove('selected'));
  optionEl.classList.add('selected');
  optionEl.querySelector('input').checked = true;

  selectedDeliveryId = parseInt(optionEl.dataset.id);
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

    // Create payment intent
    const paymentBasket = await createPaymentIntent(basketId);
    const clientSecret = paymentBasket.clientSecret || paymentBasket.ClientSecret;

    if (!clientSecret) {
      throw new Error('Could not initialize payment');
    }

    // Initialize Stripe if not already
    await loadStripeScript();

    if (!stripeInstance) {
      const { stripe, elements, paymentElement } = await initStripe(clientSecret);
      stripeInstance = stripe;
      elementsInstance = elements;
      paymentElement.mount('#payment-element');
    }

    // Confirm payment
    await confirmPayment(stripeInstance, elementsInstance);

    // Create order
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
