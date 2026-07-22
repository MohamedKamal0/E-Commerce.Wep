/**
 * Basket module — cart operations
 */
import { apiFetch, getBasketId, formatPrice, resolveImageUrl, productImageAttrs } from './api.js';
import { normalizeProduct } from './products.js';

/** Fetch basket from API */
export async function getBasket() {
  const id = getBasketId();
  try {
    const basket = await apiFetch(`/api/Basket/${id}`, { auth: false });
    return normalizeBasket(basket);
  } catch (err) {
    if (err.status === 404) {
      return { id, items: [], clientSecret: null, paymentIntentId: null, deliveryMethodId: null, shippingPrice: 0 };
    }
    throw err;
  }
}

/** Create or update basket */
export async function updateBasket(basketData) {
  const result = await apiFetch('/api/Basket', {
    method: 'POST',
    body: basketData,
    auth: false
  });
  return normalizeBasket(result);
}

/** Delete basket */
export async function deleteBasket(id) {
  return apiFetch(`/api/Basket/${id}`, { method: 'DELETE', auth: false });
}

/** Normalize basket response */
export function normalizeBasket(basket) {
  if (!basket) return { id: getBasketId(), items: [] };

  const items = (basket.items || basket.Items || []).map(normalizeBasketItem);

  return {
    id: basket.id || basket.Id,
    items,
    clientSecret: basket.clientSecret || basket.ClientSecret,
    paymentIntentId: basket.paymentIntentId || basket.PaymentIntentId,
    deliveryMethodId: basket.deliveryMethodId ?? basket.DeliveryMethodId,
    shippingPrice: basket.shippingPrice ?? basket.ShippingPrice ?? 0
  };
}

/** Normalize basket item */
export function normalizeBasketItem(item) {
  return {
    id: item.id ?? item.Id,
    productName: item.productName ?? item.ProductName,
    pictureUrl: item.pictureUrl ?? item.PictureUrl,
    price: item.price ?? item.Price,
    quantity: item.quantity ?? item.Quantity
  };
}

/** Add product to basket */
export async function addToCart(product, quantity = 1) {
  const normalized = normalizeProduct(product);
  const basket = await getBasket();

  const existing = basket.items.find((i) => i.id === normalized.id);
  let items;

  if (existing) {
    items = basket.items.map((i) =>
      i.id === normalized.id ? { ...i, quantity: i.quantity + quantity } : i
    );
  } else {
    items = [
      ...basket.items,
      {
        id: normalized.id,
        productName: normalized.name,
        pictureUrl: normalized.pictureUrl,
        price: normalized.price,
        quantity
      }
    ];
  }

  return updateBasket({
    Id: basket.id,
    Items: items.map((i) => ({
      Id: i.id,
      ProductName: i.productName,
      PictureUrl: i.pictureUrl,
      Price: i.price,
      Quantity: i.quantity
    }))
  });
}

/** Update item quantity */
export async function updateItemQuantity(productId, quantity) {
  const basket = await getBasket();

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  const items = basket.items.map((i) =>
    i.id === productId ? { ...i, quantity } : i
  );

  return updateBasket({
    Id: basket.id,
    Items: items.map(toBasketItemDto)
  });
}

/** Remove item from basket */
export async function removeFromCart(productId) {
  const basket = await getBasket();
  const items = basket.items.filter((i) => i.id !== productId);

  return updateBasket({
    Id: basket.id,
    Items: items.map(toBasketItemDto)
  });
}

/** Convert item to DTO format */
function toBasketItemDto(i) {
  return {
    Id: i.id,
    ProductName: i.productName,
    PictureUrl: i.pictureUrl,
    Price: i.price,
    Quantity: i.quantity
  };
}

/** Calculate basket subtotal */
export function getBasketSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Get total item count */
export function getBasketItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Set delivery method on basket */
export async function setDeliveryMethod(deliveryMethodId, shippingPrice) {
  const basket = await getBasket();
  return updateBasket({
    Id: basket.id,
    Items: basket.items.map(toBasketItemDto),
    deliveryMethodId,
    shippingPrice
  });
}

/** Render basket item HTML */
export function renderBasketItemHTML(item) {
  const lineTotal = formatPrice(item.price * item.quantity);

  return `
    <div class="cart-item reveal" data-product-id="${item.id}">
      <div class="cart-item-image">
        <img ${productImageAttrs(item.pictureUrl, item.productName)}>
      </div>
      <div class="cart-item-details">
        <h5 class="cart-item-name">${item.productName}</h5>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
        <div class="quantity-selector sm">
          <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">
            <i class="fas fa-minus"></i>
          </button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" max="100" aria-label="Quantity">
          <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <div class="cart-item-actions">
        <span class="cart-item-total">${lineTotal}</span>
        <button type="button" class="btn-icon remove-item-btn" aria-label="Remove item">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  `;
}

export { formatPrice, resolveImageUrl };
