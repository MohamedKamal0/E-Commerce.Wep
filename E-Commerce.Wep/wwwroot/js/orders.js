/**
 * Orders module — order history, details, delivery methods
 */
import { apiFetch, formatPrice, resolveImageUrl, productImageAttrs } from './api.js';

/** Get all delivery methods */
export async function getDeliveryMethods() {
  return apiFetch('/api/Order/GetAllDeliverymethod');
}

/** Create order after payment */
export async function createOrder(orderData) {
  return apiFetch('/api/Order/CreateOrder', {
    method: 'POST',
    body: {
      BasketId: orderData.basketId,
      DeliveryMethodId: orderData.deliveryMethodId,
      address: {
        FirstName: orderData.address.firstName,
        LastName: orderData.address.lastName,
        Street: orderData.address.street,
        City: orderData.address.city
      }
    }
  });
}

/** Get all orders for current user */
export async function getAllOrders() {
  return apiFetch('/api/Order/GetAllOrders');
}

/** Get order by ID */
export async function getOrderById(id) {
  return apiFetch(`/api/Order/${id}`);
}

/** Normalize order object */
export function normalizeOrder(order) {
  if (!order) return null;

  const items = (order.items || order.Items || []).map((item) => ({
    productName: item.productName ?? item.ProductName,
    pictureUrl: item.pictureUrl ?? item.PictureUrl,
    price: item.price ?? item.Price,
    quantity: item.quantity ?? item.Quantity
  }));

  const address = order.address || order.Address || {};

  return {
    id: order.id ?? order.Id,
    userEmail: order.userEmail ?? order.UserEmail,
    orderDate: order.orderDate ?? order.OrderDate,
    address: {
      firstName: address.firstName ?? address.FirstName,
      lastName: address.lastName ?? address.LastName,
      street: address.street ?? address.Street,
      city: address.city ?? address.City
    },
    deliveryMethod: order.deliveryMethod ?? order.DeliveryMethod,
    status: order.status ?? order.Status,
    items,
    subtotal: order.subtotal ?? order.Subtotal,
    total: order.total ?? order.Total
  };
}

/** Normalize delivery method */
export function normalizeDeliveryMethod(method) {
  return {
    id: method.id ?? method.Id,
    shortName: method.shortName ?? method.ShortName,
    description: method.description ?? method.Description,
    deliveryTime: method.deliveryTime ?? method.DeliveryTime,
    price: method.price ?? method.Price
  };
}

/** Format order date */
export function formatOrderDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/** Render order card HTML */
export function renderOrderCardHTML(order) {
  const normalized = normalizeOrder(order);
  const itemCount = normalized.items.reduce((s, i) => s + i.quantity, 0);

  return `
    <div class="order-card reveal" data-order-id="${normalized.id}">
      <div class="order-card-header">
        <div>
          <span class="order-id">Order #${String(normalized.id).slice(0, 8).toUpperCase()}</span>
          <span class="order-date">${formatOrderDate(normalized.orderDate)}</span>
        </div>
        <span class="order-status status-${normalized.status?.toLowerCase()}">${normalized.status}</span>
      </div>
      <div class="order-card-body">
        <p>${itemCount} item${itemCount !== 1 ? 's' : ''} · ${normalized.deliveryMethod}</p>
        <p class="order-total">${formatPrice(normalized.total)}</p>
      </div>
      <div class="order-card-footer">
        <button type="button" class="btn btn-outline btn-sm view-order-btn">View Details</button>
      </div>
    </div>
  `;
}

/** Render order detail HTML */
export function renderOrderDetailHTML(order) {
  const normalized = normalizeOrder(order);

  const itemsHTML = normalized.items
    .map(
      (item) => `
      <div class="order-detail-item">
        <img ${productImageAttrs(item.pictureUrl, item.productName)}>
        <div>
          <h6>${item.productName}</h6>
          <p>Qty: ${item.quantity} × ${formatPrice(item.price)}</p>
        </div>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `
    )
    .join('');

  return `
    <div class="order-detail">
      <div class="order-detail-header">
        <h4>Order #${String(normalized.id).slice(0, 8).toUpperCase()}</h4>
        <span class="order-status status-${normalized.status?.toLowerCase()}">${normalized.status}</span>
      </div>
      <p class="text-muted">${formatOrderDate(normalized.orderDate)}</p>
      <div class="order-detail-section">
        <h6>Shipping Address</h6>
        <p>${normalized.address.firstName} ${normalized.address.lastName}<br>
        ${normalized.address.street}<br>
        ${normalized.address.city}</p>
      </div>
      <div class="order-detail-section">
        <h6>Delivery</h6>
        <p>${normalized.deliveryMethod}</p>
      </div>
      <div class="order-detail-items">${itemsHTML}</div>
      <div class="order-detail-summary">
        <div class="summary-row"><span>Subtotal</span><span>${formatPrice(normalized.subtotal)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatPrice(normalized.total)}</span></div>
      </div>
    </div>
  `;
}
