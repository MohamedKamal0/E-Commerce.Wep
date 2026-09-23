/**
 * Products module — listing, search, filter, pagination, details
 */
import { apiFetch } from './api.js';
import { CONFIG } from './config.js';

/** Build query string from params object */
function buildQuery(params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            search.append(key, value);
        }
    });
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

/**
 * Get paginated products
 * @param {object} params - BrabdId, TyepId, SearchValue, PageIndex, PageSize, sortingOption
 */
export async function getProducts(params = {}) {
    const query = buildQuery({
        BrabdId: params.brandId,
        TyepId: params.typeId,
        SearchValue: params.search,
        PageIndex: params.pageIndex || 1,
        PageSize: params.pageSize || CONFIG.PAGE_SIZE,
        sortingOption: params.sort || 0
    });
    return apiFetch(`/api/Product${query}`, { auth: false });
}

/** Get single product by ID */
export async function getProductById(id) {
    return apiFetch(`/api/Product/${id}`, { auth: false });
}

/** Get all brands (paginated) */
export async function getBrands(params = {}) {
    const query = buildQuery({
        SearchValue: params.search,
        PageIndex: params.pageIndex || 1,
        PageSize: params.pageSize || 50
    });
    return apiFetch(`/api/Product/brands${query}`, { auth: false });
}

/** Get all product types */
export async function getTypes() {
    return apiFetch('/api/Product/types', { auth: false });
}

/** Get featured products for homepage */
export async function getFeaturedProducts(count = 4) {
    const result = await getProducts({ pageIndex: 1, pageSize: count, sort: 4 });
    return result.data || result.Data || [];
}

/** Get related products by type */
export async function getRelatedProducts(typeName, excludeId, count = 4) {
    const result = await getProducts({ pageIndex: 1, pageSize: count + 1 });
    const products = result.data || result.Data || [];
    return products.filter((p) => p.id !== excludeId && p.Id !== excludeId).slice(0, count);
}

/** Search products (default: name A–Z) */
export async function searchProducts(term, pageIndex = 1) {
    return getProducts({ search: term, pageIndex, sort: 1 });
}

/** Calculate total pages from paginated result */
export function getTotalPages(result) {
    const total = result.totalCount || result.TotalCount || 0;
    const size = result.pageSize || result.PageSize || CONFIG.PAGE_SIZE;
    return Math.ceil(total / size) || 1;
}

/** True when URL points to a user-uploaded product image under /images/products/ */
export function isUploadedProductImage(url) {
    if (!url || typeof url !== 'string') return false;
    const path = url.trim().replace(/\\/g, '/');
    return /\/images\/products\/[^/]+$/i.test(path);
}

/** Normalize product object (handle PascalCase from API) */
export function normalizeProduct(product) {
    if (!product) return null;

    const brand = product.brand ?? product.Brand ?? product.brandName ?? product.BrandName ?? '';
    const type = product.type ?? product.Type ?? product.typeName ?? product.TypeName ?? '';

    const rawImages = product.images ?? product.Images;
    let images = [];

    if (Array.isArray(rawImages) && rawImages.length) {
        images = rawImages
            .map((img, index) => ({
                id: img.id ?? img.Id ?? index,
                imageUrl: img.imageUrl ?? img.ImageUrl ?? ''
            }))
            .filter((img) => isUploadedProductImage(img.imageUrl));
    }

    const rawUrls = product.pictureUrls ?? product.PictureUrls;
    let pictureUrls = Array.isArray(rawUrls)
        ? rawUrls.filter((url) => isUploadedProductImage(url))
        : [];

    const legacyUrl = product.pictureUrl ?? product.PictureUrl;
    if (images.length === 0 && pictureUrls.length === 0 && isUploadedProductImage(legacyUrl)) {
        pictureUrls = [legacyUrl];
    }

    if (images.length === 0 && pictureUrls.length) {
        images = pictureUrls.map((url, index) => ({ id: index, imageUrl: url }));
    }

    pictureUrls = images.map((img) => img.imageUrl);
    const pictureUrl = pictureUrls[0] ?? '';

    return {
        id: product.id ?? product.Id,
        name: product.name ?? product.Name,
        description: product.description ?? product.Description ?? '',
        brand,
        type,
        brandName: brand,
        typeName: type,
        images,
        pictureUrl,
        pictureUrls,
        price: product.price ?? product.Price
    };
}

/** Product images for gallery — always returns array of { id, imageUrl } */
export function getProductImages(product) {
    const normalized = normalizeProduct(product);
    return normalized?.images ?? [];
}

/** Primary image URL for cards and cart */
export function getPrimaryImageUrl(product) {
    const p = normalizeProduct(product);
    return p?.images?.[0]?.imageUrl ?? p?.pictureUrl ?? '';
}

/** Normalize brand object */
export function normalizeBrand(brand) {
    return {
        id: brand.id ?? brand.Id,
        name: brand.name ?? brand.Name
    };
}

/** Normalize type object */
export function normalizeType(type) {
    return {
        id: type.id ?? type.Id,
        name: type.name ?? type.Name
    };
}

/** Recently viewed — localStorage helpers */
export function addRecentlyViewed(product) {
    const normalized = normalizeProduct(product);
    if (!normalized) return;

    let items = getRecentlyViewed();
    items = items.filter((p) => p.id !== normalized.id);
    items.unshift(normalized);
    items = items.slice(0, 8);
    localStorage.setItem(CONFIG.RECENTLY_VIEWED_KEY, JSON.stringify(items));
}

export function getRecentlyViewed() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.RECENTLY_VIEWED_KEY) || '[]');
    } catch {
        return [];
    }
}

/** Wishlist — localStorage helpers */
export function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.WISHLIST_KEY) || '[]');
    } catch {
        return [];
    }
}

export function isInWishlist(productId) {
    return getWishlist().some((p) => p.id === productId);
}

export function toggleWishlist(product) {
    const normalized = normalizeProduct(product);
    if (!normalized) return false;

    let list = getWishlist();
    const exists = list.some((p) => p.id === normalized.id);

    if (exists) {
        list = list.filter((p) => p.id !== normalized.id);
    } else {
        list.push(normalized);
    }

    localStorage.setItem(CONFIG.WISHLIST_KEY, JSON.stringify(list));
    return !exists;
}

export function getWishlistCount() {
    return getWishlist().length;
}

/** Create a new product (multipart/form-data with image) */
export async function createProduct(formData) {
    return apiFetch('/api/Product', {
        method: 'POST',
        body: formData
    });
}