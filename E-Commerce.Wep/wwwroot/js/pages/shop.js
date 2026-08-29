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

const SHOP_PAGE_SIZE = 9;
const PRICE_MIN = 20;
const PRICE_MAX = 650;

let currentPage = 1;
const SORT_NAME_ASC = 1;
let filters = { search: '', brandId: '', typeId: '', sort: 0, maxPrice: PRICE_MAX, color: '' };

function getEffectiveSort() {
  if (filters.search.trim() && !filters.sort) {
    return SORT_NAME_ASC;
  }
  return filters.sort;
}

function applySearchSortDefault() {
  if (filters.search.trim() && !filters.sort) {
    filters.sort = SORT_NAME_ASC;
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.value = String(SORT_NAME_ASC);
  }
}

async function initShopPage() {
  await initPage();
  observeRevealElements(document.querySelector('.shop-hero'));
  parseUrlParams();
  await loadFilters();
  applyTypeFromUrl();
  bindFilterEvents();
  await loadProducts();

  if (window.location.hash === '#wishlist') {
    renderWishlist();
  }
}

function bindFilterEvents() {
  document.getElementById('searchInput')?.addEventListener('input', debounce(() => {
    filters.search = document.getElementById('searchInput').value;
    applySearchSortDefault();
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
    syncCategoryRadios(e.target.value);
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('categoryFilterList')?.addEventListener('change', (e) => {
    if (e.target.name !== 'categoryFilter') return;
    filters.typeId = e.target.value;
    const typeSelect = document.getElementById('typeFilter');
    if (typeSelect) typeSelect.value = e.target.value;
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('priceRangeMax')?.addEventListener('input', debounce((e) => {
    filters.maxPrice = parseInt(e.target.value, 10) || PRICE_MAX;
    document.getElementById('priceMaxLabel').textContent = `$${filters.maxPrice}`;
    currentPage = 1;
    loadProducts();
  }, 300));

  document.getElementById('colorSwatches')?.addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
    swatch.classList.add('active');
    filters.color = swatch.dataset.color || '';
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('sortFilter')?.addEventListener('change', (e) => {
    filters.sort = parseInt(e.target.value, 10) || 0;
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('clearFilters')?.addEventListener('click', resetFilters);
}

function resetFilters() {
  filters = { search: '', brandId: '', typeId: '', sort: 0, maxPrice: PRICE_MAX, color: '' };

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const brandSelect = document.getElementById('brandFilter');
  if (brandSelect) brandSelect.value = '';

  const typeSelect = document.getElementById('typeFilter');
  if (typeSelect) typeSelect.value = '';

  syncCategoryRadios('');

  const priceSlider = document.getElementById('priceRangeMax');
  if (priceSlider) priceSlider.value = String(PRICE_MAX);
  document.getElementById('priceMaxLabel').textContent = `$${PRICE_MAX}`;

  document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
  document.querySelector('.color-swatch[data-color=""]')?.classList.add('active');

  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) sortFilter.value = '0';

  currentPage = 1;
  loadProducts();
}

function syncCategoryRadios(typeId) {
  const value = String(typeId || '');
  document.querySelectorAll('input[name="categoryFilter"]').forEach((radio) => {
    radio.checked = radio.value === value;
  });
}

function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  filters.search = params.get('search') || '';
  filters.typeId = params.get('typeId') || '';
  filters.brandId = params.get('brandId') || '';

  if (params.get('search')) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = filters.search;
    applySearchSortDefault();
  }
}

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

  syncCategoryRadios(filters.typeId);
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
    const categoryList = document.getElementById('categoryFilterList');

    types.forEach((t) => {
      const normalized = normalizeType(t);
      typeSelect.innerHTML += `<option value="${normalized.id}">${normalized.name}</option>`;

      if (categoryList) {
        categoryList.innerHTML += `
          <li class="filter-radio-item">
            <label>
              <input type="radio" name="categoryFilter" value="${normalized.id}">
              <span>${normalized.name}</span>
            </label>
          </li>
        `;
      }
    });
  } catch (err) {
    showToast('Could not load filters', 'error');
  }
}

function filterProductsClientSide(products) {
  return products.filter((product) => {
    const p = normalizeProduct(product);
    if (!p) return false;
    if (p.price < PRICE_MIN || p.price > filters.maxPrice) return false;
    return true;
  });
}

function updateResultsCount(total, shownCount) {
  const countEl = document.getElementById('resultsCount');
  if (!countEl) return;

  if (total === 0) {
    countEl.textContent = 'Showing 0 products';
    return;
  }

  const start = (currentPage - 1) * SHOP_PAGE_SIZE + 1;
  const end = Math.min(start + shownCount - 1, total);
  countEl.textContent = `Showing ${start}–${end} of ${total} products`;
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const pagination = document.getElementById('pagination');

  grid.innerHTML = renderProductSkeleton(SHOP_PAGE_SIZE);

  try {
    const result = await getProducts({
      ...filters,
      sort: getEffectiveSort(),
      pageIndex: currentPage,
      pageSize: SHOP_PAGE_SIZE
    });

    let products = result.data || result.Data || [];
    const totalBeforeFilter = result.totalCount || result.TotalCount || 0;
    products = filterProductsClientSide(products);

    const totalPages = getTotalPages(result);
    const total = totalBeforeFilter;

    updateResultsCount(total, products.length);

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

    grid.innerHTML = products.map((p) => renderProductCard(p, { layout: 'shop' })).join('');
    bindProductCardEvents(grid, handleAddToCart);
    observeRevealElements(grid);

    renderPagination(pagination, currentPage, totalPages, (page) => {
      currentPage = page;
      loadProducts();
      document.getElementById('shop-products')?.scrollIntoView({ behavior: 'smooth' });
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
  grid.innerHTML = wishlist.map((p) => renderProductCard(p, { layout: 'shop' })).join('');
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
