/**
 * Product details page initialization
 */
import {
  initPage, showToast, initQuantitySelector, renderProductCard,
  bindProductCardEvents, showLoading, observeRevealElements
} from '../ui.js';
import {
  getProductById, normalizeProduct, addRecentlyViewed,
  getRelatedProducts, toggleWishlist, isInWishlist
} from '../products.js';
import { addToCart } from '../basket.js';
import { resolveImageUrl, formatPrice, productImageAttrs } from '../api.js';

async function initProductDetailsPage() {
  await initPage();

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  if (!id) {
    window.location.href = '/pages/shop.html';
    return;
  }

  const container = document.getElementById('productDetail');
  showLoading(container);

  try {
    const product = await getProductById(id);
    const p = normalizeProduct(product);
    addRecentlyViewed(p);

    document.title = `${p.name} — Crochet Atelier`;

    const galleryUrls = p.pictureUrls?.length ? p.pictureUrls : (p.pictureUrl ? [p.pictureUrl] : []);

    container.innerHTML = `
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb-custom">
          <li><a href="/pages/index.html">Home</a></li>
          <li><a href="/pages/shop.html">Shop</a></li>
          <li class="active">${p.name}</li>
        </ol>
      </nav>

      <div class="product-detail-grid reveal">
        <div class="product-gallery">
          <div class="product-gallery-main" id="galleryMain">
            <img ${productImageAttrs(galleryUrls[0], p.name)} id="mainImage">
          </div>
          <div class="product-gallery-thumbs" id="galleryThumbs">
            ${galleryUrls.map((url, i) => `
              <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-src="${resolveImageUrl(url)}">
                <img ${productImageAttrs(url, `View ${i + 1}`)}>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="product-detail-info">
          <span class="product-brand">${p.brandName}</span>
          <h1>${p.name}</h1>
          <div class="product-rating mb-3">
            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
            <span class="rating-count">(32 reviews)</span>
          </div>
          <p class="product-price-lg">${formatPrice(p.price)}</p>

          <div class="product-meta">
            <div class="product-meta-item"><span>Brand</span><strong>${p.brandName}</strong></div>
            <div class="product-meta-item"><span>Type</span><strong>${p.typeName}</strong></div>
            <div class="product-meta-item"><span>Handmade</span><strong>Yes</strong></div>
          </div>

          <p class="product-description">${p.description || 'A beautifully handcrafted crochet bag, made with premium yarn and meticulous attention to detail. Each piece is unique, carrying the warmth and artistry of traditional crochet craftsmanship.'}</p>

          <div class="product-actions">
            <div class="quantity-selector">
              <button type="button" class="qty-btn qty-minus"><i class="fas fa-minus"></i></button>
              <input type="number" class="qty-input" id="qtyInput" value="1" min="1" max="100">
              <button type="button" class="qty-btn qty-plus"><i class="fas fa-plus"></i></button>
            </div>
            <button type="button" class="btn btn-primary btn-lg" id="addToCartBtn">
              <i class="fas fa-shopping-bag me-2"></i>Add to Cart
            </button>
            <button type="button" class="btn btn-outline btn-lg wishlist-btn-detail ${isInWishlist(p.id) ? 'active' : ''}" id="wishlistBtn">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    initGallery();
    initQuantitySelector(container.querySelector('.quantity-selector'));

    document.getElementById('addToCartBtn').addEventListener('click', async () => {
      const qty = parseInt(document.getElementById('qtyInput').value) || 1;
      try {
        await addToCart(p, qty);
        showToast(`${p.name} added to cart!`, 'success');
        const { renderNavbar } = await import('../ui.js');
        await renderNavbar();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('wishlistBtn').addEventListener('click', () => {
      const added = toggleWishlist(p);
      document.getElementById('wishlistBtn').classList.toggle('active', added);
      showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
    });

    observeRevealElements(container);

    // Related products
    loadRelatedProducts(p);
    loadRecentlyViewed(p.id);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h4>Product Not Found</h4>
        <p>${err.message}</p>
        <a href="/pages/shop.html" class="btn btn-primary">Back to Shop</a>
      </div>
    `;
  }
}

function initGallery() {
  document.querySelectorAll('.gallery-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.gallery-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      document.getElementById('mainImage').src = thumb.dataset.src;
    });
  });
}

async function loadRelatedProducts(currentProduct) {
  const grid = document.getElementById('relatedProducts');
  if (!grid) return;

  try {
    const related = await getRelatedProducts(currentProduct.typeName, currentProduct.id, 4);
    if (related.length === 0) {
      document.getElementById('relatedSection').style.display = 'none';
      return;
    }
    grid.innerHTML = related.map((p) => renderProductCard(p)).join('');
    bindProductCardEvents(grid, async (id) => {
      const { getProductById: getProd } = await import('../products.js');
      const product = await getProd(id);
      await addToCart(product);
      showToast('Added to cart!', 'success');
    });
    observeRevealElements(grid);
  } catch {
    document.getElementById('relatedSection').style.display = 'none';
  }
}

function loadRecentlyViewed(excludeId) {
  const grid = document.getElementById('recentlyViewed');
  const section = document.getElementById('recentSection');
  if (!grid) return;

  import('../products.js').then(({ getRecentlyViewed }) => {
    const items = getRecentlyViewed().filter((p) => p.id !== excludeId).slice(0, 4);
    if (items.length === 0) {
      section.style.display = 'none';
      return;
    }
    grid.innerHTML = items.map((p) => renderProductCard(p, { quickView: false })).join('');
    bindProductCardEvents(grid);
    observeRevealElements(grid);
  });
}

document.addEventListener('DOMContentLoaded', initProductDetailsPage);
