/**
 * Shop page initialization
 */
import {
  initPage, renderProductCard, bindProductCardEvents,
  renderProductSkeleton, showToast, renderPagination, renderEmptyState,
  observeRevealElements
} from '../ui.js';
import {
  getProducts, getBrands, getTypes, getProductById,
  normalizeBrand, normalizeType, getTotalPages, getWishlist, normalizeProduct
} from '../products.js';
import { addToCart } from '../basket.js';
import { CONFIG } from '../config.js';

let currentPage = 1;
let filters = { search: '', brandId: '', typeId: '', sort: 0 };

async function initShopPage() {
  await initPage();
  parseUrlParams();
  await loadFilters();
  applyTypeFromUrl();
  await loadProducts();

  document.getElementById('searchInput')?.addEventListener('input', debounce(() => {
    filters.search = document.getElementById('searchInput').value;
    currentPage = 1;
    loadProducts();
  }, 400));

  document.getElementById('brandFilter')?.addEventListener('change', (e) => {
    filters.brandId = e.target.value;
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('typeFilter')?.addEventListener('change', (e) => {
    filters.typeId = e.target.value;
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('sortFilter')?.addEventListener('change', (e) => {
    filters.sort = parseInt(e.target.value) || 0;
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('clearFilters')?.addEventListener('click', () => {
    filters = { search: '', brandId: '', typeId: '', sort: 0 };
    document.getElementById('searchInput').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('sortFilter').value = '0';
    currentPage = 1;
    loadProducts();
  });

  // Wishlist section
  if (window.location.hash === '#wishlist') {
    renderWishlist();
  }
}

function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  filters.search = params.get('search') || '';
  filters.typeId = params.get('typeId') || '';
  filters.brandId = params.get('brandId') || '';
  if (params.get('search')) {
    document.getElementById('searchInput').value = filters.search;
  }
}

/** Match category name from homepage URL (?type=Mini Bags) to type filter */
function applyTypeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const typeName = params.get('type');
  const typeSelect = document.getElementById('typeFilter');

  if (typeName && typeSelect) {
    const option = [...typeSelect.options].find((o) => o.textContent === typeName);
    if (option) {
      filters.typeId = option.value;
      typeSelect.value = option.value;
    }
  }

  if (filters.brandId) {
    const brandSelect = document.getElementById('brandFilter');
    if (brandSelect) brandSelect.value = filters.brandId;
  }

  if (filters.typeId && typeSelect) {
    typeSelect.value = filters.typeId;
  }
}

async function loadFilters() {
  try {
    const [brandsResult, types] = await Promise.all([
      getBrands({ pageSize: 50 }),
      getTypes()
    ]);

    const brands = (brandsResult.data || brandsResult.Data || brandsResult || []).map(normalizeBrand);
    const brandSelect = document.getElementById('brandFilter');
    brands.forEach((b) => {
      brandSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
    });

    const typeSelect = document.getElementById('typeFilter');
    types.forEach((t) => {
      const normalized = normalizeType(t);
      typeSelect.innerHTML += `<option value="${normalized.id}">${normalized.name}</option>`;
    });
  } catch (err) {
    showToast('Could not load filters', 'error');
  }
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const pagination = document.getElementById('pagination');
  const countEl = document.getElementById('resultsCount');

  grid.innerHTML = renderProductSkeleton(8);

  try {
    const result = await getProducts({
      ...filters,
      pageIndex: currentPage,
      pageSize: CONFIG.PAGE_SIZE
    });

    const products = result.data || result.Data || [];
    const totalPages = getTotalPages(result);
    const total = result.totalCount || result.TotalCount || 0;

    countEl.textContent = `${total} product${total !== 1 ? 's' : ''} found`;

    if (products.length === 0) {
      grid.innerHTML = renderEmptyState(
        'fa-search',
        'No Products Found',
        'Try adjusting your search or filters.',
        '<a href="/pages/shop.html" class="btn btn-primary">View All Products</a>'
      );
      pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = products.map((p) => renderProductCard(p)).join('');
    bindProductCardEvents(grid, handleAddToCart);
    observeRevealElements(grid);

    pagination.innerHTML = renderPagination(currentPage, totalPages, (page) => {
      currentPage = page;
      loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } catch (err) {
    grid.innerHTML = `<p class="text-muted text-center">${err.message}</p>`;
  }
}

function renderWishlist() {
  const wishlist = getWishlist();
  const section = document.getElementById('wishlistSection');
  if (!section) return;

  section.style.display = 'block';

  if (wishlist.length === 0) {
    section.querySelector('.wishlist-grid').innerHTML = renderEmptyState(
      'fa-heart',
      'Your Wishlist is Empty',
      'Save your favorite bags for later.',
      '<a href="/pages/shop.html" class="btn btn-primary">Browse Shop</a>'
    );
    return;
  }

  const grid = section.querySelector('.wishlist-grid');
  grid.innerHTML = wishlist.map((p) => renderProductCard(p)).join('');
  bindProductCardEvents(grid, handleAddToCart);
  observeRevealElements(grid);
}

async function handleAddToCart(productId) {
  try {
    const product = await getProductById(productId);
    await addToCart(product);
    showToast(`${normalizeProduct(product).name} added to cart!`, 'success');
    const { renderNavbar } = await import('../ui.js');
    await renderNavbar();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener('DOMContentLoaded', initShopPage);
