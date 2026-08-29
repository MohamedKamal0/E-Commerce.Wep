/**
 * UI module — navbar, footer, toasts, modals, animations, shared components
 */
import { isAuthenticated, formatPrice, resolveImageUrl, escapeHtml, productImageAttrs } from './api.js';
import { getUserDisplayName, logout } from './auth.js';
import { getBasket, getBasketItemCount } from './basket.js';
import { normalizeProduct, getWishlistCount, toggleWishlist, isInWishlist, getPrimaryImageUrl } from './products.js';
import { CONFIG } from './config.js';

/* ─── Toast Notifications ─── */

export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} show`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${message}</span>
    <button type="button" class="toast-close" aria-label="Close"><i class="fas fa-times"></i></button>
  `;

  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.classList.remove('show');
  toast.classList.add('hide');
  setTimeout(() => toast.remove(), 300);
}

/* ─── Loading Spinner ─── */

export function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <p>Loading...</p>
    </div>
  `;
}

export function hideLoading(container) {
  const spinner = container?.querySelector('.loading-spinner');
  if (spinner) spinner.remove();
}

/* ─── Skeleton Loading ─── */

export function renderProductSkeleton(count = 4) {
  return Array(count)
    .fill('')
    .map(
      () => `
    <div class="product-card skeleton-card">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
      <div class="skeleton skeleton-btn"></div>
    </div>
  `
    )
    .join('');
}

/* ─── Navbar ─── */

export async function renderNavbar() {
  const root = document.getElementById('navbar-root');
  if (!root) return;

  let cartCount = 0;
  try {
    const basket = await getBasket();
    cartCount = getBasketItemCount(basket.items);
  } catch {
    cartCount = 0;
  }

  const wishlistCount = getWishlistCount();
  const loggedIn = isAuthenticated();
  const displayName = loggedIn ? await getUserDisplayName() : null;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isShopPage = currentPage === 'shop.html';

  root.innerHTML = `
    <nav class="navbar-custom${isShopPage ? ' navbar-shop' : ''}" id="mainNavbar">
      <div class="container-fluid px-4">
        <a class="navbar-brand" href="/pages/index.html">
          <img src="/images/logo.svg" alt="Crochet Atelier" class="brand-logo">
          ${
            isShopPage
              ? `<span class="brand-text-wrap">
                  <span class="brand-text">Crochet Atelier</span>
                  <span class="brand-tagline">Handmade with Love</span>
                </span>`
              : '<span class="brand-text">Crochet Atelier</span>'
          }
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item"><a class="nav-link ${currentPage === 'index.html' ? 'active' : ''}" href="/pages/index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link ${currentPage === 'shop.html' ? 'active' : ''}" href="/pages/shop.html">Shop</a></li>
            <li class="nav-item"><a class="nav-link ${currentPage === 'about.html' ? 'active' : ''}" href="/pages/about.html">About</a></li>
            ${isShopPage ? '<li class="nav-item"><a class="nav-link" href="/pages/shop.html">Collections</a></li>' : ''}
            <li class="nav-item"><a class="nav-link ${currentPage === 'contact.html' ? 'active' : ''}" href="/pages/contact.html">Contact</a></li>
          </ul>

          <div class="navbar-actions">
            <button type="button" class="nav-action-btn" id="searchToggleBtn" aria-label="Search">
              <i class="fas fa-search"></i>
            </button>
            ${isShopPage ? '' : `<a href="/pages/shop.html#wishlist" class="nav-action-btn wishlist-link" aria-label="Wishlist">
              <i class="fas fa-heart"></i>
              ${wishlistCount > 0 ? `<span class="badge-count">${wishlistCount}</span>` : ''}
            </a>`}
            <a href="/pages/cart.html" class="nav-action-btn cart-link" aria-label="Cart">
              <i class="fas fa-shopping-bag"></i>
              ${cartCount > 0 ? `<span class="badge-count">${cartCount}</span>` : ''}
            </a>
            ${isShopPage ? '' : `<button type="button" class="nav-action-btn" id="darkModeToggle" aria-label="Toggle dark mode">
              <i class="fas fa-moon"></i>
            </button>`}
            ${
              loggedIn
                ? `
              <div class="dropdown">
                <button class="nav-action-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-label="Account menu">
                  <i class="fas fa-user"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><span class="dropdown-item-text fw-semibold">${displayName || 'My Account'}</span></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="/pages/profile.html"><i class="fas fa-user-circle me-2"></i>Profile</a></li>
                  <li><a class="dropdown-item" href="/pages/orders.html"><i class="fas fa-box me-2"></i>Orders</a></li>
                  <li><a class="dropdown-item" href="/pages/add-product.html"><i class="fas fa-plus-circle me-2"></i>Add Product</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Logout</button></li>
                </ul>
              </div>
            `
                : `<a href="/pages/login.html" class="btn btn-primary btn-sm nav-login-btn">Login</a>`
            }
          </div>
        </div>
      </div>

      <div class="search-overlay" id="searchOverlay">
        <div class="container">
          <form id="globalSearchForm" class="search-form">
            <input type="search" id="globalSearchInput" placeholder="Search handmade bags..." autocomplete="off">
            <button type="submit"><i class="fas fa-search"></i></button>
            <button type="button" class="search-close" id="searchCloseBtn"><i class="fas fa-times"></i></button>
          </form>
        </div>
      </div>
    </nav>
  `;

  initNavbarEvents();
  if (document.getElementById('darkModeToggle')) {
    initDarkMode();
  }
  handleNavbarScroll();
}

function initNavbarEvents() {
  document.getElementById('searchToggleBtn')?.addEventListener('click', () => {
    document.getElementById('searchOverlay')?.classList.add('active');
    document.getElementById('globalSearchInput')?.focus();
  });

  document.getElementById('searchCloseBtn')?.addEventListener('click', () => {
    document.getElementById('searchOverlay')?.classList.remove('active');
  });

  document.getElementById('globalSearchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = document.getElementById('globalSearchInput')?.value.trim();
    if (term) window.location.href = `/pages/shop.html?search=${encodeURIComponent(term)}`;
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    showToast('You have been logged out.', 'info');
  });
}

function handleNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── Footer ─── */

export function renderFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;

  root.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="row g-4 footer-main">
          <div class="col-lg-4">
            <a href="/pages/index.html" class="footer-brand">
              <img src="/images/logo.svg" alt="Crochet Atelier">
              <span>Crochet Atelier</span>
            </a>
            <p class="footer-tagline">Handcrafted crochet bags made with love. Each piece tells a story of warmth, elegance, and artisan craftsmanship.</p>
            <div class="social-links">
              <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
              <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Etsy"><i class="fab fa-etsy"></i></a>
            </div>
          </div>
          <div class="col-6 col-lg-2">
            <h6>Shop</h6>
            <ul class="footer-links">
              <li><a href="/pages/shop.html">All Bags</a></li>
              <li><a href="/pages/shop.html">New Arrivals</a></li>
              <li><a href="/pages/shop.html">Best Sellers</a></li>
              <li><a href="/pages/shop.html">Gift Collection</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-2">
            <h6>Help</h6>
            <ul class="footer-links">
              <li><a href="/pages/contact.html">Contact Us</a></li>
              <li><a href="/pages/contact.html">Shipping Info</a></li>
              <li><a href="/pages/contact.html">Returns</a></li>
              <li><a href="/pages/contact.html">FAQ</a></li>
            </ul>
          </div>
          <div class="col-lg-4">
            <h6>Newsletter</h6>
            <p class="newsletter-text">Be the first to discover new collections and exclusive offers.</p>
            <form class="newsletter-form" id="footerNewsletterForm">
              <input type="email" placeholder="Your email address" required aria-label="Email for newsletter">
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>

        <div class="instagram-gallery">
          <h6>Follow Our Craft</h6>
          <div class="gallery-grid">
            ${[1, 2, 3, 4, 5, 6]
              .map(
                (i) => `
              <a href="#" class="gallery-item">
                <img src="https://images.unsplash.com/photo-${1584917865441 + i}-de134e167dde?w=200&q=60" alt="Instagram ${i}" loading="lazy"
                  onerror="this.src='/images/placeholder-bag.svg'">
              </a>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Crochet Atelier. All rights reserved. Handmade with love.</p>
          <div class="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  document.getElementById('footerNewsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you for subscribing!', 'success');
    e.target.reset();
  });
}

/* ─── Product Card ─── */

export function renderProductCard(product, options = {}) {
  if (options.layout === 'shop') {
    return renderShopProductCard(product, options);
  }

  const p = normalizeProduct(product);
  if (!p) return '';

  const inWishlist = isInWishlist(p.id);
  const showQuickView = options.quickView !== false;
  const safeName = escapeHtml(p.name);
  const imageUrl = getPrimaryImageUrl(p);
  const imageMarkup = imageUrl
    ? `<img ${productImageAttrs(imageUrl, p.name, { usePlaceholder: false })}>`
    : '<div class="product-card-no-image" aria-hidden="true"><i class="fas fa-shopping-bag"></i></div>';

  return `
    <div class="product-card reveal" data-product-id="${p.id}">
      <div class="product-card-image">
        ${imageMarkup}
        <div class="product-card-overlay">
          ${showQuickView ? `<button type="button" class="btn btn-light btn-sm quick-view-btn" data-id="${p.id}"><i class="fas fa-eye me-1"></i> Quick View</button>` : ''}
          <button type="button" class="btn btn-primary btn-sm add-to-cart-btn" data-id="${p.id}">
            <i class="fas fa-shopping-bag me-1"></i> Add to Cart
          </button>
        </div>
        <button type="button" class="wishlist-btn ${inWishlist ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist">
          <i class="fas fa-heart"></i>
        </button>
        <span class="product-badge">${escapeHtml(p.typeName || 'Handmade')}</span>
      </div>
      <div class="product-card-body">
        <span class="product-brand">${escapeHtml(p.brandName || 'Artisan')}</span>
        <h5 class="product-name">
          <a href="/pages/product-details.html?id=${p.id}">${safeName}</a>
        </h5>
        <div class="product-rating">
          ${renderStars(4.5)}
          <span class="rating-count">(24)</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(p.price)}</span>
        </div>
      </div>
    </div>
  `;
}

/** Shop page product card — visible add-to-cart, no hover overlay */
export function renderShopProductCard(product, options = {}) {
  const p = normalizeProduct(product);
  if (!p) return '';

  const inWishlist = isInWishlist(p.id);
  const safeName = escapeHtml(p.name);
  const imageUrl = getPrimaryImageUrl(p);
  const imageMarkup = imageUrl
    ? `<img ${productImageAttrs(imageUrl, p.name, { usePlaceholder: false })}>`
    : '<div class="product-card-no-image" aria-hidden="true"><i class="fas fa-shopping-bag"></i></div>';

  return `
    <div class="product-card shop-product-card reveal" data-product-id="${p.id}">
      <div class="product-card-image">
        ${imageMarkup}
        <button type="button" class="wishlist-btn ${inWishlist ? 'active' : ''}" data-id="${p.id}" aria-label="Add to wishlist">
          <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="product-card-body">
        <h5 class="product-name">
          <a href="/pages/product-details.html?id=${p.id}">${safeName}</a>
        </h5>
        <div class="product-rating">
          ${renderStars(5)}
          <span class="rating-count">(24)</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(p.price)}</span>
        </div>
        <button type="button" class="shop-add-to-cart-btn add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= full) html += '<i class="fas fa-star"></i>';
    else if (i === full + 1 && half) html += '<i class="fas fa-star-half-alt"></i>';
    else html += '<i class="far fa-star"></i>';
  }
  return html;
}

/* ─── Quick View Modal ─── */

export function showQuickViewModal(product) {
  const p = normalizeProduct(product);
  if (!p) return;

  let modal = document.getElementById('quickViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header border-0">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row g-4">
            <div class="col-md-6">
              ${
                getPrimaryImageUrl(p)
                  ? `<img ${productImageAttrs(getPrimaryImageUrl(p), p.name, { usePlaceholder: false })} class="img-fluid rounded-4">`
                  : '<div class="product-card-no-image product-card-no-image--modal rounded-4"><i class="fas fa-shopping-bag"></i></div>'
              }
            </div>
            <div class="col-md-6">
              <span class="product-brand">${p.brandName}</span>
              <h3>${p.name}</h3>
              <div class="product-rating mb-3">${renderStars(4.5)}</div>
              <p class="product-price-lg">${formatPrice(p.price)}</p>
              <p class="text-muted">${p.description?.substring(0, 150) || ''}...</p>
              <div class="quantity-selector mb-3">
                <button type="button" class="qty-btn qty-minus"><i class="fas fa-minus"></i></button>
                <input type="number" class="qty-input" value="1" min="1" max="100">
                <button type="button" class="qty-btn qty-plus"><i class="fas fa-plus"></i></button>
              </div>
              <button type="button" class="btn btn-primary w-100 mb-2" id="modalAddToCart">Add to Cart</button>
              <a href="/pages/product-details.html?id=${p.id}" class="btn btn-outline w-100">View Full Details</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  initQuantitySelector(modal.querySelector('.quantity-selector'));

  modal.querySelector('#modalAddToCart')?.addEventListener('click', async () => {
    const qty = parseInt(modal.querySelector('.qty-input')?.value) || 1;
    const { addToCart } = await import('./basket.js');
    try {
      await addToCart(p, qty);
      showToast(`${p.name} added to cart!`, 'success');
      bsModal.hide();
      renderNavbar();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* ─── Quantity Selector ─── */

export function initQuantitySelector(container) {
  if (!container) return;

  const input = container.querySelector('.qty-input');
  container.querySelector('.qty-minus')?.addEventListener('click', () => {
    const val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  });
  container.querySelector('.qty-plus')?.addEventListener('click', () => {
    const val = parseInt(input.value) || 1;
    if (val < 100) input.value = val + 1;
  });
}

/* ─── Product Card Events ─── */

export function bindProductCardEvents(container, onAddToCart) {
  if (!container) return;

  container.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, select, textarea')) return;
      const productId = card.dataset.productId;
      if (productId) {
        window.location.href = `/pages/product-details.html?id=${productId}`;
      }
    });
  });

  container.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      if (onAddToCart) await onAddToCart(id, btn);
    });
  });

  container.querySelectorAll('.quick-view-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const { getProductById } = await import('./products.js');
      try {
        const product = await getProductById(id);
        showQuickViewModal(product);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  container.querySelectorAll('.wishlist-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const { getProductById } = await import('./products.js');
      try {
        const product = await getProductById(id);
        const added = toggleWishlist(product);
        btn.classList.toggle('active', added);
        showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
        renderNavbar();
      } catch {
        showToast('Could not update wishlist', 'error');
      }
    });
  });
}

/* ─── Scroll Reveal ─── */

let revealObserver = null;

function getRevealObserver() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
  }
  return revealObserver;
}

/** Observe dynamically inserted .reveal elements (e.g. product cards loaded from API) */
export function observeRevealElements(root = document) {
  const scope = root instanceof Element ? root : document;
  scope.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      el.classList.add('visible');
    } else {
      getRevealObserver().observe(el);
    }
  });
}

export function initScrollReveal() {
  observeRevealElements();
}

/* ─── Scroll To Top ─── */

export function initScrollToTop() {
  let btn = document.getElementById('scrollTopBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── Dark Mode ─── */

export function initDarkMode() {
  const saved = localStorage.getItem(CONFIG.DARK_MODE_KEY);
  if (saved === 'true') {
    document.documentElement.dataset.theme = 'dark';
    updateDarkModeIcon(true);
  }

  document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem(CONFIG.DARK_MODE_KEY, !isDark);
    updateDarkModeIcon(!isDark);
  });
}

function updateDarkModeIcon(isDark) {
  const icon = document.querySelector('#darkModeToggle i');
  if (icon) {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/* ─── Animated Counters ─── */

export function initCounters() {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseInt(el.dataset.counter);
    const duration = 2000;
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(animate);
      else el.textContent = target;
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
    observer.observe(el);
  });
}

/* ─── Form Validation ─── */

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function showFieldError(input, message) {
  input.classList.add('is-invalid');
  let feedback = input.parentElement.querySelector('.invalid-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    input.parentElement.appendChild(feedback);
  }
  feedback.textContent = message;
}

export function clearFieldError(input) {
  input.classList.remove('is-invalid');
}

export function initFloatingLabels() {
  document.querySelectorAll('.form-floating input, .form-floating textarea').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.value) input.classList.add('has-value');
      else input.classList.remove('has-value');
    });
    if (input.value) input.classList.add('has-value');
  });
}

/* ─── Pagination ─── */

export function renderPagination(container, currentPage, totalPages, onPageChange) {
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '<nav class="pagination-nav" aria-label="Product pagination"><ul class="pagination">';

  html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></a>
  </li>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }

  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></a>
  </li>`;

  html += '</ul></nav>';

  container.innerHTML = html;

  container.querySelectorAll('.page-link[data-page]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = parseInt(link.dataset.page, 10);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    });
  });
}

/* ─── Page Init ─── */

export async function initPage() {
  await renderNavbar();
  renderFooter();
  initScrollReveal();
  initScrollToTop();
  initCounters();
  initFloatingLabels();

  // Solid navbar on pages without hero section
  if (!document.querySelector('.hero-section')) {
    document.getElementById('mainNavbar')?.classList.add('scrolled');
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ─── Empty States ─── */

export function renderEmptyState(icon, title, message, buttonHTML = '') {
  return `
    <div class="empty-state reveal">
      <div class="empty-state-icon"><i class="fas ${icon}"></i></div>
      <h4>${title}</h4>
      <p>${message}</p>
      ${buttonHTML}
    </div>
  `;
}
