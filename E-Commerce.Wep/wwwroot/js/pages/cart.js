/**
 * Cart page initialization
 */
import { initPage, showToast, renderEmptyState, renderNavbar, observeRevealElements } from '../ui.js';
import {
  getBasket, updateItemQuantity, removeFromCart,
  getBasketSubtotal, renderBasketItemHTML, formatPrice
} from '../basket.js';

async function initCartPage() {
  await initPage();
  await loadCart();
}

async function loadCart() {
  const itemsContainer = document.getElementById('cartItems');
  const summaryContainer = document.getElementById('cartSummary');
  const layout = document.getElementById('cartLayout');

  try {
    const basket = await getBasket();

    if (!basket.items.length) {
      layout.innerHTML = renderEmptyState(
        'fa-shopping-bag',
        'Your Cart is Empty',
        'Discover our beautiful handmade crochet bags and find your perfect piece.',
        '<a href="/pages/shop.html" class="btn btn-primary">Shop Collection</a>'
      );
      return;
    }

    itemsContainer.innerHTML = basket.items.map(renderBasketItemHTML).join('');
    observeRevealElements(itemsContainer);

    const subtotal = getBasketSubtotal(basket.items);

    summaryContainer.innerHTML = `
      <h4>Order Summary</h4>
      <div class="summary-row"><span>Subtotal (${basket.items.length} items)</span><span id="subtotal">${formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(subtotal)}</span></div>
      <a href="/pages/checkout.html" class="btn btn-primary w-100 mt-4">Proceed to Checkout</a>
      <a href="/pages/shop.html" class="btn btn-outline w-100 mt-3">Continue Shopping</a>
    `;

    bindCartEvents(basket);
  } catch (err) {
    itemsContainer.innerHTML = `<p class="text-muted">${err.message}</p>`;
  }
}

function bindCartEvents(basket) {
  document.querySelectorAll('.cart-item').forEach((itemEl) => {
    const productId = parseInt(itemEl.dataset.productId);
    const input = itemEl.querySelector('.qty-input');

    itemEl.querySelector('.qty-minus')?.addEventListener('click', async () => {
      const qty = Math.max(1, parseInt(input.value) - 1);
      input.value = qty;
      await updateQty(productId, qty);
    });

    itemEl.querySelector('.qty-plus')?.addEventListener('click', async () => {
      const qty = Math.min(100, parseInt(input.value) + 1);
      input.value = qty;
      await updateQty(productId, qty);
    });

    input?.addEventListener('change', async () => {
      let qty = parseInt(input.value) || 1;
      qty = Math.max(1, Math.min(100, qty));
      input.value = qty;
      await updateQty(productId, qty);
    });

    itemEl.querySelector('.remove-item-btn')?.addEventListener('click', async () => {
      try {
        await removeFromCart(productId);
        showToast('Item removed from cart', 'info');
        await loadCart();
        await renderNavbar();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

async function updateQty(productId, quantity) {
  try {
    await updateItemQuantity(productId, quantity);
    await loadCart();
    await renderNavbar();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', initCartPage);
