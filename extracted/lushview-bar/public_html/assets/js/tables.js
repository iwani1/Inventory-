/* ============================================
   Lush View Bar — Table System
   Search, Sort, Pagination, Filter
   ============================================ */

'use strict';

class DataTable {
  constructor(options = {}) {
    this.tableId     = options.tableId || 'data-table';
    this.data        = options.data || [];
    this.columns     = options.columns || [];
    this.pageSize    = options.pageSize || 10;
    this.currentPage = 1;
    this.sortCol     = null;
    this.sortDir     = 'asc';
    this.searchQuery = '';
    this.filters     = {};
    this.renderRow   = options.renderRow || null;
    this.onEmpty     = options.onEmpty || null;

    this.table = document.getElementById(this.tableId);
    this.tbody = this.table ? this.table.querySelector('tbody') : null;

    this.filtered = [...this.data];
    this.render();
  }

  setData(data) {
    this.data = data;
    this.filtered = [...data];
    this.currentPage = 1;
    this.applyFilters();
  }

  search(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.currentPage = 1;
    this.applyFilters();
  }

  filter(key, value) {
    if (value === '' || value === 'all') {
      delete this.filters[key];
    } else {
      this.filters[key] = value;
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  sort(col) {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
    this.applyFilters();
    this.updateSortIndicators();
  }

  applyFilters() {
    let result = [...this.data];

    // Apply search
    if (this.searchQuery) {
      result = result.filter(row => {
        return Object.values(row).some(v =>
          String(v).toLowerCase().includes(this.searchQuery)
        );
      });
    }

    // Apply column filters
    Object.entries(this.filters).forEach(([key, val]) => {
      result = result.filter(row => String(row[key]).toLowerCase() === String(val).toLowerCase());
    });

    // Apply sort
    if (this.sortCol) {
      result.sort((a, b) => {
        const av = a[this.sortCol], bv = b[this.sortCol];
        const cmp = isNaN(av) ? String(av).localeCompare(String(bv)) : Number(av) - Number(bv);
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }

    this.filtered = result;
    this.render();
  }

  getPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  render() {
    if (!this.tbody) return;

    const page = this.getPage();

    if (page.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="99" style="padding:60px 20px;text-align:center;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--background);display:flex;align-items:center;justify-content:center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div>
                <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px;">No results found</div>
                <div style="font-size:13px;color:var(--muted);">${this.onEmpty || 'Try adjusting your search or filter criteria.'}</div>
              </div>
            </div>
          </td>
        </tr>
      `;
    } else if (this.renderRow) {
      this.tbody.innerHTML = page.map((row, i) => this.renderRow(row, i)).join('');
      initActionDropdowns && initActionDropdowns();
    }

    this.renderPagination();
    this.renderInfo();
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filtered.length / this.pageSize);
    const paginationEl = document.getElementById(this.tableId + '-pagination');
    if (!paginationEl) return;

    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

    let wrapper = paginationEl.querySelector('.pagination');
    if (!wrapper) {
      paginationEl.innerHTML = '<div class="pagination"></div>';
      wrapper = paginationEl.querySelector('.pagination');
    }

    let html = '';

    // Prev
    html += `<button class="page-btn" onclick="window._dt_${this.tableId}.goPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

    // Pages
    const pages = this.getPageRange(totalPages);
    pages.forEach(p => {
      if (p === '...') {
        html += `<span class="page-ellipsis">...</span>`;
      } else {
        html += `<button class="page-btn ${p === this.currentPage ? 'active' : ''}" onclick="window._dt_${this.tableId}.goPage(${p})">${p}</button>`;
      }
    });

    // Next
    html += `<button class="page-btn" onclick="window._dt_${this.tableId}.goPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

    wrapper.innerHTML = html;

    // Register instance
    window[`_dt_${this.tableId}`] = this;
  }

  getPageRange(totalPages) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (this.currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (this.currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages);
    }
    return pages;
  }

  renderInfo() {
    const infoEl = document.getElementById(this.tableId + '-info');
    if (!infoEl) return;
    const start = Math.min((this.currentPage - 1) * this.pageSize + 1, this.filtered.length);
    const end   = Math.min(this.currentPage * this.pageSize, this.filtered.length);
    infoEl.textContent = this.filtered.length === 0
      ? 'No entries'
      : `Showing ${start}–${end} of ${this.filtered.length} entries`;
  }

  goPage(page) {
    const totalPages = Math.ceil(this.filtered.length / this.pageSize);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.render();
  }

  updateSortIndicators() {
    const table = this.table;
    if (!table) return;
    table.querySelectorAll('[data-sort]').forEach(th => {
      const col = th.dataset.sort;
      const icon = th.querySelector('.sort-icon');
      if (!icon) return;
      th.classList.remove('sort-active');
      icon.classList.remove('active', 'desc');
      if (col === this.sortCol) {
        th.classList.add('sort-active');
        icon.classList.add('active');
        if (this.sortDir === 'desc') icon.classList.add('desc');
        icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
        icon.style.color = 'var(--primary)';
      } else {
        icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
        icon.style.color = '';
      }
    });
  }
}

/* ============================================
   Sortable Table Header Helper
   ============================================ */
function makeSortable(tableId, dtInstance) {
  const table = document.getElementById(tableId);
  if (!table) return;

  table.querySelectorAll('[data-sort]').forEach(th => {
    if (!th.querySelector('.sort-icon')) {
      const icon = document.createElement('span');
      icon.className = 'sort-icon';
      icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
      th.appendChild(icon);
    }
    th.addEventListener('click', () => dtInstance.sort(th.dataset.sort));
  });
}

/* ============================================
   Checkbox Select All
   ============================================ */
function initSelectAll(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const selectAll = table.querySelector('.select-all');
  if (!selectAll) return;

  selectAll.addEventListener('change', function() {
    table.querySelectorAll('.row-checkbox').forEach(cb => { cb.checked = this.checked; });
    updateBulkActions(tableId);
  });

  table.querySelectorAll('.row-checkbox').forEach(cb => {
    cb.addEventListener('change', () => updateBulkActions(tableId));
  });
}

function updateBulkActions(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const checked = table.querySelectorAll('.row-checkbox:checked').length;
  const bulkBar = document.getElementById(tableId + '-bulk');
  if (bulkBar) {
    bulkBar.style.display = checked > 0 ? 'flex' : 'none';
    const countEl = bulkBar.querySelector('.bulk-count');
    if (countEl) countEl.textContent = `${checked} item${checked > 1 ? 's' : ''} selected`;
  }
}

/* ============================================
   Export globals
   ============================================ */
window.DataTable = DataTable;
window.makeSortable = makeSortable;
window.initSelectAll = initSelectAll;
