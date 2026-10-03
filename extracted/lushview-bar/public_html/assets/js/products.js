/* ============================================
   Lush View Bar — Products JavaScript
   Product management interactions & catalog
   ============================================ */

'use strict';

let PRODUCTS = [];
const NO_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='38' height='38'><rect width='38' height='38' fill='%23e5e7eb'/></svg>";

async function loadProducts() {
  try {
    PRODUCTS = (await api('products.php')).map(p => ({...p, image: p.image || NO_IMG}));
  } catch (e) { Toast.error(e.message, 'Could not load products'); }
}

function getStockBadge(stock, minStock) {
  if (stock === 0) return '<span class="badge badge-danger">Out of Stock</span>';
  if (stock <= minStock) return '<span class="badge badge-warning">Low Stock</span>';
  return '<span class="badge badge-success">In Stock</span>';
}

function renderProductRow(p) {
  const cur = (typeof localStorage !== 'undefined' && localStorage.getItem('lushview_cur')) || window.CUR || 'GH₵';
  return `
    <tr>
      <td>
        <input type="checkbox" class="row-checkbox" value="${p.id}" style="width:16px;height:16px;accent-color:var(--primary);cursor:pointer;">
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${p.image}" alt="${p.name}" style="width:38px;height:38px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#f1f5f9;">
          <div>
            <a href="../inventory/product-details.html?id=${p.id}" style="font-size:13px;font-weight:600;color:var(--text);text-decoration:none;">${p.name}</a>
            <div style="font-size:11px;color:var(--muted);">${p.brand}</div>
          </div>
        </div>
      </td>
      <td style="font-size:12px;font-weight:600;color:var(--muted);font-family:monospace;">${p.sku}</td>
      <td style="font-size:13px;color:var(--text);">${p.category}</td>
      <td>${getStockBadge(p.stock, p.minStock)}</td>
      <td style="font-size:13px;color:var(--text);font-weight:600;">${p.stock}</td>
      <td style="font-size:13px;color:var(--text);">${cur}${p.purchasePrice.toFixed(2)}</td>
      <td style="font-size:13px;font-weight:600;color:var(--primary);">${cur}${p.sellingPrice.toFixed(2)}</td>
      <td><span class="badge ${p.status === 'Active' ? 'badge-success' : 'badge-gray'}">${p.status}</span></td>
      <td style="font-size:12px;color:var(--muted);">${p.created}</td>
      <td>
        <div class="action-dropdown-wrapper" style="position:relative;">
          <button class="btn btn-ghost btn-icon action-btn" style="padding:6px;" title="Actions">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
          <div class="dropdown-menu action-dropdown-menu" style="display:none;right:0;min-width:160px;">
            <a href="../inventory/product-details.html?id=${p.id}" class="dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Details
            </a>
            <a href="../inventory/add-product.html?id=${p.id}" class="dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Product
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" onclick="deleteProduct(${p.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function deleteProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  Modal.confirm({
    title: 'Delete Product',
    message: `Are you sure you want to delete "<strong>${product?.name}</strong>"? This action cannot be undone.`,
    type: 'danger',
    confirmText: 'Delete Product',
    onConfirm: () => {
      api('products.php?id=' + id, {method: 'DELETE'})
        .then(() => { Toast.success('Product deleted successfully.', 'Product Deleted'); setTimeout(() => location.reload(), 700); })
        .catch(e => Toast.error(e.message, 'Delete failed'));
    }
  });
}

function updateProductStats() {
  const total = PRODUCTS.length;
  const inStock = PRODUCTS.filter(p => p.stock > p.minStock).length;
  const lowStock = PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = PRODUCTS.filter(p => p.stock <= 0).length;

  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length >= 4) {
    const val0 = statCards[0].querySelector('.stat-value');
    const val1 = statCards[1].querySelector('.stat-value');
    const val2 = statCards[2].querySelector('.stat-value');
    const val3 = statCards[3].querySelector('.stat-value');
    if (val0) val0.textContent = total;
    if (val1) val1.textContent = inStock;
    if (val2) val2.textContent = lowStock;
    if (val3) val3.textContent = outOfStock;
  }
}

async function initProductsTable() {
  await loadProducts();
  updateProductStats();

  const dt = new DataTable({
    tableId: 'products-table',
    data: PRODUCTS,
    pageSize: 10,
    renderRow: renderProductRow,
  });

  makeSortable('products-table', dt);

  const searchEl = document.getElementById('products-search');
  if (searchEl) {
    searchEl.addEventListener('input', function() { dt.search(this.value); });
  }

  const catFilter = document.getElementById('products-category-filter');
  if (catFilter) {
    catFilter.addEventListener('change', function() { dt.filter('category', this.value); });
  }

  const stockFilter = document.getElementById('products-stock-filter');
  if (stockFilter) {
    stockFilter.addEventListener('change', function() {
      const val = this.value;
      if (val === 'all') {
        dt.data = PRODUCTS;
        dt.applyFilters();
        return;
      }
      dt.data = PRODUCTS.filter(p => {
        if (val === 'in-stock') return p.stock > p.minStock;
        if (val === 'low-stock') return p.stock > 0 && p.stock <= p.minStock;
        if (val === 'out-of-stock') return p.stock <= 0;
        return true;
      });
      dt.applyFilters();
      dt.data = PRODUCTS;
    });
  }

  initSelectAll('products-table');
  window.deleteProduct = deleteProduct;
  return dt;
}

function initAddProductForm() {
  const form = document.getElementById('add-product-form');
  if (!form) return;

  const imageInput = document.getElementById('product-image');
  const preview = document.getElementById('image-preview');
  const uploadZone = document.getElementById('upload-zone');

  if (imageInput && preview && uploadZone) {
    uploadZone.addEventListener('click', () => imageInput.click());
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) showPreview(file);
    });
    imageInput.addEventListener('change', function() {
      if (this.files[0]) showPreview(this.files[0]);
    });

    function showPreview(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
        preview.style.display = 'block';
        uploadZone.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  }

  const editId = new URLSearchParams(location.search).get('id');
  const fill = (id, rows, ph) => {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = `<option value="">${ph}</option>` + rows.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  };

  api('lookups.php').then(l => {
    fill('product-category', l.categories, 'Select Category');
    fill('product-brand', l.brands, 'Select Brand');
    fill('product-unit', l.units, 'Select Unit');
  }).then(async () => {
    if (!editId) return;
    const p = await api('products.php?id=' + editId);
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.value = v; };
    set('product-name', p.name); set('product-sku', p.sku); set('product-barcode', p.barcode);
    set('product-category', p.category_id); set('product-brand', p.brand_id); set('product-unit', p.unit_id);
    set('product-status', p.status); set('product-purchase-price', p.purchasePrice); set('product-selling-price', p.sellingPrice);
    set('product-tax', p.tax); set('product-discount', p.discount); set('product-min-stock', p.minStock);
    set('product-max-stock', p.maxStock); set('product-desc', p.description);
    if (p.image && preview && uploadZone) {
      preview.innerHTML = `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
      preview.style.display = 'block';
      uploadZone.style.display = 'none';
    }
    const os = document.getElementById('product-opening-stock'); if (os) { os.value = p.stock; os.disabled = true; }
  }).catch(e => Toast.error(e.message, 'Load failed'));

  const val = id => (document.getElementById(id) || {}).value;
  async function save(resetAfter) {
    const name = val('product-name');
    if (!name) { Toast.error('Product name is required.', 'Validation Error'); return; }
    const imgEl = preview ? preview.querySelector('img') : null;
    const body = {
      name, sku: val('product-sku'), barcode: val('product-barcode'),
      category_id: val('product-category'), brand_id: val('product-brand'), unit_id: val('product-unit'),
      status: val('product-status'), purchase_price: val('product-purchase-price'), selling_price: val('product-selling-price'),
      tax: val('product-tax'), discount: val('product-discount'), opening_stock: val('product-opening-stock'),
      min_stock: val('product-min-stock'), max_stock: val('product-max-stock'), description: val('product-desc'),
      image: imgEl ? imgEl.src : null
    };
    try {
      await api('products.php' + (editId ? '?id=' + editId : ''), {method: editId ? 'PUT' : 'POST', body});
      Toast.success(`Product "${name}" saved!`, 'Product Saved');
      if (resetAfter && !editId) form.reset();
      else setTimeout(() => { location.href = 'products.html'; }, 1000);
    } catch (e) { Toast.error(e.message, 'Could not save'); }
  }

  form.addEventListener('submit', e => { e.preventDefault(); save(false); });
  const saveNewBtn = document.getElementById('save-new-btn');
  saveNewBtn && saveNewBtn.addEventListener('click', () => save(true));
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (document.getElementById('products-table'))     initProductsTable();
    if (document.getElementById('add-product-form'))   initAddProductForm();
  }, 300);
});

window.deleteProduct = deleteProduct;
