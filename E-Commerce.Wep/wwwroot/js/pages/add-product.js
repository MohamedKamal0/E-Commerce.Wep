/**
 * Add Product page — multipart form with multiple image upload
 */
import { initPage, showToast, showFieldError, clearFieldError } from '../ui.js';
import { requireAuth } from '../auth.js';
import { getBrands, getTypes, normalizeBrand, normalizeType, createProduct } from '../products.js';

const previewObjectUrls = [];

async function initAddProductPage() {
  await initPage();

  if (!requireAuth('/pages/add-product.html')) return;

  await loadFilters();
  bindImagePreview();
  bindFormSubmit();
}

async function loadFilters() {
  try {
    const [brandsResult, types] = await Promise.all([
      getBrands({ pageSize: 50 }),
      getTypes()
    ]);

    const brandSelect = document.getElementById('brandId');
    const brands = (brandsResult.data || brandsResult.Data || brandsResult || []).map(normalizeBrand);
    brands.forEach((b) => {
      brandSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
    });

    const typeSelect = document.getElementById('typeId');
    types.forEach((t) => {
      const normalized = normalizeType(t);
      typeSelect.innerHTML += `<option value="${normalized.id}">${normalized.name}</option>`;
    });
  } catch (err) {
    showToast(err.message || 'Could not load brands and types', 'error');
  }
}

function clearPreviewUrls() {
  previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  previewObjectUrls.length = 0;
}

function bindImagePreview() {
  const input = document.getElementById('images');
  const grid = document.getElementById('imagePreviewGrid');

  input?.addEventListener('change', () => {
    clearPreviewUrls();
    grid.innerHTML = '';

    const files = [...(input.files || [])];
    if (!files.length) return;

    const invalid = files.find((f) => !f.type.startsWith('image/'));
    if (invalid) {
      showToast('Please select valid image files only', 'error');
      input.value = '';
      return;
    }

    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      previewObjectUrls.push(url);
      const item = document.createElement('div');
      item.className = 'image-preview-item';
      item.innerHTML = `<img src="${url}" alt="Preview ${index + 1}" class="product-image-preview">`;
      grid.appendChild(item);
    });
  });
}

function bindFormSubmit() {
  const form = document.getElementById('addProductForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name');
    const description = document.getElementById('description');
    const price = document.getElementById('price');
    const brandId = document.getElementById('brandId');
    const typeId = document.getElementById('typeId');
    const images = document.getElementById('images');

    [name, description, price, brandId, typeId, images].forEach(clearFieldError);

    let valid = true;

    if (!name.value.trim()) {
      showFieldError(name, 'Product name is required');
      valid = false;
    }
    if (!description.value.trim()) {
      showFieldError(description, 'Description is required');
      valid = false;
    }
    if (!price.value || parseFloat(price.value) <= 0) {
      showFieldError(price, 'Enter a valid price');
      valid = false;
    }
    if (!brandId.value) {
      showFieldError(brandId, 'Select a brand');
      valid = false;
    }
    if (!typeId.value) {
      showFieldError(typeId, 'Select a type');
      valid = false;
    }
    if (!images.files?.length) {
      showFieldError(images, 'At least one product image is required');
      valid = false;
    }
    if (!valid) return;

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading...';

    try {
      const formData = new FormData();
      formData.append('Name', name.value.trim());
      formData.append('Description', description.value.trim());
      formData.append('Price', price.value);
      formData.append('BrandId', brandId.value);
      formData.append('TyepId', typeId.value);

      [...images.files].forEach((file) => {
        formData.append('Images', file);
      });

      const product = await createProduct(formData);
      const productId = product.id ?? product.Id;
      showToast('Product created successfully!', 'success');
      setTimeout(() => {
        window.location.href = `/pages/product-details.html?id=${productId}`;
      }, 800);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-plus me-2"></i>Add Product';
    }
  });
}

document.addEventListener('DOMContentLoaded', initAddProductPage);
