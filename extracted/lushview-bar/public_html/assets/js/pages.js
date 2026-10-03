/* ============================================
   Lush View Bar — Dynamic Page Engine
   Fully connected to PHP & SQLite backend
   ============================================ */

'use strict';

window.CUR = (typeof localStorage !== 'undefined' && localStorage.getItem('lushview_cur')) || window.CUR || 'GH₵';
window.BIZ = (typeof localStorage !== 'undefined' && localStorage.getItem('lushview_biz')) || window.BIZ || 'Lush View Bar';
const CUR = window.CUR, BIZ = window.BIZ;

const money = n => CUR + (Number(n) || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (s, r = document) => r.querySelector(s);
const root = () => document.getElementById('app-root');
const bad = e => Toast.error(e.message || String(e), 'Error');
const day = s => String(s || '').slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);
const sub = t => `<div style="color:var(--muted);font-size:12px">${t}</div>`;
const head = (t, s, btn = '') => `<div class="page-header"><div><h1 class="page-title">${t}</h1><p class="page-subtitle">${s}</p></div><div class="page-header-actions">${btn}</div></div>`;
const card = (t, b) => `<div class="card" style="padding:18px"><h3 style="font-weight:700;margin-bottom:12px">${t}</h3>${b}</div>`;
const stat = (l, v, n = '') => `<div class="card" style="padding:18px"><div style="color:var(--muted);font-size:12px;font-weight:600">${l}</div><div style="font-size:24px;font-weight:700;margin-top:6px">${v}</div><div style="font-size:12px;color:var(--muted);margin-top:2px">${n}</div></div>`;
const cards = h => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px;margin-bottom:20px">${h}</div>`;
const two = h => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px">${h}</div>`;
const fld = (l, h) => `<div><label class="form-label">${l}</label>${h}</div>`;
const row = h => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:16px">${h}</div>`;

function tbl(cols, rows, empty = 'Nothing here yet.') {
  if (!rows.length) return `<div style="padding:40px;text-align:center;color:var(--muted)">${empty}</div>`;
  return `<div style="overflow-x:auto"><table class="data-table"><thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function modal(title, body, label, onSave) {
  Modal.show({
    title, size: 'md', body,
    footer: `<button class="btn btn-secondary" onclick="document.querySelector('.modal-backdrop')?.remove()">Close</button>${onSave ? `<button class="btn btn-primary" id="m-save">${label}</button>` : ''}`
  });
  setTimeout(() => {
    const b = $('#m-save');
    if (b) b.onclick = async () => {
      b.disabled = true;
      try {
        if (await onSave() !== false) document.querySelector('.modal-backdrop')?.remove();
      } catch (e) { bad(e); }
      b.disabled = false;
    };
  }, 30);
}

/* ============================================
   Generic CRUD Pages (Categories, Brands, Units, Customers, Suppliers, Expenses)
   ============================================ */
const nameCol = ['Name', r => `<b>${esc(r.name)}</b>`], created = ['Added', r => esc(day(r.created_at))];
const party = (one) => ({
  one,
  f: [['name','Name','text',1],['company','Company'],['email','Email','email'],['phone','Phone'],['city','City'],['address','Address']],
  c: [[one, r => `<b>${esc(r.name)}</b>${sub(esc(r.company || ''))}`], ['Contact', r => `${esc(r.email || '')}${sub(esc(r.phone || ''))}`], ['City', r => esc(r.city || '')]]
});

const CRUDS = {
  categories: {title: 'Categories', s: 'Group your products into logical departments.', one: 'Category', f: [['name','Name','text',1]], c: [nameCol, created]},
  brands: {title: 'Brands', s: 'Manage manufacturer brands.', one: 'Brand', f: [['name','Name','text',1]], c: [nameCol, created]},
  units: {title: 'Units of Measurement', s: 'Standard product measurement units (Piece, Box, Kg, Liter...).', one: 'Unit', f: [['name','Name','text',1]], c: [nameCol, created]},
  customers: {title: 'Customers', s: 'Manage client directory and contact info.', ...party('Customer')},
  suppliers: {title: 'Suppliers', s: 'Manage vendor directory and supply contacts.', ...party('Supplier')},
  expenses: {
    title: 'Expenses', s: 'Track operating overhead (utilities, rent, logistics...).', one: 'Expense',
    f: [['title','Title','text',1],['category','Category'],['amount','Amount','number',1],['expense_date','Date','date'],['note','Note']],
    c: [['Title', r => `<b>${esc(r.title)}</b>${sub(esc(r.note || ''))}`], ['Category', r => esc(r.category || 'General')], ['Amount', r => money(r.amount)], ['Date', r => esc(r.expense_date || day(r.created_at))]]
  },
};

async function crudPage(name) {
  const C = CRUDS[name]; let rows = [];
  root().innerHTML = head(C.title, C.s, `<button class="btn btn-primary" id="add">+ Add ${C.one}</button>`) +
    `<div class="card" style="padding:0"><div style="padding:14px"><input id="q" class="form-input" placeholder="Search..."></div><div id="t"></div></div>`;
  const draw = () => {
    const q = $('#q').value.toLowerCase(), list = rows.filter(r => JSON.stringify(Object.values(r)).toLowerCase().includes(q));
    $('#t').innerHTML = tbl([...C.c, ['', r => `<button class="btn btn-secondary btn-sm" data-e="${r.id}">Edit</button> <button class="btn btn-danger btn-sm" data-d="${r.id}">Delete</button>`]], list);
  };
  const load = async () => { rows = await api('crud.php?e=' + name); draw(); };
  const form = r => {
    modal((r ? 'Edit ' : 'Add ') + C.one,
      `<div style="display:flex;flex-direction:column;gap:12px">${C.f.map(([k, l, t = 'text', req]) => fld(l + (req ? ' *' : ''), `<input class="form-input" data-k="${k}" type="${t}" ${t === 'number' ? 'step="0.01" min="0"' : ''} value="${esc(r ? r[k] : (t === 'date' ? today() : ''))}">`)).join('')}</div>`,
      'Save', async () => {
        const body = {}; document.querySelectorAll('.modal-body [data-k]').forEach(i => body[i.dataset.k] = i.value);
        await api('crud.php?e=' + name + (r ? '&id=' + r.id : ''), {method: r ? 'PUT' : 'POST', body});
        Toast.success(C.one + ' saved', 'Done'); load();
      });
  };
  $('#add').onclick = () => form(null); $('#q').oninput = draw;
  $('#t').onclick = ev => {
    const e = ev.target.closest('[data-e]'), d = ev.target.closest('[data-d]');
    if (e) form(rows.find(r => r.id == e.dataset.e));
    if (d) Modal.confirm({
      title: 'Delete ' + C.one, message: 'This cannot be undone.', type: 'danger', confirmText: 'Delete',
      onConfirm: () => api('crud.php?e=' + name + '&id=' + d.dataset.d, {method: 'DELETE'}).then(() => { Toast.success('Deleted', 'Done'); load(); }).catch(bad)
    });
  };
  try { await load(); } catch (e) { bad(e); }
}

/* ============================================
   Stock Adjustment
   ============================================ */
async function stockPage() {
  let prods = await api('products.php');
  const opts = () => prods.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.sku)}) — ${p.stock} in stock</option>`).join('');
  root().innerHTML = head('Stock Adjustment', 'Correct stock counts. Every change is logged in the audit trail below.') +
    `<div class="card" style="padding:18px;margin-bottom:20px">${row(
      fld('Product', `<select id="sp" class="form-input form-select">${opts()}</select>`) +
      fld('Action', `<select id="st" class="form-input form-select"><option value="add">Add stock (+)</option><option value="remove">Remove stock (-)</option></select>`) +
      fld('Quantity', `<input id="sq" type="number" min="0" step="any" class="form-input" placeholder="0">`) +
      fld('Reason / Note', `<input id="sn" class="form-input" placeholder="e.g. damaged, audit recount, return">`))}
    <button class="btn btn-primary" id="go">Apply adjustment</button></div><div class="card" id="mv" style="padding:0"></div>`;
  const load = async () => {
    const m = await api('stock.php');
    $('#mv').innerHTML = tbl([['Date', r => esc(day(r.created_at))], ['Product', r => `<b>${esc(r.name)}</b>${sub(esc(r.sku))}`], ['Type', r => `<span class="badge badge-info">${esc(r.type)}</span>`],
      ['Qty', r => `<b style="color:${r.qty < 0 ? 'var(--danger)' : 'var(--primary)'}">${r.qty > 0 ? '+' : ''}${r.qty}</b>`], ['Note', r => esc(r.note || '—')]], m, 'No movements yet.');
  };
  $('#go').onclick = async () => {
    try {
      await api('stock.php', {method: 'POST', body: {product_id: $('#sp').value, type: $('#st').value, qty: $('#sq').value, note: $('#sn').value}});
      Toast.success('Stock updated successfully', 'Done'); $('#sq').value = ''; $('#sn').value = '';
      prods = await api('products.php'); const v = $('#sp').value; $('#sp').innerHTML = opts(); $('#sp').value = v; load();
    } catch (e) { bad(e); }
  };
  load().catch(bad);
}

/* ============================================
   Invoice Modal & Print
   ============================================ */
const invHTML = s => `<div style="font-family:sans-serif;max-width:560px;margin:auto;color:#111;padding:20px;"><div style="display:flex;justify-content:space-between;border-bottom:2px solid #E11D48;padding-bottom:12px;margin-bottom:16px;"><div><h2 style="margin:0;color:#E11D48;">${esc(BIZ)}</h2><p style="color:#666;margin:2px 0;font-size:13px;">Inventory & POS Management</p></div><div style="text-align:right;"><h3 style="margin:0;">INVOICE</h3><div style="font-size:14px;font-weight:700;">${esc(s.invoice_no)}</div><div style="font-size:12px;color:#666;">Date: ${esc(day(s.created_at))}</div></div></div>
<p style="font-size:14px;margin-bottom:16px;"><strong>Billed To:</strong> ${esc(s.customer || 'Walk-in Customer')}</p>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;"><tr style="background:#f3f4f6;text-align:left;"><th style="padding:8px;">Item</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Price</th><th style="padding:8px;text-align:right;">Total</th></tr>
${s.items.map(i => `<tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px;">${esc(i.name)}</td><td style="padding:8px;text-align:center;">${i.qty}</td><td style="padding:8px;text-align:right;">${money(i.price)}</td><td style="padding:8px;text-align:right;">${money(i.qty * i.price)}</td></tr>`).join('')}</table>
<div style="text-align:right;font-size:13px;line-height:1.7;">Subtotal: ${money(s.subtotal)}<br>Discount: -${money(s.discount)}<br>Tax (${s.tax_percent}%): ${money(s.tax)}<br><div style="font-size:16px;font-weight:700;margin:6px 0;border-top:1px solid #ccc;padding-top:4px;">Grand Total: ${money(s.total)}</div>Paid: ${money(s.paid)} (${esc(s.payment_method)})<br><span style="color:${s.paid >= s.total ? '#BE123C' : '#DC2626'};font-weight:700;">Balance Due: ${money(s.total - s.paid)}</span></div></div>`;

async function showInvoice(id) {
  const s = await api('sales.php?id=' + id), html = invHTML(s);
  modal('Invoice ' + s.invoice_no, html, 'Print', () => {
    const w = window.open('', '_blank'); w.document.write('<!DOCTYPE html><html><head><title>' + esc(s.invoice_no) + '</title></head><body>' + html + '</body></html>'); w.document.close(); w.focus(); w.print(); return false;
  });
}

/* ============================================
   Invoices List Page
   ============================================ */
async function invoicesListPage() {
  const rows = await api('sales.php');
  const totalInvoiced = rows.reduce((a, r) => a + r.total, 0);
  const totalPaid = rows.reduce((a, r) => a + r.paid, 0);
  const totalOwing = totalInvoiced - totalPaid;

  root().innerHTML = head('Invoices', 'Track accounts receivable, due dates, and billing receipts.', `<a class="btn btn-primary" href="../sales/add-sale.html">+ Create Invoice</a>`) +
    cards(
      stat('Total Invoiced', money(totalInvoiced), rows.length + ' invoices issued') +
      stat('Collected', money(totalPaid), totalInvoiced > 0 ? (totalPaid / totalInvoiced * 100).toFixed(1) + '% collected' : '100%') +
      stat('Outstanding', money(totalOwing), rows.filter(r => r.paid < r.total).length + ' invoices pending')
    ) +
    `<div class="card" style="padding:0">
      <div style="padding:14px;display:flex;gap:12px;flex-wrap:wrap;">
        <input id="q" class="form-input flex-1" style="min-width:200px" placeholder="Search invoice #, customer...">
        <select id="sf" class="form-input form-select" style="width:160px">
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="owing">Pending / Owing</option>
        </select>
      </div>
      <div id="t"></div>
    </div>`;

  const draw = () => {
    const q = $('#q').value.toLowerCase();
    const sf = $('#sf').value;
    const list = rows.filter(r => {
      const matchQ = (r.invoice_no || '').toLowerCase().includes(q) || (r.customer || '').toLowerCase().includes(q);
      const isPaid = r.paid >= r.total;
      const matchS = sf === 'all' || (sf === 'paid' && isPaid) || (sf === 'owing' && !isPaid);
      return matchQ && matchS;
    });

    $('#t').innerHTML = tbl([
      ['Invoice #', r => `<a href="invoice-details.html?id=${r.id}" style="color:var(--primary);font-weight:700;font-family:monospace;text-decoration:none;">${esc(r.invoice_no)}</a>`],
      ['Date', r => esc(day(r.created_at))],
      ['Customer', r => `<b>${esc(r.customer || 'Walk-in')}</b>`],
      ['Total', r => `<b>${money(r.total)}</b>`],
      ['Paid', r => money(r.paid)],
      ['Balance', r => `<span style="color:${r.total - r.paid > 0 ? 'var(--danger)' : 'var(--muted)'}">${money(r.total - r.paid)}</span>`],
      ['Status', r => r.paid >= r.total ? '<span class="badge badge-success">Paid</span>' : '<span class="badge badge-warning">Owing</span>'],
      ['Action', r => `<a href="invoice-details.html?id=${r.id}" class="btn btn-secondary btn-sm">View</a> <button class="btn btn-secondary btn-sm" data-inv="${r.id}">Print</button>`]
    ], list, 'No invoices found.');
  };

  $('#q').oninput = draw;
  $('#sf').onchange = draw;
  $('#t').onclick = e => {
    const b = e.target.closest('[data-inv]');
    if (b) showInvoice(b.dataset.inv).catch(bad);
  };
  draw();
}

/* ============================================
   Invoice Details Page
   ============================================ */
async function invoiceDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (!id) {
    root().innerHTML = `<div class="card" style="padding:40px;text-align:center;"><h2>No invoice specified</h2><p><a href="invoices.html" class="btn btn-primary" style="margin-top:16px;">Back to Invoices</a></p></div>`;
    return;
  }
  const s = await api('sales.php?id=' + id);
  const isPaid = s.paid >= s.total;

  root().innerHTML = `
    <div class="page-header">
      <div>
        <div class="breadcrumb"><a href="../dashboard.html">Home</a><span class="sep">/</span><a href="invoices.html">Invoices</a><span class="sep">/</span><span class="current">${esc(s.invoice_no)}</span></div>
        <div class="flex items-center gap-3 mt-1">
          <h1 class="page-title mb-0">${esc(s.invoice_no)}</h1>
          <span class="badge ${isPaid ? 'badge-success' : 'badge-warning'}">${isPaid ? 'Paid' : 'Pending Balance'}</span>
        </div>
      </div>
      <div class="page-header-actions">
        <a href="invoices.html" class="btn btn-secondary">Back to Invoices</a>
        <button class="btn btn-primary" id="print-btn">Print Invoice</button>
      </div>
    </div>

    <div class="card" style="padding:28px;max-width:800px;margin:auto;">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid var(--primary);padding-bottom:16px;margin-bottom:20px;">
        <div>
          <h2 style="margin:0;font-size:22px;color:var(--primary);">${esc(BIZ)}</h2>
          <div style="color:var(--muted);font-size:13px;margin-top:4px;">Official Invoice Receipt</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:18px;font-weight:700;">${esc(s.invoice_no)}</div>
          <div style="font-size:13px;color:var(--muted);">Date: ${esc(day(s.created_at))}</div>
        </div>
      </div>

      <div style="margin-bottom:24px;background:var(--background);padding:14px;border-radius:10px;">
        <div style="font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;">Customer Details</div>
        <div style="font-size:16px;font-weight:700;margin-top:2px;">${esc(s.customer || 'Walk-in Customer')}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:2px;">Payment Method: ${esc(s.payment_method)}</div>
      </div>

      <div style="margin-bottom:24px;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Item / Product</th>
              <th style="text-align:center;width:90px;">Qty</th>
              <th style="text-align:right;width:130px;">Unit Price</th>
              <th style="text-align:right;width:140px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${s.items.map(i => `
              <tr>
                <td><b>${esc(i.name)}</b></td>
                <td style="text-align:center;">${i.qty}</td>
                <td style="text-align:right;">${money(i.price)}</td>
                <td style="text-align:right;font-weight:600;">${money(i.qty * i.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <div style="min-width:280px;font-size:14px;line-height:2;">
          <div style="display:flex;justify-content:space-between;"><span>Subtotal:</span> <span>${money(s.subtotal)}</span></div>
          <div style="display:flex;justify-content:space-between;color:var(--muted);"><span>Discount:</span> <span>-${money(s.discount)}</span></div>
          <div style="display:flex;justify-content:space-between;color:var(--muted);"><span>Tax (${s.tax_percent}%):</span> <span>+${money(s.tax)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;border-top:1px solid var(--border);padding-top:6px;margin-top:6px;"><span>Total:</span> <span style="color:var(--primary);">${money(s.total)}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>Amount Paid:</span> <span>${money(s.paid)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;color:${isPaid ? 'var(--primary)' : 'var(--danger)'};"><span>Balance Due:</span> <span>${money(s.total - s.paid)}</span></div>
        </div>
      </div>
    </div>
  `;

  $('#print-btn').onclick = () => {
    const html = invHTML(s);
    const w = window.open('', '_blank');
    w.document.write('<!DOCTYPE html><html><head><title>' + esc(s.invoice_no) + '</title></head><body>' + html + '</body></html>');
    w.document.close();
    w.focus();
    w.print();
  };
}

/* ============================================
   Product Details Page
   ============================================ */
async function productDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (!id) {
    root().innerHTML = `<div class="card" style="padding:40px;text-align:center;"><h2>No product selected</h2><p><a href="products.html" class="btn btn-primary" style="margin-top:16px;">Back to Products</a></p></div>`;
    return;
  }

  const [p, movements] = await Promise.all([
    api('products.php?id=' + id),
    api('stock.php?product_id=' + id).catch(() => [])
  ]);

  const marginVal = p.sellingPrice - p.purchasePrice;
  const marginPct = p.purchasePrice > 0 ? (marginVal / p.purchasePrice * 100).toFixed(1) : '100';

  root().innerHTML = `
    <div class="page-header">
      <div>
        <div class="breadcrumb"><a href="../dashboard.html">Home</a><span class="sep">/</span><a href="products.html">Products</a><span class="sep">/</span><span class="current">${esc(p.name)}</span></div>
        <div class="flex items-center gap-3 mt-1">
          <h1 class="page-title mb-0">${esc(p.name)}</h1>
          <span class="badge ${p.stock <= 0 ? 'badge-danger' : p.stock <= p.minStock ? 'badge-warning' : 'badge-success'}">${p.stock <= 0 ? 'Out of Stock' : p.stock <= p.minStock ? 'Low Stock' : 'In Stock'}</span>
          <span class="badge badge-info">${esc(p.category)}</span>
        </div>
      </div>
      <div class="page-header-actions">
        <a href="products.html" class="btn btn-secondary">Back</a>
        <a href="stock-adjustment.html" class="btn btn-secondary">Adjust Stock</a>
        <a href="add-product.html?id=${p.id}" class="btn btn-primary">Edit Product</a>
      </div>
    </div>

    ${cards(
      stat('Current Stock', p.stock + ' ' + (p.unit || 'units'), `Min: ${p.minStock} | Max: ${p.maxStock || '∞'}`) +
      stat('Selling Price', money(p.sellingPrice), `Cost: ${money(p.purchasePrice)}`) +
      stat('Profit Margin', money(marginVal), `${marginPct}% markup`) +
      stat('Stock Asset Value', money(p.stock * p.purchasePrice), `Retail: ${money(p.stock * p.sellingPrice)}`)
    )}

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:24px;">
      <div class="card" style="padding:20px;">
        <h3 style="font-weight:700;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:8px;">Specifications</h3>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted)">SKU:</span> <b>${esc(p.sku)}</b></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted)">Barcode:</span> <span>${esc(p.barcode || '—')}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted)">Brand:</span> <span>${esc(p.brand)}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted)">Category:</span> <span>${esc(p.category)}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted)">Unit:</span> <span>${esc(p.unit)}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted)">Status:</span> <span class="badge ${p.status === 'Active' ? 'badge-success' : 'badge-gray'}">${esc(p.status)}</span></div>
        </div>
      </div>

      <div class="card" style="padding:20px;">
        <h3 style="font-weight:700;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:8px;">Description</h3>
        <p style="font-size:13px;color:var(--text);line-height:1.6;">${esc(p.description || 'No description provided.')}</p>
      </div>
    </div>

    <div class="card" style="padding:0;">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);"><h3 style="font-weight:700;margin:0;">Stock Movement Audit Trail</h3></div>
      ${tbl([
        ['Date', r => esc(day(r.created_at))],
        ['Type', r => `<span class="badge badge-info">${esc(r.type)}</span>`],
        ['Qty Change', r => `<b style="color:${r.qty < 0 ? 'var(--danger)' : 'var(--primary)'}">${r.qty > 0 ? '+' : ''}${r.qty}</b>`],
        ['Note', r => esc(r.note || '—')]
      ], movements, 'No stock movements recorded for this product yet.')}
    </div>
  `;
}

/* ============================================
   Document Page (New Sale / New Purchase)
   ============================================ */
async function docPage(kind) {
  const sale = kind === 'sale';
  const [prods, parties] = await Promise.all([api('products.php'), api('crud.php?e=' + (sale ? 'customers' : 'suppliers'))]);
  const P = prods.filter(p => p.status === 'Active'); let L = [{}], paidEdited = false;
  root().innerHTML = head(sale ? 'New Sale' : 'New Purchase', sale ? 'Scan or pick products, then complete the sale.' : 'Record goods received from supplier.') +
    `<div class="card" style="padding:18px;margin-bottom:16px">${row(
      fld(sale ? 'Customer' : 'Supplier', `<select id="party" class="form-input form-select"><option value="">— ${sale ? 'Walk-in Customer' : 'Select Supplier'} —</option>${parties.map(x => `<option value="${x.id}">${esc(x.name)}${x.company ? ' (' + esc(x.company) + ')' : ''}</option>`).join('')}</select>`) +
      (sale ? fld('Payment Method', `<select id="pay" class="form-input form-select"><option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option><option>Credit</option></select>`)
            : fld('Purchase Date', `<input id="pdate" type="date" class="form-input" value="${today()}">`)) +
      (!sale ? fld('Supplier Invoice / Ref #', `<input id="pref" class="form-input" placeholder="e.g. PO-98123">`) : '') +
      (sale ? fld('Barcode / SKU Search', `<input id="scan" class="form-input" placeholder="Scan SKU or press Enter">`) : ''))}</div>
    <div class="card" style="padding:0;margin-bottom:16px"><div id="lines"></div>
    <div style="padding:12px 16px;border-top:1px solid var(--border)"><button class="btn btn-secondary btn-sm" id="addl">+ Add Line</button></div></div>
    <div class="card" style="padding:18px"><div style="display:flex;justify-content:flex-end;gap:24px;flex-wrap:wrap;align-items:center">
      ${sale ? `<div style="font-size:14px">Subtotal: <b id="t1"></b></div>
      <div style="display:flex;gap:8px;align-items:center">Discount <input id="disc" type="number" min="0" step="0.01" value="0" class="form-input" style="width:100px"></div>
      <div style="display:flex;gap:8px;align-items:center">Tax % <input id="tax" type="number" min="0" step="0.01" value="0" class="form-input" style="width:90px"></div>` : ''}
      <div style="font-size:18px">Total: <b id="t2"></b></div>
      <div style="display:flex;gap:8px;align-items:center">Amount Paid <input id="paid" type="number" min="0" step="0.01" class="form-input" style="width:130px"></div></div></div>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary btn-lg" id="go">${sale ? 'Complete Sale' : 'Save Purchase'}</button></div></div>`;

  const qty = l => l.qty ?? 1;
  const calc = () => {
    const s = L.reduce((a, l) => a + qty(l) * (+l.price || 0), 0), d = sale ? +$('#disc').value || 0 : 0, t = sale ? +$('#tax').value || 0 : 0;
    const total = Math.max(0, s - d) * (1 + t / 100);
    if (sale) $('#t1').textContent = money(s); $('#t2').textContent = money(total);
    if (!paidEdited) $('#paid').value = total.toFixed(2);
  };
  const draw = () => {
    $('#lines').innerHTML = `<table class="data-table"><thead><tr><th>Product</th><th style="width:100px">Qty</th><th style="width:130px">${sale ? 'Selling Price' : 'Unit Cost'}</th><th style="width:120px">Total</th><th></th></tr></thead><tbody>${L.map((l, i) =>
      `<tr><td><select data-i="${i}" data-k="product_id" class="form-input form-select"><option value="">— choose product —</option>${P.map(p => `<option value="${p.id}"${l.product_id == p.id ? ' selected' : ''}>${esc(p.name)} (${esc(p.sku)})${sale ? ' · ' + p.stock + ' in stock' : ''}</option>`).join('')}</select></td>
      <td><input data-i="${i}" data-k="qty" type="number" min="0" step="any" class="form-input" value="${qty(l)}"></td>
      <td><input data-i="${i}" data-k="price" type="number" min="0" step="0.01" class="form-input" value="${l.price ?? ''}"></td>
      <td id="lt${i}"><b>${money(qty(l) * (+l.price || 0))}</b></td><td><button class="btn btn-ghost btn-sm" data-rm="${i}">✕</button></td></tr>`).join('')}</tbody></table>`;
    calc();
  };
  const L$ = $('#lines');
  L$.onchange = e => { const t = e.target; if (t.dataset.k !== 'product_id') return; const l = L[t.dataset.i], p = P.find(x => x.id == t.value);
    l.product_id = t.value; l.price = p ? (sale ? p.sellingPrice : p.purchasePrice) : undefined; draw(); };
  L$.oninput = e => { const t = e.target, i = t.dataset.i; if (!i || t.dataset.k === 'product_id') return;
    L[i][t.dataset.k] = t.value === '' ? undefined : +t.value; $('#lt' + i).innerHTML = `<b>${money(qty(L[i]) * (+L[i].price || 0))}</b>`; calc(); };
  L$.onclick = e => { const b = e.target.closest('[data-rm]'); if (b) { L.splice(b.dataset.rm, 1); if (!L.length) L = [{}]; draw(); } };
  $('#addl').onclick = () => { L.push({}); draw(); };
  ['disc', 'tax'].forEach(i => $('#' + i) && ($('#' + i).oninput = calc));
  $('#paid').oninput = () => paidEdited = true;
  if (sale) $('#scan').onkeydown = e => {
    if (e.key !== 'Enter') return; e.preventDefault();
    const v = e.target.value.trim().toLowerCase(), p = P.find(x => (x.sku || '').toLowerCase() === v || (x.barcode || '').toLowerCase() === v);
    if (!p) return Toast.warning('No product with that SKU / barcode', 'Not found');
    const ex = L.find(l => l.product_id == p.id);
    if (ex) ex.qty = qty(ex) + 1; else { const blank = L.find(l => !l.product_id); const n = {product_id: String(p.id), price: p.sellingPrice};
      if (blank) Object.assign(blank, n); else L.push(n); }
    e.target.value = ''; draw();
  };
  $('#go').onclick = async () => {
    const items = L.filter(l => l.product_id).map(l => ({product_id: +l.product_id, qty: qty(l), [sale ? 'price' : 'cost']: l.price}));
    if (!items.length) return Toast.warning('Add at least one product', 'Nothing to save');
    const body = sale ? {customer_id: $('#party').value, payment_method: $('#pay').value, discount: $('#disc').value, tax_percent: $('#tax').value, paid: $('#paid').value, items}
                      : {supplier_id: $('#party').value, purchase_date: $('#pdate').value, ref: $('#pref').value, paid: $('#paid').value, items};
    $('#go').disabled = true;
    try {
      const r = await api(sale ? 'sales.php' : 'purchases.php', {method: 'POST', body});
      Toast.success(sale ? 'Sale completed successfully' : 'Purchase saved — stock updated', 'Done');
      if (sale) { await docPage('sale'); showInvoice(r.id); } else location.href = 'purchases.html';
    } catch (e) { bad(e); $('#go').disabled = false; }
  };
  draw();
}

/* ============================================
   Sales List & Report
   ============================================ */
async function salesList(report) {
  root().innerHTML = head(report ? 'Sales Report' : 'Sales', report ? 'Filter by date and analyze sales performance.' : 'All completed sales transactions.', report ? '' : `<a class="btn btn-primary" href="add-sale.html">+ New Sale</a>`) +
    (report ? `<div class="card" style="padding:14px;margin-bottom:16px;display:flex;gap:12px;align-items:end;flex-wrap:wrap"><div>${fld('From', `<input id="from" type="date" class="form-input" value="${today().slice(0, 8)}01">`)}</div><div>${fld('To', `<input id="to" type="date" class="form-input" value="${today()}">`)}</div><button class="btn btn-primary" id="run">Run Report</button></div><div id="sum"></div>` : '') +
    `<div class="card" id="t" style="padding:0"></div>`;
  const load = async () => {
    const rows = await api('sales.php' + (report ? `?from=${$('#from').value}&to=${$('#to').value}` : ''));
    if (report) $('#sum').innerHTML = cards(stat('Sales Orders', rows.length) + stat('Revenue', money(rows.reduce((a, r) => a + r.total, 0))) + stat('Collected', money(rows.reduce((a, r) => a + r.paid, 0))) + stat('Outstanding', money(rows.reduce((a, r) => a + r.total - r.paid, 0))));
    $('#t').innerHTML = tbl([['Invoice', r => `<b>${esc(r.invoice_no)}</b>`], ['Date', r => esc(day(r.created_at))], ['Customer', r => esc(r.customer || 'Walk-in')], ['Payment', r => esc(r.payment_method)],
      ['Total', r => money(r.total)], ['Status', r => r.paid >= r.total ? '<span class="badge badge-success">Paid</span>' : '<span class="badge badge-warning">Owing ' + money(r.total - r.paid) + '</span>'],
      ['', r => `<a href="../invoices/invoice-details.html?id=${r.id}" class="btn btn-secondary btn-sm">View</a> <button class="btn btn-secondary btn-sm" data-inv="${r.id}">Print</button>`]], rows, 'No sales yet.');
  };
  $('#t').onclick = e => { const b = e.target.closest('[data-inv]'); if (b) showInvoice(b.dataset.inv).catch(bad); };
  if (report) $('#run').onclick = () => load().catch(bad);
  load().catch(bad);
}

/* ============================================
   Purchases List & Report
   ============================================ */
async function purchasesList(report) {
  root().innerHTML = head(report ? 'Purchase Report' : 'Purchases', report ? 'Procurement spending and vendor purchase orders.' : 'Stock received from suppliers.', report ? '' : `<a class="btn btn-primary" href="add-purchase.html">+ New Purchase</a>`) +
    (report ? `<div class="card" style="padding:14px;margin-bottom:16px;display:flex;gap:12px;align-items:end;flex-wrap:wrap"><div>${fld('From', `<input id="from" type="date" class="form-input" value="${today().slice(0, 8)}01">`)}</div><div>${fld('To', `<input id="to" type="date" class="form-input" value="${today()}">`)}</div><button class="btn btn-primary" id="run">Run Report</button></div><div id="sum"></div>` : '') +
    `<div class="card" id="t" style="padding:0"></div>`;
  const load = async () => {
    const rows = await api('purchases.php' + (report ? `?from=${$('#from').value}&to=${$('#to').value}` : ''));
    if (report) {
      const tot = rows.reduce((a, r) => a + r.total, 0), pd = rows.reduce((a, r) => a + r.paid, 0);
      $('#sum').innerHTML = cards(stat('Purchase Orders', rows.length) + stat('Total Spent', money(tot)) + stat('Paid to Vendors', money(pd)) + stat('Outstanding', money(tot - pd)));
    }
    $('#t').innerHTML = tbl([['Date', r => esc(r.purchase_date || day(r.created_at))], ['Reference', r => esc(r.ref || '#' + r.id)], ['Supplier', r => esc(r.supplier || '—')], ['Total', r => money(r.total)],
      ['Paid', r => money(r.paid)], ['Status', r => r.paid >= r.total ? '<span class="badge badge-success">Paid</span>' : '<span class="badge badge-warning">Owing ' + money(r.total - r.paid) + '</span>']], rows, 'No purchases yet.');
  };
  if (report) $('#run').onclick = () => load().catch(bad);
  load().catch(bad);
}

/* ============================================
   Profit & Loss Report
   ============================================ */
async function profitAndLossReport() {
  root().innerHTML = head('Profit & Loss Statement', 'Comprehensive income statement, COGS analysis, overhead expenses, and net profit.') +
    `<div class="card" style="padding:14px;margin-bottom:16px;display:flex;gap:12px;align-items:end;flex-wrap:wrap">
      <div>${fld('From Date', `<input id="from" type="date" class="form-input" value="${today().slice(0, 8)}01">`)}</div>
      <div>${fld('To Date', `<input id="to" type="date" class="form-input" value="${today()}">`)}</div>
      <button class="btn btn-primary" id="run">Generate Statement</button>
    </div>
    <div id="summary"></div>
    <div id="breakdown"></div>`;

  const load = async () => {
    const data = await api(`reports.php?type=pl&from=${$('#from').value}&to=${$('#to').value}`);
    $('#summary').innerHTML = cards(
      stat('Total Revenue', money(data.revenue), `${data.sales_count} sales transactions`) +
      stat('Cost of Goods (COGS)', money(data.cogs), 'Inventory cost of items sold') +
      stat('Operating Expenses', money(data.total_expenses), `${data.expense_categories.length} expense categories`) +
      stat('Net Profit', money(data.net_profit), `${data.net_margin_percent}% Net Margin`)
    );

    $('#breakdown').innerHTML = two(
      card('Income Breakdown', `
        <div style="font-size:14px;line-height:2.2;">
          <div style="display:flex;justify-content:space-between;"><span>Gross Subtotal:</span> <b>${money(data.subtotal)}</b></div>
          <div style="display:flex;justify-content:space-between;color:var(--muted)"><span>Sales Discounts:</span> <span>-${money(data.discount)}</span></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:4px;"><span>Net Revenue:</span> <b>${money(data.revenue)}</b></div>
          <div style="display:flex;justify-content:space-between;color:var(--danger)"><span>Less: Cost of Goods Sold (COGS):</span> <span>-${money(data.cogs)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--border);padding-top:4px;color:var(--primary)"><span>Gross Profit:</span> <span>${money(data.gross_profit)}</span></div>
          <div style="display:flex;justify-content:space-between;color:var(--danger)"><span>Less: Total Operating Expenses:</span> <span>-${money(data.total_expenses)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;border-top:2px solid var(--border);padding-top:6px;color:${data.net_profit >= 0 ? 'var(--primary)' : 'var(--danger)'}"><span>Net Income / Profit:</span> <span>${money(data.net_profit)}</span></div>
        </div>
      `) +
      card('Expenses by Category', data.expense_categories.length ? tbl([
        ['Category', r => `<b>${esc(r.category)}</b>`],
        ['Entries', r => r.count],
        ['Amount', r => money(r.total)]
      ], data.expense_categories) : '<div style="padding:24px;text-align:center;color:var(--muted)">No expenses recorded for this period.</div>')
    );
  };

  $('#run').onclick = () => load().catch(bad);
  load().catch(bad);
}

/* ============================================
   Customer Report
   ============================================ */
async function customersReport() {
  const rows = await api('reports.php?type=customers');
  const totRev = rows.reduce((a, r) => a + r.total_spent, 0);
  const totOwing = rows.reduce((a, r) => a + r.outstanding, 0);

  root().innerHTML = head('Customer Report', 'Customer purchasing patterns, lifetime spend, and outstanding balances.') +
    cards(
      stat('Total Customers', rows.length) +
      stat('Total Customer Spend', money(totRev)) +
      stat('Total Receivables', money(totOwing), `${rows.filter(r => r.outstanding > 0).length} customers with balance`)
    ) +
    `<div class="card" style="padding:0">
      ${tbl([
        ['Customer', r => `<b>${esc(r.name)}</b>${sub(esc(r.company || ''))}`],
        ['Contact', r => `${esc(r.phone || r.email || '—')}`],
        ['Orders Count', r => r.orders_count],
        ['Total Spent', r => `<b>${money(r.total_spent)}</b>`],
        ['Total Paid', r => money(r.total_paid)],
        ['Outstanding', r => `<span style="color:${r.outstanding > 0 ? 'var(--danger)' : 'var(--muted)'}">${money(r.outstanding)}</span>`],
        ['Last Order', r => esc(r.last_order_date ? day(r.last_order_date) : 'Never')]
      ], rows, 'No customer records yet.')}
    </div>`;
}

/* ============================================
   Supplier Report
   ============================================ */
async function suppliersReport() {
  const rows = await api('reports.php?type=suppliers');
  const totSpend = rows.reduce((a, r) => a + r.total_spent, 0);
  const totOwing = rows.reduce((a, r) => a + r.outstanding, 0);

  root().innerHTML = head('Supplier Report', 'Vendor procurement volume, orders, and payment balances.') +
    cards(
      stat('Total Suppliers', rows.length) +
      stat('Procurement Spend', money(totSpend)) +
      stat('Outstanding Payables', money(totOwing), `${rows.filter(r => r.outstanding > 0).length} vendors owing`)
    ) +
    `<div class="card" style="padding:0">
      ${tbl([
        ['Supplier', r => `<b>${esc(r.name)}</b>${sub(esc(r.company || ''))}`],
        ['Contact', r => `${esc(r.phone || r.email || '—')}`],
        ['Purchase Orders', r => r.purchases_count],
        ['Total Purchased', r => `<b>${money(r.total_spent)}</b>`],
        ['Total Paid', r => money(r.total_paid)],
        ['Balance Owed', r => `<span style="color:${r.outstanding > 0 ? 'var(--danger)' : 'var(--muted)'}">${money(r.outstanding)}</span>`],
        ['Last Purchase', r => esc(r.last_purchase_date ? day(r.last_purchase_date) : 'Never')]
      ], rows, 'No supplier records yet.')}
    </div>`;
}

/* ============================================
   Inventory Report
   ============================================ */
async function inventoryReport() {
  const p = await api('products.php');
  const cost = p.reduce((a, x) => a + x.stock * x.purchasePrice, 0), retail = p.reduce((a, x) => a + x.stock * x.sellingPrice, 0);
  root().innerHTML = head('Inventory Report', 'Current stock valuation and turnover alert.') +
    cards(stat('Units in Stock', p.reduce((a, x) => a + x.stock, 0)) + stat('Value at Cost', money(cost)) + stat('Value at Retail', money(retail)) + stat('Potential Profit', money(retail - cost))) +
    `<div class="card" style="padding:0">${tbl([['Product', r => `<a href="../inventory/product-details.html?id=${r.id}" style="color:var(--text);font-weight:700;text-decoration:none;">${esc(r.name)}</a>${sub(esc(r.sku))}`], ['Category', r => esc(r.category)], ['Stock', r => `<b>${r.stock}</b>`], ['Min', r => r.minStock],
      ['Cost Value', r => money(r.stock * r.purchasePrice)], ['Retail Value', r => money(r.stock * r.sellingPrice)],
      ['Status', r => r.stock <= 0 ? '<span class="badge badge-danger">Out</span>' : r.stock <= r.minStock ? '<span class="badge badge-warning">Low</span>' : '<span class="badge badge-success">OK</span>']], p)}</div>`;
}

/* ============================================
   Users & Team Management Page
   ============================================ */
async function usersPage() {
  let rows = [];
  root().innerHTML = head('Team & Users', 'Manage staff accounts, access permissions, and roles.', `<button class="btn btn-primary" id="add-user">+ Add Team Member</button>`) +
    `<div id="user-stats"></div><div class="card" style="padding:0"><div id="user-table"></div></div>`;

  const draw = () => {
    $('#user-stats').innerHTML = cards(
      stat('Total Users', rows.length) +
      stat('Admins', rows.filter(r => r.role === 'admin').length) +
      stat('Managers', rows.filter(r => r.role === 'manager').length) +
      stat('Staff Members', rows.filter(r => r.role === 'staff').length)
    );

    $('#user-table').innerHTML = tbl([
      ['Name', r => `<b>${esc(r.name)}</b>`],
      ['Email', r => esc(r.email)],
      ['Role', r => `<span class="badge ${r.role === 'admin' ? 'badge-primary' : r.role === 'manager' ? 'badge-info' : 'badge-gray'}">${esc(r.role)}</span>`],
      ['Status', r => r.active == 1 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'],
      ['Created', r => esc(day(r.created_at))],
      ['Action', r => `<button class="btn btn-secondary btn-sm" data-edit="${r.id}">Edit</button> <button class="btn btn-danger btn-sm" data-del="${r.id}">Delete</button>`]
    ], rows);
  };

  const load = async () => {
    rows = await api('users.php');
    draw();
  };

  const userForm = r => {
    modal(r ? 'Edit User' : 'Add Team Member', `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${fld('Full Name *', `<input id="u-name" class="form-input" value="${esc(r ? r.name : '')}" required>`)}
        ${fld('Email Address *', `<input id="u-email" type="email" class="form-input" value="${esc(r ? r.email : '')}" required>`)}
        ${fld('Role *', `
          <select id="u-role" class="form-input form-select">
            <option value="staff"${r && r.role === 'staff' ? ' selected' : ''}>Staff (Sales & POS access)</option>
            <option value="manager"${r && r.role === 'manager' ? ' selected' : ''}>Manager (Inventory, Purchases, Reports)</option>
            <option value="admin"${r && r.role === 'admin' ? ' selected' : ''}>Admin (Full System Access)</option>
          </select>
        `)}
        ${fld(r ? 'New Password (leave blank to keep current)' : 'Password (min 8 chars) *', `<input id="u-pass" type="password" class="form-input" placeholder="${r ? '••••••••' : 'Password'}">`)}
        ${r ? `
          <div>
            <label class="form-label">Account Status</label>
            <select id="u-active" class="form-input form-select">
              <option value="1"${r.active == 1 ? ' selected' : ''}>Active</option>
              <option value="0"${r.active == 0 ? ' selected' : ''}>Inactive / Suspended</option>
            </select>
          </div>
        ` : ''}
      </div>
    `, 'Save User', async () => {
      const name = $('#u-name').value.trim();
      const email = $('#u-email').value.trim();
      const role = $('#u-role').value;
      const password = $('#u-pass').value;
      if (!name || !email) { Toast.error('Name and email are required', 'Validation Error'); return false; }
      if (!r && (!password || password.length < 8)) { Toast.error('Password must be at least 8 characters', 'Validation Error'); return false; }

      const body = { name, email, role, password };
      if (r) body.active = $('#u-active').value;

      await api('users.php' + (r ? '?id=' + r.id : ''), { method: r ? 'PUT' : 'POST', body });
      Toast.success('User updated successfully', 'Done');
      load();
    });
  };

  $('#add-user').onclick = () => userForm(null);
  $('#user-table').onclick = e => {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-del]');
    if (editBtn) userForm(rows.find(r => r.id == editBtn.dataset.edit));
    if (delBtn) {
      Modal.confirm({
        title: 'Delete Team Member', message: 'Are you sure? This user will no longer be able to log in.', type: 'danger', confirmText: 'Delete',
        onConfirm: () => api('users.php?id=' + delBtn.dataset.del, { method: 'DELETE' }).then(() => { Toast.success('User deleted', 'Done'); load(); }).catch(bad)
      });
    }
  };

  load().catch(bad);
}

/* ============================================
   Roles & Permissions Matrix Page
   ============================================ */
async function rolesPage() {
  root().innerHTML = head('Roles & Permissions', 'Access control matrix across system modules.') +
    `<div class="card" style="padding:0">
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Module / Permission</th>
              <th style="text-align:center;"><span class="badge badge-primary">Admin</span></th>
              <th style="text-align:center;"><span class="badge badge-info">Manager</span></th>
              <th style="text-align:center;"><span class="badge badge-gray">Staff</span></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><b>Dashboard Overview</b></td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">✅ View Only</td></tr>
            <tr><td><b>Point of Sale (POS) & Sales</b></td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">✅ Create & View</td></tr>
            <tr><td><b>Inventory & Product Catalog</b></td><td style="text-align:center;">✅ Create/Edit/Delete</td><td style="text-align:center;">✅ Create/Edit</td><td style="text-align:center;">✅ View Only</td></tr>
            <tr><td><b>Stock Adjustments</b></td><td style="text-align:center;">✅ Apply</td><td style="text-align:center;">✅ Apply</td><td style="text-align:center;">❌ No</td></tr>
            <tr><td><b>Purchases & Suppliers</b></td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">❌ No</td></tr>
            <tr><td><b>Financials & Profit & Loss</b></td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">❌ No</td></tr>
            <tr><td><b>Team & User Management</b></td><td style="text-align:center;">✅ Full</td><td style="text-align:center;">❌ No</td><td style="text-align:center;">❌ No</td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ============================================
   Profile Page
   ============================================ */
async function profilePage() {
  const u = await api('auth.php?action=me');
  root().innerHTML = `
    <div class="page-header">
      <div>
        <div class="breadcrumb"><a href="../dashboard.html">Home</a><span class="sep">/</span><span class="current">My Profile</span></div>
        <h1 class="page-title">My Profile</h1>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
      <div class="card" style="padding:24px;text-align:center;">
        <div class="avatar avatar-lg w-20 h-20 text-[28px] mx-auto mb-4 bg-[var(--primary)] text-white flex items-center justify-center rounded-full font-bold">
          ${(u.name || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        <h2 style="font-size:18px;font-weight:700;margin:0;">${esc(u.name)}</h2>
        <div style="font-size:13px;color:var(--muted);margin-top:2px;">${esc(u.email)}</div>
        <div style="margin-top:12px;"><span class="badge badge-primary">${esc(u.role).toUpperCase()}</span></div>
      </div>

      <div class="card" style="padding:24px;">
        <h3 style="font-weight:700;margin-bottom:16px;">Update Information</h3>
        <form id="prof-form" style="display:flex;flex-direction:column;gap:14px;">
          ${fld('Full Name', `<input id="p-name" class="form-input" value="${esc(u.name)}" required>`)}
          ${fld('Email Address', `<input id="p-email" type="email" class="form-input" value="${esc(u.email)}" required>`)}
          <hr style="border:0;border-top:1px solid var(--border);margin:8px 0;">
          <h4 style="font-weight:600;font-size:14px;margin:0;">Change Password</h4>
          ${fld('Current Password', `<input id="p-cur-pw" type="password" class="form-input" placeholder="Current password">`)}
          ${fld('New Password (min 8 chars)', `<input id="p-new-pw" type="password" class="form-input" placeholder="New password">`)}
          <button type="submit" class="btn btn-primary" id="save-prof" style="align-self:flex-start;margin-top:8px;">Save Profile</button>
        </form>
      </div>
    </div>
  `;

  $('#prof-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = $('#p-name').value.trim();
    const email = $('#p-email').value.trim();
    const current_password = $('#p-cur-pw').value;
    const new_password = $('#p-new-pw').value;

    const body = { name, email };
    if (new_password) {
      if (!current_password) return Toast.error('Enter your current password to set a new password', 'Error');
      body.current_password = current_password;
      body.new_password = new_password;
    }

    try {
      $('#save-prof').disabled = true;
      const res = await api('auth.php?action=profile', { method: 'POST', body });
      Toast.success('Profile updated successfully', 'Saved');
      window.CURRENT_USER = Object.assign(window.CURRENT_USER || {}, res);
      if (typeof initHeaderUser === 'function') initHeaderUser();
      $('#p-cur-pw').value = '';
      $('#p-new-pw').value = '';
    } catch (err) {
      bad(err);
    } finally {
      $('#save-prof').disabled = false;
    }
  };
}

/* ============================================
   Returns History Pages
   ============================================ */
async function returnsPage(kind) {
  const sale = kind === 'sale';
  const movements = await api('stock.php');
  const filtered = movements.filter(m => (sale ? m.type === 'sale' : m.type === 'purchase') || m.type === 'adjustment');

  root().innerHTML = head(sale ? 'Sales Returns & Adjustments' : 'Purchase Returns & Adjustments', 'Audit log of returned items and quantity deductions.') +
    `<div class="card" style="padding:0">
      ${tbl([
        ['Date', r => esc(day(r.created_at))],
        ['Product', r => `<b>${esc(r.name)}</b>${sub(esc(r.sku))}`],
        ['Type', r => `<span class="badge badge-info">${esc(r.type)}</span>`],
        ['Qty', r => `<b style="color:${r.qty < 0 ? 'var(--danger)' : 'var(--primary)'}">${r.qty > 0 ? '+' : ''}${r.qty}</b>`],
        ['Note', r => esc(r.note || '—')]
      ], filtered, 'No returns recorded yet.')}
    </div>`;
}

/* ============================================
   Dashboard Overview
   ============================================ */
async function dashboard() {
  const d = await api('dashboard.php'), max = Math.max(1, ...d.last7.map(x => x.total));
  root().innerHTML = head('Dashboard', 'Live executive overview of inventory and finances.') +
    cards(
      stat('Stock Value', money(d.stock_value), d.products + ' active products') +
      stat('Sales Today', money(d.today_sales), 'This month: ' + money(d.month_sales)) +
      stat('Profit This Month', money(d.profit), 'After cost of goods and expenses') +
      stat('Low / Out of Stock', d.low + ' / ' + d.out, 'Needs restocking')
    ) +
    two(
      card('Sales — Last 7 Days', `<div style="display:flex;gap:8px;align-items:flex-end;height:150px">${d.last7.map(x =>
        `<div style="flex:1;text-align:center" title="${money(x.total)}"><div style="height:${Math.round(x.total / max * 110)}px;min-height:2px;background:var(--primary);border-radius:6px 6px 0 0"></div><div style="font-size:11px;color:var(--muted);margin-top:4px;">${x.day.slice(5)}</div></div>`).join('')}</div>`) +
      card('Low Stock Alert', tbl([['Product', r => esc(r.name)], ['Stock', r => `<b>${r.stock}</b> / min ${r.min_stock}`]], d.low_items, 'All stocked up.')) +
      card('Recent Sales', tbl([['Invoice', r => `<a href="invoices/invoice-details.html?id=${r.id || ''}" style="color:var(--primary);font-weight:700;text-decoration:none;">${esc(r.invoice_no)}</a>`], ['Customer', r => esc(r.customer || 'Walk-in')], ['Total', r => money(r.total)]], d.recent, 'No sales yet.')) +
      card('Top Sellers (30 Days)', tbl([['Product', r => esc(r.name)], ['Units Sold', r => r.qty], ['Revenue', r => money(r.revenue)]], d.top, 'No sales yet.'))
    );
}

/* ============================================
   Page Router Dispatcher
   ============================================ */
document.addEventListener('DOMContentLoaded', () => setTimeout(async () => {
  const k = window.PAGE_KIND; if (!k || !root()) return;
  try {
    if (k.startsWith('crud:')) await crudPage(k.slice(5));
    else await ({
      stock: stockPage,
      sale: () => docPage('sale'),
      purchase: () => docPage('purchase'),
      sales: () => salesList(false),
      'rpt-sales': () => salesList(true),
      purchases: () => purchasesList(false),
      'rpt-purchases': () => purchasesList(true),
      'rpt-inv': inventoryReport,
      'rpt-pl': profitAndLossReport,
      'rpt-customers': customersReport,
      'rpt-suppliers': suppliersReport,
      invoices: invoicesListPage,
      'invoice-details': invoiceDetailsPage,
      'product-details': productDetailsPage,
      users: usersPage,
      roles: rolesPage,
      profile: profilePage,
      'sales-returns': () => returnsPage('sale'),
      'purchase-returns': () => returnsPage('purchase'),
      dashboard
    }[k])();
  } catch (e) { bad(e); }
}, 300));
