/**
 * Orders page initialization
 */
import { initPage, showToast, renderEmptyState } from '../ui.js';
import { requireAuth } from '../auth.js';
import {
  getAllOrders, getOrderById, renderOrderCardHTML, renderOrderDetailHTML, normalizeOrder
} from '../orders.js';

async function initOrdersPage() {
  await initPage();

  if (!requireAuth('/pages/orders.html')) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    showToast('Your order has been placed successfully!', 'success');
  }
  if (params.get('payment') === 'success') {
    showToast('Payment completed!', 'success');
  }

  await loadOrders();
}

async function loadOrders() {
  const container = document.getElementById('ordersList');

  try {
    const orders = await getAllOrders();
    const normalized = (Array.isArray(orders) ? orders : []).map(normalizeOrder);

    if (!normalized.length) {
      container.innerHTML = renderEmptyState(
        'fa-box-open',
        'No Orders Yet',
        'When you place an order, it will appear here.',
        '<a href="/pages/shop.html" class="btn btn-primary">Start Shopping</a>'
      );
      return;
    }

    container.innerHTML = normalized.map((o) => renderOrderCardHTML(o)).join('');
    bindOrderEvents();
  } catch (err) {
    container.innerHTML = `<p class="text-muted text-center">${err.message}</p>`;
  }
}

function bindOrderEvents() {
  document.querySelectorAll('.view-order-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const orderId = btn.closest('.order-card').dataset.orderId;
      try {
        const order = await getOrderById(orderId);
        showOrderModal(order);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

function showOrderModal(order) {
  let modal = document.getElementById('orderDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'orderDetailModal';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">Order Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">${renderOrderDetailHTML(order)}</div>
      </div>
    </div>
  `;

  new bootstrap.Modal(modal).show();
}

document.addEventListener('DOMContentLoaded', initOrdersPage);
