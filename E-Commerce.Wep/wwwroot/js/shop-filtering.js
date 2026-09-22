/**
 * Pure filtering/sorting helpers for the Shop page.
 *
 * Deliberately has NO dependency on the DOM, fetch, or any other browser
 * API, so its behavior can be unit tested directly and reused without
 * needing to simulate a page.
 */

export const PRICE_MIN = 20;
export const PRICE_MAX = 650;

// The product model has no `color` field on the backend at all, so the
// swatches can't map to a real column. We derive a stable color tag per
// product instead: first by matching color words in the product's own
// name/description, and — only if nothing matches — by hashing the
// product's id into one of the swatch colors. The hash is deterministic
// (same product -> same color, every time), so the filter behaves exactly
// like a real attribute: consistent and repeatable, never random.
export const COLOR_KEYWORDS = {
    cream: ['cream', 'ivory', 'beige', 'ecru', 'off-white', 'off white'],
    sage: ['sage', 'green', 'olive', 'mint'],
    teal: ['teal', 'turquoise', 'aqua'],
    blue: ['blue', 'navy', 'denim', 'sky'],
    yellow: ['yellow', 'mustard', 'gold', 'lemon', 'honey'],
    pink: ['pink', 'rose', 'blush', 'coral', 'salmon'],
    black: ['black', 'noir', 'charcoal', 'onyx']
};
export const COLOR_ORDER = Object.keys(COLOR_KEYWORDS);

/** Simple, deterministic string hash (djb2-ish) used only for the color fallback. */
export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

/** Derive a stable swatch color for a normalized product. */
export function deriveColor(product) {
    const haystack = `${product?.name || ''} ${product?.description || ''}`.toLowerCase();
    for (const color of COLOR_ORDER) {
        if (COLOR_KEYWORDS[color].some((kw) => haystack.includes(kw))) return color;
    }
    const seed = String(product?.id ?? product?.name ?? '');
    return COLOR_ORDER[hashString(seed) % COLOR_ORDER.length];
}

/** Wrap normalized raw products into { raw, normalized, color } catalog entries. */
export function buildCatalogEntries(rawProducts, normalizeProduct) {
    return rawProducts
        .map((raw) => {
            const normalized = normalizeProduct(raw);
            return normalized ? { raw, normalized, color: deriveColor(normalized) } : null;
        })
        .filter(Boolean);
}

/**
 * True if a catalog entry satisfies the active Price/Color/Search filters.
 * (Category/Brand are applied earlier, server-side, before entries even
 * reach this function.)
 */
export function matchesActiveFilters(entry, filters) {
    const p = entry.normalized;
    if (!p) return false;

    const maxPrice = filters.maxPrice ?? PRICE_MAX;
    if (typeof p.price === 'number' && (p.price < PRICE_MIN || p.price > maxPrice)) return false;

    if (filters.color && entry.color !== filters.color) return false;

    const term = (filters.search || '').trim().toLowerCase();
    if (term) {
        const haystack = `${p.name || ''} ${p.description || ''} ${p.brandName || ''} ${p.typeName || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
    }

    return true;
}

/** Sort options: 0 Newest, 1 Name A–Z, 2 Name Z–A, 3 Price Low–High, 4 Price High–Low. */
export function sortEntries(entries, sort) {
    const sorted = [...entries];
    switch (sort) {
        case 1: // Name A–Z
            sorted.sort((a, b) => (a.normalized.name || '').localeCompare(b.normalized.name || ''));
            break;
        case 2: // Name Z–A
            sorted.sort((a, b) => (b.normalized.name || '').localeCompare(a.normalized.name || ''));
            break;
        case 3: // Price: Low to High
            sorted.sort((a, b) => (a.normalized.price ?? 0) - (b.normalized.price ?? 0));
            break;
        case 4: // Price: High to Low
            sorted.sort((a, b) => (b.normalized.price ?? 0) - (a.normalized.price ?? 0));
            break;
        default: // Newest — highest id first (no CreatedAt field exists on the model)
            sorted.sort((a, b) => (b.normalized.id ?? 0) - (a.normalized.id ?? 0));
            break;
    }
    return sorted;
}

/** Apply Price/Color/Search + Sort to a full category/brand-scoped catalog. */
export function applyFiltersAndSort(entries, filters) {
    return sortEntries(entries.filter((entry) => matchesActiveFilters(entry, filters)), filters.sort);
}

/** Slice a filtered+sorted list for the given 1-based page. */
export function paginate(entries, page, pageSize) {
    const total = entries.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    const pageEntries = entries.slice(start, start + pageSize);
    return { total, totalPages, page: safePage, start, pageEntries };
}