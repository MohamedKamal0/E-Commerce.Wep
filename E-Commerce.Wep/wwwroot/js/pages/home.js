/**
 * Homepage initialization
 */
import { initPage, renderProductCard, bindProductCardEvents, renderProductSkeleton, showToast, observeRevealElements } from '../ui.js';
import { getFeaturedProducts, normalizeProduct } from '../products.js';
import { addToCart } from '../basket.js';
import { getProductById } from '../products.js';
import { CONFIG } from '../config.js';

async function initHomePage() {
  await initPage();

  // Load featured products
  const featuredGrid = document.getElementById('featuredProducts');
  if (featuredGrid) {
    featuredGrid.innerHTML = renderProductSkeleton(4);
    try {
      const products = await getFeaturedProducts(4);
      featuredGrid.innerHTML = products.map((p) => renderProductCard(p)).join('');
      bindProductCardEvents(featuredGrid, handleAddToCart);
      observeRevealElements(featuredGrid);
    } catch (err) {
      featuredGrid.innerHTML = `<p class="text-muted text-center">Unable to load products. ${err.message}</p>`;
    }
  }

  // Load popular products
  const popularGrid = document.getElementById('popularProducts');
  if (popularGrid) {
    popularGrid.innerHTML = renderProductSkeleton(4);
    try {
      const { getProducts } = await import('../products.js');
      const result = await getProducts({ pageIndex: 2, pageSize: 4, sort: 4 });
      const products = result.data || result.Data || [];
      popularGrid.innerHTML = products.map((p) => renderProductCard(p)).join('');
      bindProductCardEvents(popularGrid, handleAddToCart);
      observeRevealElements(popularGrid);
    } catch {
      popularGrid.innerHTML = '';
    }
  }

  // Category click handlers
  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      window.location.href = `/pages/shop.html?type=${encodeURIComponent(type)}`;
    });
  });

  // Newsletter
  document.getElementById('homeNewsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you for subscribing to our newsletter!', 'success');
    e.target.reset();
  });
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

document.addEventListener('DOMContentLoaded', initHomePage);
