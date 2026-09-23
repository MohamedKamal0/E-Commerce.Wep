/**
 * Shop page initialization
 *
 * Filtering/sorting architecture
 * -------------------------------
 * The backend (`productQueryParams`) only understands Category (TyepId) and
 * Brand (BrabdId) as real filters, caps PageSize at 10, and has no concept
 * of price range or color at all. Price, Color, Search and the visible
 * pagination therefore cannot be delegated to the server without breaking
 * as soon as more than one filter is active (mismatched counts, wrong
 * pages, filters silently overwriting each other).
 *
 * To make Category + Color + Price + Search + Sort all compose correctly,
 * this page:
 *   1. Asks the server only for Category/Brand (the two things it can
 *      actually filter), looping pages (deterministically ordered by Name
 *      so repeated paged requests can never duplicate or drop a row) until
 *      the whole matching set is retrieved.
 *   2. Applies Price, Color and Search on that complete set, in-browser.
 *   3. Sorts the complete filtered set in-browser (so sorting always sorts
 *      *within* the active filters, never the unfiltered catalog).
 *   4. Paginates the final filtered+sorted list in-browser for display.
 *
 * The product catalog itself is never mutated — everything above works off
 * fresh copies, so no product is ever duplicated or lost from the source
 * data, and repeated filter changes always recompute from the same base
 * catalog snapshot for the current Category/Brand.
 */
import {
    initPage, renderProductCard, bindProductCardEvents,
    renderProductSkeleton, showToast, renderPagination, renderEmptyState,
    observeRevealElements
} from '../ui.js';
import {
    getProducts, getBrands, getTypes, getProductById,
    normalizeBrand, normalizeType, getWishlist, normalizeProduct
} from '../products.js';
import { addToCart } from '../basket.js';
import { buildCatalogEntries, applyFiltersAndSort, paginate, PRICE_MAX } from '../shop-filtering.js';

const SHOP_PAGE_SIZE = 9;

// Backend hard-caps PageSize at 10 (see productQueryParams.MaxPageSize).
const FETCH_PAGE_SIZE = 10;
// Safety cap on how many pages we'll aggregate, so a very large catalog
// can't hang the page in a runaway loop.
const MAX_FETCH_PAGES = 40;

let currentPage = 1;
let filters = { search: '', brandId: '', typeId: '', sort: 0, maxPrice: PRICE_MAX, color: '' };

// Single-slot cache of the normalized+color-tagged product set for the
// current Category/Brand selection (the only two filters the server
// applies). Re-used across Price/Color/Search/Sort changes so those stay
// instant and never re-hit the network; invalidated automatically whenever
// Category or Brand changes because the cache key changes.
let catalogCache = { key: null, entries: [] };

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
    const priceMaxLabel = document.getElementById('priceMaxLabel');
    if (priceMaxLabel) priceMaxLabel.textContent = `$${PRICE_MAX}`;

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

/**
 * Fetch every product matching the current Category/Brand selection
 * (the only filters the API supports), looping pages with a deterministic
 * server-side sort so aggregation can't duplicate or skip rows. Cached per
 * Category+Brand combination.
 */
async function fetchCatalog(typeId, brandId) {
    const key = `${typeId || ''}|${brandId || ''}`;
    if (catalogCache.key === key) return catalogCache.entries;

    const all = [];
    let pageIndex = 1;
    let totalCount = Infinity;

    while (all.length < totalCount && pageIndex <= MAX_FETCH_PAGES) {
        const result = await getProducts({
            typeId,
            brandId,
            sort: 1, // NameASC — the one option the backend always orders deterministically
            pageIndex,
            pageSize: FETCH_PAGE_SIZE
        });

        const pageProducts = result.data || result.Data || [];
        totalCount = result.totalCount ?? result.TotalCount ?? pageProducts.length;

        if (pageProducts.length === 0) break;
        all.push(...pageProducts);
        pageIndex += 1;
    }

    const entries = buildCatalogEntries(all, normalizeProduct);
    catalogCache = { key, entries };
    return entries;
}

function updateResultsCount(total, shownCount, startIndex) {
    const countEl = document.getElementById('resultsCount');
    if (!countEl) return;

    if (total === 0) {
        countEl.textContent = 'Showing 0 products';
        return;
    }

    const start = startIndex + 1;
    const end = startIndex + shownCount;
    countEl.textContent = `Showing ${start}–${end} of ${total} products`;
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const pagination = document.getElementById('pagination');
    if (!grid) return;

    grid.innerHTML = renderProductSkeleton(SHOP_PAGE_SIZE);

    try {
        const catalog = await fetchCatalog(filters.typeId, filters.brandId);
        const filtered = applyFiltersAndSort(catalog, filters);

        // Keep the current page in range if filtering just shrank the result set
        // (e.g. user was on page 3, then narrowed the filters).
        const { total, totalPages, page, start, pageEntries } = paginate(filtered, currentPage, SHOP_PAGE_SIZE);
        currentPage = page;

        updateResultsCount(total, pageEntries.length, start);

        if (total === 0) {
            grid.innerHTML = renderEmptyState(
                'fa-search',
                'No Products Found',
                'Try adjusting your search or filters.',
                '<a href="/pages/shop.html" class="btn btn-primary">View All Products</a>'
            );
            if (pagination) pagination.innerHTML = '';
            return;
        }

        grid.innerHTML = pageEntries.map((entry) => renderProductCard(entry.raw, { layout: 'shop' })).join('');
        bindProductCardEvents(grid, handleAddToCart);
        observeRevealElements(grid);

        if (pagination) {
            renderPagination(pagination, currentPage, totalPages, (page) => {
                currentPage = page;
                loadProducts();
                document.getElementById('shop-products')?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    } catch (err) {
        grid.innerHTML = `<p class="text-muted text-center">${err.message}</p>`;
        if (pagination) pagination.innerHTML = '';
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