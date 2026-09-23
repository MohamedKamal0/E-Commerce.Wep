/**
 * Payment module — Stripe integration
 */
import { apiFetch, getBasketId } from './api.js';
import { CONFIG } from './config.js';

/** Create or update payment intent for basket */
export async function createPaymentIntent(basketId) {
  const id = basketId || getBasketId();
  return apiFetch(`/api/Payment/${id}`, { method: 'POST', auth: false });
}

/** Initialize Stripe Elements */
export async function initStripe(clientSecret) {
  if (!window.Stripe) {
    throw new Error('Stripe.js not loaded');
  }

  const stripe = window.Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY);
  const elements = stripe.elements({ clientSecret });

  const paymentElement = elements.create('payment', {
    layout: 'tabs',
    appearance: {
      theme: document.documentElement.dataset.theme === 'dark' ? 'night' : 'stripe',
      variables: {
        colorPrimary: '#D58C8C',
        colorBackground: document.documentElement.dataset.theme === 'dark' ? '#2A2625' : '#FFFDFC',
        colorText: '#3E3A39',
        borderRadius: '12px',
        fontFamily: 'Poppins, sans-serif'
      }
    }
  });

  return { stripe, elements, paymentElement };
}

/** Confirm Stripe payment */
export async function confirmPayment(stripe, elements, returnUrl) {
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: returnUrl || `${window.location.origin}/pages/orders.html?payment=success`
    },
    redirect: 'if_required'
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

/** Load Stripe.js script dynamically */
export function loadStripeScript() {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => resolve(window.Stripe);
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.head.appendChild(script);
  });
}
