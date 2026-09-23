/**
 * Product details page — multi-image gallery with thumbnails and prev/next navigation
 */
import {
  initPage, showToast, initQuantitySelector, renderProductCard,
  bindProductCardEvents, showLoading, observeRevealElements
} from '../ui.js';
import {
  getProductById, normalizeProduct, getProductImages, addRecentlyViewed,
  getRelatedProducts, toggleWishlist, isInWishlist
} from '../products.js';
import { addToCart } from '../basket.js';
import { resolveImageUrl, formatPrice, productImageAttrs, escapeHtml } from '../api.js';

async function initProductDetailsPage() {
  await initPage();

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);

  if (!id) {
    window.location.href = '/pages/shop.html';
    return;
  }

  const container = document.getElementById('productDetail');
  showLoading(container);

  try {
    const product = await getProductById(id);
    const p = normalizeProduct(product);
    const images = getProductImages(product);
    addRecentlyViewed(p);

    document.title = `${p.name} — Crochet Atelier`;

    container.innerHTML = `
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb-custom">
          <li><a href="/pages/index.html">Home</a></li>
          <li><a href="/pages/shop.html">Shop</a></li>
          <li class="active">${escapeHtml(p.name)}</li>
        </ol>
      </nav>

      <div class="product-detail-grid reveal">
        ${renderGalleryMarkup(images, p.name)}
        ${renderProductInfoMarkup(p)}
      </div>
    `;

    initProductGallery(images);
    initQuantitySelector(container.querySelector('.quantity-selector'));

    document.getElementById('addToCartBtn').addEventListener('click', async () => {
      const qty = parseInt(document.getElementById('qtyInput').value, 10) || 1;
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
    loadRelatedProducts(p);
    loadRecentlyViewed(p.id);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h4>Product Not Found</h4>
        <p>${escapeHtml(err.message)}</p>
        <a href="/pages/shop.html" class="btn btn-primary">Back to Shop</a>
      </div>
    `;
  }
}

function renderGalleryMarkup(images, productName) {
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;
  const initialUrl = hasImages ? images[0].imageUrl : '';
  const safeName = escapeHtml(productName);
  const mainImageMarkup = hasImages
    ? `<img ${productImageAttrs(initialUrl, productName, { usePlaceholder: false })} id="mainImage" alt="${safeName}">`
    : `<div class="product-card-no-image product-card-no-image--modal" id="mainImagePlaceholder" aria-label="No product image available"><i class="fas fa-shopping-bag"></i></div>`;

  return `
    <div class="product-gallery" id="productGallery" data-image-count="${images.length}">
      <div class="product-gallery-main" id="galleryMain">
        ${hasMultiple ? `
          <button type="button" class="gallery-nav gallery-nav-prev" id="galleryPrev" aria-label="Previous image">
            <i class="fas fa-chevron-left" aria-hidden="true"></i>
          </button>
        ` : ''}
        ${mainImageMarkup}
        ${hasMultiple ? `
          <button type="button" class="gallery-nav gallery-nav-next" id="galleryNext" aria-label="Next image">
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
          </button>
        ` : ''}
        ${hasMultiple ? `<span class="gallery-counter" id="galleryCounter">1 / ${images.length}</span>` : ''}
      </div>
      ${hasMultiple ? `
        <div class="product-gallery-thumbs" id="galleryThumbs" role="tablist" aria-label="Product images">
          ${images.map((img, index) => `
            <button
              type="button"
              class="gallery-thumb ${index === 0 ? 'active' : ''}"
              data-index="${index}"
              data-src="${escapeHtml(resolveImageUrl(img.imageUrl))}"
              role="tab"
              aria-selected="${index === 0 ? 'true' : 'false'}"
              aria-label="View image ${index + 1}"
            >
              <img ${productImageAttrs(img.imageUrl, `View ${index + 1}`, { usePlaceholder: false })}>
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderProductInfoMarkup(p) {
  return `
    <div class="product-detail-info">
      <span class="product-brand">${escapeHtml(p.brand)}</span>
      <h1>${escapeHtml(p.name)}</h1>
      <p class="product-price-lg">${formatPrice(p.price)}</p>

      <div class="product-meta">
        <div class="product-meta-item"><span>Brand</span><strong>${escapeHtml(p.brand)}</strong></div>
        <div class="product-meta-item"><span>Type</span><strong>${escapeHtml(p.type)}</strong></div>
      </div>

      <p class="product-description">${escapeHtml(p.description) || 'No description available.'}</p>

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
  `;
}

function initProductGallery(images) {
  const mainImage = document.getElementById('mainImage');
  const counter = document.getElementById('galleryCounter');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const thumbs = document.querySelectorAll('.gallery-thumb');

  if (!mainImage) return;

  let selectedIndex = 0;

  function showPlaceholder() {
    if (mainImage) {
      mainImage.style.display = 'none';
    }
  }

  function selectImage(index) {
    if (!images.length) {
      showPlaceholder();
      return;
    }

    selectedIndex = ((index % images.length) + images.length) % images.length;
    const current = images[selectedIndex];
    mainImage.style.display = '';
    mainImage.src = resolveImageUrl(current.imageUrl, { placeholder: false });
    mainImage.dataset.index = String(selectedIndex);

    thumbs.forEach((thumb, i) => {
      const isActive = i === selectedIndex;
      thumb.classList.toggle('active', isActive);
      thumb.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (counter) {
      counter.textContent = `${selectedIndex + 1} / ${images.length}`;
    }
  }

  if (!images.length) {
    showPlaceholder();
    return;
  }

  selectImage(0);

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      selectImage(parseInt(thumb.dataset.index, 10));
    });
  });

  prevBtn?.addEventListener('click', () => {
    selectImage(selectedIndex - 1);
  });

  nextBtn?.addEventListener('click', () => {
    selectImage(selectedIndex + 1);
  });

  document.addEventListener('keydown', (event) => {
    if (!document.getElementById('productGallery')) return;
    if (images.length <= 1) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectImage(selectedIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectImage(selectedIndex + 1);
    }
  });
}

async function loadRelatedProducts(currentProduct) {
  const grid = document.getElementById('relatedProducts');
  if (!grid) return;

  try {
    const related = await getRelatedProducts(currentProduct.type, currentProduct.id, 4);
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
