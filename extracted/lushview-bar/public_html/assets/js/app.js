/* ============================================
   Lush View Bar — Core Application JavaScript
   Layout Injection + Interactive Behaviors
   ============================================ */

'use strict';

const BASE_PATH = window.BASE_PATH || './';

/* ============================================
   Sidebar HTML Template
   ============================================ */
function getSidebarHTML() {
  const bp = BASE_PATH;
  return `
<a href="${bp}dashboard.html" id="sidebar-logo" class="flex items-center h-16 px-4 border-b" style="border-color:var(--border);flex-shrink:0;text-decoration:none;transition:background 0.15s;" onmouseover="this.style.background='var(--background)'" onmouseout="this.style.background='transparent'">
  <div class="flex items-center gap-3 min-w-0">
    <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center" style="background:linear-gradient(135deg,#E11D48 0%,#BE123C 100%);border-radius:12px;box-shadow:0 2px 8px rgba(225,29,72,0.3);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="white" fill-opacity="0.2"/>
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M12 22V12" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M3 7l9 5 9-5" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2.5" fill="white" stroke="white" stroke-width="0.5"/>
      </svg>
    </div>
    <div class="sidebar-label" style="border-left:1px solid var(--border);padding-left:12px;">
      <div style="font-size:16px;font-weight:700;color:var(--text);line-height:1.1;letter-spacing:-0.3px;">Lush View Bar</div>
      <div style="font-size:9.5px;color:var(--primary);font-weight:600;letter-spacing:0.8px;text-transform:uppercase;margin-top:2px;">Inventory & POS</div>
    </div>
  </div>
</a>

<div class="sidebar-nav">
  <div class="nav-section-title">Main</div>
  <a href="${bp}dashboard.html" class="nav-link" data-page="dashboard">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    <span class="nav-label">Dashboard</span>
  </a>

  <div class="nav-section-title">Inventory</div>
  <a href="${bp}inventory/products.html" class="nav-link" data-page="products">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
    <span class="nav-label">Products</span>
  </a>
  <a href="${bp}inventory/categories.html" class="nav-link" data-page="categories">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
    <span class="nav-label">Categories</span>
  </a>
  <a href="${bp}inventory/brands.html" class="nav-link" data-page="brands">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    <span class="nav-label">Brands</span>
  </a>
  <a href="${bp}inventory/units.html" class="nav-link" data-page="units">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    <span class="nav-label">Units</span>
  </a>
  <a href="${bp}inventory/stock-adjustment.html" class="nav-link" data-page="stock-adjustment">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
    <span class="nav-label">Stock Adjustment</span>
  </a>

  <div class="nav-section-title">Sales & Orders</div>
  <a href="${bp}sales/add-sale.html" class="nav-link" data-page="add-sale">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    <span class="nav-label">New Sale / POS</span>
  </a>
  <a href="${bp}sales/sales.html" class="nav-link" data-page="sales">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    <span class="nav-label">All Sales</span>
  </a>
  <a href="${bp}invoices/invoices.html" class="nav-link" data-page="invoices">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    <span class="nav-label">Invoices</span>
  </a>
  <a href="${bp}customers/customers.html" class="nav-link" data-page="customers">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
    <span class="nav-label">Customers</span>
  </a>

  <div class="nav-section-title">Purchases & Vendors</div>
  <a href="${bp}purchases/add-purchase.html" class="nav-link" data-page="add-purchase">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    <span class="nav-label">New Purchase</span>
  </a>
  <a href="${bp}purchases/purchases.html" class="nav-link" data-page="purchases">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    <span class="nav-label">Purchases List</span>
  </a>
  <a href="${bp}suppliers/suppliers.html" class="nav-link" data-page="suppliers">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    <span class="nav-label">Suppliers</span>
  </a>
  <a href="${bp}expenses/expenses.html" class="nav-link" data-page="expenses">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    <span class="nav-label">Expenses</span>
  </a>

  <div class="nav-section-title">Reports</div>
  <a href="${bp}reports/profit-loss.html" class="nav-link" data-page="profit-loss">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    <span class="nav-label">Profit & Loss</span>
  </a>
  <a href="${bp}reports/sales-report.html" class="nav-link" data-page="sales-report">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    <span class="nav-label">Sales Report</span>
  </a>
  <a href="${bp}reports/purchase-report.html" class="nav-link" data-page="purchase-report">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    <span class="nav-label">Purchase Report</span>
  </a>
  <a href="${bp}reports/inventory-report.html" class="nav-link" data-page="inventory-report">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
    <span class="nav-label">Inventory Report</span>
  </a>
  <a href="${bp}reports/customer-report.html" class="nav-link" data-page="customer-report">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
    <span class="nav-label">Customer Report</span>
  </a>
  <a href="${bp}reports/supplier-report.html" class="nav-link" data-page="supplier-report">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
    <span class="nav-label">Supplier Report</span>
  </a>

  <div class="nav-section-title">Administration</div>
  <a href="${bp}users/users.html" class="nav-link" data-page="users">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    <span class="nav-label">Team & Users</span>
  </a>
  <a href="${bp}users/roles.html" class="nav-link" data-page="roles">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    <span class="nav-label">Roles & Permissions</span>
  </a>
  <a href="${bp}pages/profile.html" class="nav-link" data-page="profile">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    <span class="nav-label">My Profile</span>
  </a>
</div>
`;
}

/* ============================================
   Header HTML Template
   ============================================ */
function getHeaderHTML() {
  const bp = BASE_PATH;
  return `
<button id="sidebar-toggle-btn" class="p-2 rounded-lg hover:bg-[var(--background)] transition-colors" style="color:var(--muted);border:none;background:none;cursor:pointer;flex-shrink:0;" aria-label="Toggle Sidebar">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
</button>

<!-- Global Search -->
<div class="flex-1 max-w-md relative search-box" id="global-search-box">
  <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  <input id="global-search-input" type="text" placeholder="Search products, customers, invoices..."
    class="form-input" style="height:40px;font-size:13px;background:var(--background);"
    autocomplete="off">
  <div id="global-search-dropdown" class="global-search-dropdown" style="display:none;"></div>
</div>

<div class="flex items-center gap-2 ml-auto">
  <!-- Dark Mode Toggle -->
  <button id="dark-mode-btn" class="p-2 rounded-lg hover:bg-[var(--background)] transition-colors" style="color:var(--muted);border:none;background:none;cursor:pointer;" aria-label="Toggle dark mode">
    <svg id="dark-mode-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    <svg id="dark-mode-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  </button>

  <!-- Notifications -->
  <div class="relative" id="notification-dropdown-wrapper">
    <button id="notification-btn" class="p-2 rounded-lg hover:bg-[var(--background)] transition-colors relative" style="color:var(--muted);border:none;background:none;cursor:pointer;" aria-label="Notifications">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span class="absolute top-1 right-1 w-2 h-2 rounded-full" style="background:#EF4444;display:none;"></span>
    </button>
    <div id="notification-dropdown" class="dropdown-menu" style="display:none;right:0;width:340px;max-height:440px;">
      <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:15px;font-weight:600;color:var(--text);">Notifications</span>
        <span class="badge badge-danger">0 New</span>
      </div>
      <div style="overflow-y:auto;max-height:320px;">
        <div style="padding:24px;text-align:center;color:var(--muted);font-size:13px;">Loading notifications...</div>
      </div>
      <div style="padding:12px 16px;border-top:1px solid var(--border);text-align:center;">
        <a href="${bp}inventory/products.html" style="font-size:13px;color:var(--primary);font-weight:500;text-decoration:none;">View inventory alerts</a>
      </div>
    </div>
  </div>

  <!-- User Menu -->
  <div class="relative" id="user-dropdown-wrapper">
    <button id="user-menu-btn" class="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--background)] transition-colors" style="border:none;background:none;cursor:pointer;">
      <div class="w-8 h-8 rounded-full flex-shrink-0 bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center header-user-avatar">U</div>
      <div class="text-left hidden sm:block">
        <div style="font-size:13px;font-weight:600;color:var(--text);line-height:1.2;" class="header-user-name">Loading...</div>
        <div style="font-size:11px;color:var(--muted);" class="header-user-role">User</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted);"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div id="user-dropdown" class="dropdown-menu" style="display:none;right:0;min-width:200px;">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);">
        <div style="font-size:13px;font-weight:600;color:var(--text);" class="header-user-name">Loading...</div>
        <div style="font-size:12px;color:var(--muted);" class="header-user-email">...</div>
      </div>
      <a href="${bp}pages/profile.html" class="dropdown-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        My Profile
      </a>
      <a href="${bp}users/users.html" class="dropdown-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Team & Users
      </a>
      <div class="dropdown-divider"></div>
      <a href="${bp}pages/login.html" onclick="logout(event)" class="dropdown-item danger">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </a>
    </div>
  </div>
</div>
  `;
}

/* ============================================
   Layout Initialization
   ============================================ */
function initLayout() {
  const sidebarContainer = document.getElementById('sidebar-container');
  const headerContainer  = document.getElementById('header-container');

  if (sidebarContainer) {
    const aside = document.createElement('aside');
    aside.id = 'sidebar';
    aside.innerHTML = getSidebarHTML();
    document.body.insertBefore(aside, document.body.firstChild);
  }

  if (headerContainer) {
    const header = document.createElement('header');
    header.id = 'header';
    header.className = 'app-header flex items-center px-4 md:px-6 h-16 border-b';
    header.style.borderColor = 'var(--border)';
    header.style.background = 'var(--surface)';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '30';
    header.innerHTML = getHeaderHTML();
    headerContainer.parentNode.replaceChild(header, headerContainer);
  }

  initSidebar();
  initTheme();
  initDropdowns();
  initSearch();
  initHeaderUser();
  initHeaderNotifications();
  setActiveNav();
}

/* ============================================
   Sidebar Functionality
   ============================================ */
function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar   = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024 &&
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

/* ============================================
   Active Navigation Helper
   ============================================ */
function setActiveNav() {
  const curPage = window.CURRENT_PAGE || '';
  if (!curPage) return;
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    if (link.dataset.page === curPage) {
      link.classList.add('active');
    }
  });
}

/* ============================================
   Dark Mode / Theme Support
   ============================================ */
function initTheme() {
  const btn = document.getElementById('dark-mode-btn');
  const moonIcon = document.getElementById('dark-mode-icon-moon');
  const sunIcon  = document.getElementById('dark-mode-icon-sun');

  function updateIcons(isDark) {
    if (moonIcon && sunIcon) {
      moonIcon.style.display = isDark ? 'none' : 'block';
      sunIcon.style.display  = isDark ? 'block' : 'none';
    }
  }

  const isDark = document.documentElement.classList.contains('dark') ||
                 localStorage.getItem('sf_theme') === 'dark';

  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  updateIcons(isDark);

  if (btn) {
    btn.addEventListener('click', () => {
      const isNowDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('sf_theme', isNowDark ? 'dark' : 'light');
      updateIcons(isNowDark);
    });
  }
}

/* ============================================
   Dropdowns
   ============================================ */
function initDropdowns() {
  function setupDropdown(btnId, menuId) {
    const btn  = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display === 'block';
      document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
      menu.style.display = isOpen ? 'none' : 'block';
    });
  }

  setupDropdown('notification-btn', 'notification-dropdown');
  setupDropdown('user-menu-btn', 'user-dropdown');

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
  });
}

/* ============================================
   Header User Binding & Notifications
   ============================================ */
async function initHeaderUser() {
  const applyUser = (u) => {
    if (!u) return;
    const nameEls = document.querySelectorAll('.header-user-name');
    const roleEls = document.querySelectorAll('.header-user-role');
    const emailEls = document.querySelectorAll('.header-user-email');
    const avatarEls = document.querySelectorAll('.header-user-avatar');
    
    const roleCapitalized = (u.role || 'Admin').charAt(0).toUpperCase() + (u.role || 'Admin').slice(1);
    const initials = (u.name || 'Admin').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

    nameEls.forEach(el => el.textContent = u.name || 'Admin');
    roleEls.forEach(el => el.textContent = roleCapitalized);
    emailEls.forEach(el => el.textContent = u.email || '');
    avatarEls.forEach(el => {
      el.textContent = initials;
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = '700';
    });
  };

  if (window.CURRENT_USER) applyUser(window.CURRENT_USER);
  else if (window.api) {
    try {
      const u = await window.api('auth.php?action=me');
      window.CURRENT_USER = u;
      applyUser(u);
    } catch (e) {}
  }
}

async function initHeaderNotifications() {
  const notifDropdown = document.getElementById('notification-dropdown');
  const notifBtn = document.getElementById('notification-btn');
  const notifBadge = notifBtn ? notifBtn.querySelector('.rounded-full') : null;
  const notifCountBadge = notifDropdown ? notifDropdown.querySelector('.badge') : null;
  const notifList = notifDropdown ? notifDropdown.querySelector('div[style*="overflow-y:auto"]') : null;
  if (!notifDropdown || !notifList || !window.api) return;

  try {
    const dash = await window.api('dashboard.php').catch(() => null);
    if (!dash) return;

    const notifs = [];
    if (Array.isArray(dash.low_items)) {
      dash.low_items.forEach(p => {
        notifs.push({
          type: 'warning',
          title: 'Low Stock Alert',
          sub: `${p.name} (${p.sku}) has only ${p.stock} units left (min: ${p.min_stock}).`,
          time: 'Active Alert',
          url: `${BASE_PATH}inventory/products.html`
        });
      });
    }

    if (Array.isArray(dash.recent)) {
      dash.recent.slice(0, 4).forEach(s => {
        notifs.push({
          type: 'success',
          title: 'Sale: ' + s.invoice_no,
          sub: `${s.customer || 'Walk-in'} — ${(window.CUR || 'GH₵')}${Number(s.total).toFixed(2)}`,
          time: (s.created_at || '').slice(0, 16),
          url: `${BASE_PATH}sales/sales.html`
        });
      });
    }

    if (!notifs.length) {
      notifList.innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted);font-size:13px;">No new alerts</div>';
      if (notifBadge) notifBadge.style.display = 'none';
      if (notifCountBadge) notifCountBadge.textContent = '0 New';
      return;
    }

    if (notifCountBadge) notifCountBadge.textContent = notifs.length + ' New';
    if (notifBadge) notifBadge.style.display = 'block';

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    notifList.innerHTML = notifs.map(n => `
      <div class="notification-item unread" style="cursor:pointer;padding:12px 16px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:start;" onclick="location.href='${n.url}'">
        <div class="stat-icon icon-bg-${n.type === 'warning' ? 'warning' : 'success'} flex-shrink-0" style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          ${n.type === 'warning'
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
          }
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:var(--text);">${esc(n.title)}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">${esc(n.sub)}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px;">${esc(n.time)}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

/* ============================================
   Dynamic Global Search
   ============================================ */
let DYNAMIC_SEARCH_CACHE = null;
async function fetchSearchData() {
  if (DYNAMIC_SEARCH_CACHE) return DYNAMIC_SEARCH_CACHE;
  if (!window.api) return [];
  try {
    const [prods, custs, supps, sales] = await Promise.all([
      window.api('products.php').catch(() => []),
      window.api('crud.php?e=customers').catch(() => []),
      window.api('crud.php?e=suppliers').catch(() => []),
      window.api('sales.php').catch(() => [])
    ]);
    const cur = window.CUR || 'GH₵';
    const list = [];
    prods.forEach(p => list.push({ type: 'Product', label: p.name, sub: `SKU: ${p.sku} · Stock: ${p.stock}`, url: `inventory/product-details.html?id=${p.id}` }));
    custs.forEach(c => list.push({ type: 'Customer', label: c.name, sub: `${c.company || c.email || c.phone || 'Customer'}`, url: `customers/customers.html` }));
    supps.forEach(s => list.push({ type: 'Supplier', label: s.name, sub: `${s.company || s.email || s.phone || 'Supplier'}`, url: `suppliers/suppliers.html` }));
    sales.slice(0, 50).forEach(s => list.push({ type: 'Invoice', label: s.invoice_no, sub: `${s.customer || 'Walk-in'} · ${cur}${Number(s.total).toFixed(2)}`, url: `invoices/invoice-details.html?id=${s.id}` }));
    DYNAMIC_SEARCH_CACHE = list;
    return list;
  } catch (e) {
    return [];
  }
}

const TYPE_BADGES = {
  'Product': 'badge badge-success',
  'Customer': 'badge badge-info',
  'Supplier': 'badge badge-warning',
  'Invoice': 'badge badge-purple',
};

function initSearch() {
  setTimeout(() => {
    const input = document.getElementById('global-search-input');
    const dropdown = document.getElementById('global-search-dropdown');
    if (!input || !dropdown) return;

    input.addEventListener('focus', () => { fetchSearchData(); });

    input.addEventListener('input', async function() {
      const q = this.value.trim().toLowerCase();
      if (q.length < 1) { dropdown.style.display = 'none'; return; }

      const searchData = await fetchSearchData();
      const results = searchData.filter(d =>
        d.label.toLowerCase().includes(q) || (d.sub || '').toLowerCase().includes(q) || d.type.toLowerCase().includes(q)
      );

      if (results.length === 0) {
        dropdown.innerHTML = `<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px;">No results found for "<strong>${q}</strong>"</div>`;
        dropdown.style.display = 'block';
        return;
      }

      const grouped = {};
      results.forEach(r => { (grouped[r.type] = grouped[r.type] || []).push(r); });

      let html = '';
      Object.entries(grouped).forEach(([type, items]) => {
        html += `<div class="search-group-label" style="padding:8px 14px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;">${type}s</div>`;
        items.forEach(item => {
          const badgeClass = TYPE_BADGES[type] || 'badge badge-gray';
          html += `
            <div class="search-result-item" style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);" onclick="window.location.href='${BASE_PATH}${item.url}'">
              <span class="${badgeClass}" style="font-size:11px;">${type}</span>
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;color:var(--text);">${item.label}</div>
                <div style="font-size:11px;color:var(--muted);">${item.sub}</div>
              </div>
            </div>`;
        });
      });

      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }, 300);
}

/* ============================================
   Toast Notification System
   ============================================ */
const Toast = {
  init() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5';
      document.body.appendChild(container);
    }
  },

  show(message, type = 'info', title = '', duration = 4000) {
    this.init();
    const container = document.getElementById('toast-container');

    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      error:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
    return toast;
  },

  dismiss(toast) {
    toast.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  },

  success(msg, title, duration) { return this.show(msg, 'success', title, duration); },
  error(msg, title, duration)   { return this.show(msg, 'error', title, duration); },
  warning(msg, title, duration) { return this.show(msg, 'warning', title, duration); },
  info(msg, title, duration)    { return this.show(msg, 'info', title, duration); },
};

/* ============================================
   Modal System
   ============================================ */
const Modal = {
  show(options = {}) {
    const { title = '', body = '', footer = '', size = 'md' } = options;
    const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal ${sizeClasses[size] || 'max-w-lg'}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" aria-label="Close modal">✕</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    const close = () => {
      backdrop.style.opacity = '0';
      backdrop.querySelector('.modal').style.transform = 'scale(0.95)';
      setTimeout(() => backdrop.remove(), 200);
    };

    backdrop.querySelector('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    document.body.appendChild(backdrop);
    return { element: backdrop, close };
  },

  confirm(options = {}) {
    const {
      title = 'Are you sure?',
      message = 'This action cannot be undone.',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'danger',
      onConfirm = () => {},
      onCancel = () => {},
    } = options;

    const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';
    const footer = `
      <button class="btn btn-secondary modal-cancel-btn">${cancelText}</button>
      <button class="btn ${btnClass} modal-confirm-btn">${confirmText}</button>
    `;

    const { element, close } = this.show({
      title,
      body: `<p style="font-size:14px;color:var(--text);line-height:1.6;">${message}</p>`,
      footer,
      size: 'sm'
    });

    element.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      close();
      onConfirm();
    });
    element.querySelector('.modal-cancel-btn').addEventListener('click', () => {
      close();
      onCancel();
    });
  }
};

/* ============================================
   Auto-Init on DOM Ready
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLayout();
});

/* ============================================
   Export Globals
   ============================================ */
window.Toast = Toast;
window.Modal = Modal;
