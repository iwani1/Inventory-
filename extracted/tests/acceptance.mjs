import { PHP, PHPRequestHandler } from '@php-wasm/universal';
import { loadNodeRuntime, createNodeFsMountHandler } from '@php-wasm/node';
import fs from 'node:fs';

const APP = '/home/user/Inventory-/extracted/lushview-bar/public_html';
const DATA = '/home/user/Inventory-/extracted/lushview-bar/lushview-data';
fs.rmSync(DATA, { recursive: true, force: true });   // clean install

const php = new PHP(await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 7 } }));
php.mount('/site', createNodeFsMountHandler(APP));
const handler = new PHPRequestHandler({ php, documentRoot: '/site', absoluteUrl: 'http://localhost' });

let pass = 0, fail = 0;
const results = [];

async function call(label, method, url, body, opts = {}) {
  const headers = {};
  let payload;
  if (method !== 'GET') headers['X-Requested-With'] = 'fetch';
  if (body !== undefined) {
    if (opts.form) { headers['Content-Type'] = 'application/x-www-form-urlencoded'; payload = new URLSearchParams(body).toString(); }
    else { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  }
  let res, text = '', json = null;
  try {
    res = await handler.request({ method, url, headers, body: payload });
    text = res.text ?? '';
    try { json = JSON.parse(text); } catch {}
  } catch (e) {
    res = { httpStatusCode: 'ERR' }; text = String(e && e.message || e);
  }
  const expect = opts.expect ?? 200;
  const ok = res.httpStatusCode === expect && (opts.check ? opts.check(json, text) : true);
  ok ? pass++ : fail++;
  results.push({ ok, label, status: res.httpStatusCode, expect, body: json ?? text.slice(0, 160) });
  return { json, text, status: res.httpStatusCode };
}

const J = o => JSON.stringify(o);

/* 1. first-run install */
await call('GET  /api/install.php (fresh install form)', 'GET', '/api/install.php', undefined,
  { check: (j, t) => /Create admin/.test(t) });
await call('POST /api/install.php (create admin)', 'POST', '/api/install.php',
  { name: 'Ama Mensah', email: 'ama@lushview.test', password: 'bar12345' },
  { form: true, check: (j, t) => /Admin created/.test(t) });

/* 2. auth */
await call('POST /api/auth.php?action=login', 'POST', '/api/auth.php?action=login',
  { email: 'ama@lushview.test', password: 'bar12345' },
  { check: j => j && j.role === 'admin', expect: 200 });
await call('GET  /api/auth.php (me)', 'GET', '/api/auth.php', undefined,
  { check: j => j && j.email === 'ama@lushview.test' });
await call('POST /api/auth.php?action=login (bad password blocked)', 'POST', '/api/auth.php?action=login',
  { email: 'ama@lushview.test', password: 'wrong-pass' }, { expect: 401 });

/* 3. reference data + catalogue */
await call('GET  /api/lookups.php (installed categories/units)', 'GET', '/api/lookups.php', undefined,
  { check: j => j && j.categories.length >= 4 && j.units.length >= 7 });
const cat = (await call('GET  /api/lookups.php -> first category id', 'GET', '/api/lookups.php')).json;
const catId = cat.categories[0].id;

const p1 = await call('POST /api/products.php (create product)', 'POST', '/api/products.php',
  { name: 'Jameson Whiskey 750ml', sku: 'LV-0001', category_id: catId, purchase_price: 180, selling_price: 260,
    opening_stock: 24, min_stock: 5, status: 'Active' }, { expect: 201, check: j => j && j.id === 1 });
const p2 = await call('POST /api/products.php (create product 2)', 'POST', '/api/products.php',
  { name: 'Club Beer 330ml', sku: 'LV-0002', category_id: catId, purchase_price: 12, selling_price: 20,
    opening_stock: 120, status: 'Active' }, { expect: 201, check: j => j && j.id === 2 });
await call('GET  /api/products.php (list)', 'GET', '/api/products.php', undefined,
  { check: j => Array.isArray(j) && j.length === 2 && j[0].stock === 120 });
await call('GET  /api/products.php?id=1 (detail)', 'GET', '/api/products.php?id=1', undefined,
  { check: j => j && j.sku === 'LV-0001' && j.sellingPrice === 260 });

/* 4. master data via crud.php */
const cust = await call('POST /api/crud.php?e=customers', 'POST', '/api/crud.php?e=customers',
  { name: 'Kojo Owusu', phone: '0244000111', city: 'Accra' }, { expect: 201, check: j => j && j.id === 1 });
const sup = await call('POST /api/crud.php?e=suppliers', 'POST', '/api/crud.php?e=suppliers',
  { name: 'Accra Beverages Ltd', email: 'sales@accrabeverages.test', phone: '0302000222' }, { expect: 201, check: j => j && j.id === 1 });
await call('POST /api/crud.php?e=expenses', 'POST', '/api/crud.php?e=expenses',
  { title: 'Electricity', category: 'Utilities', amount: 450.5, expense_date: new Date().toISOString().slice(0, 10) },
  { expect: 201, check: j => j && j.id === 1 });

/* 5. SALES — the repaired sales path + stock decrement + movements */
await call('POST /api/sales.php (sell 2 whiskey + 12 beer)', 'POST', '/api/sales.php',
  { customer_id: cust.json.id, payment_method: 'Cash', discount: 20, tax_percent: 0,
    items: [{ product_id: 1, qty: 2 }, { product_id: 2, qty: 12 }] },
  { expect: 201, check: j => j && j.id === 1 });
const sale = await call('GET  /api/sales.php?id=1 (detail + items)', 'GET', '/api/sales.php?id=1', undefined,
  { check: j => j && j.items.length === 2 && j.invoice_no === 'INV-00001' });
const s = sale.json;
const expectTotal = (2 * 260 + 12 * 20) - 20;
await call(`GET  /api/sales.php?id=1 totals (subtotal 760, total ${expectTotal})`, 'GET', '/api/sales.php?id=1', undefined,
  { check: j => j.subtotal === 760 && j.total === expectTotal && j.customer === 'Kojo Owusu' });
await call('GET  /api/sales.php (list)', 'GET', '/api/sales.php', undefined, { check: j => Array.isArray(j) && j.length === 1 });
await call('POST /api/sales.php (oversell blocked)', 'POST', '/api/sales.php',
  { items: [{ product_id: 1, qty: 999 }] }, { expect: 400, check: j => j && /Not enough stock/.test(j.error) });
await call('GET  /api/products.php (stock decremented 24->22, 120->108)', 'GET', '/api/products.php?id=1', undefined,
  { check: j => j.stock === 22 });
await call('GET  /api/products.php?id=2 (stock 108)', 'GET', '/api/products.php?id=2', undefined, { check: j => j.stock === 108 });

/* 6. STOCK endpoint (repaired file) */
await call('GET  /api/stock.php (audit trail: 2 opening + 2 sale lines)', 'GET', '/api/stock.php', undefined,
  { check: j => Array.isArray(j) && j.length === 4 });
await call('GET  /api/stock.php?product_id=1 (filtered)', 'GET', '/api/stock.php?product_id=1', undefined,
  { check: j => Array.isArray(j) && j.length === 2 });
await call('POST /api/stock.php (adjustment +5)', 'POST', '/api/stock.php',
  { product_id: 1, type: 'add', qty: 5, note: 'Stock count correction' }, { check: j => j && j.ok === true });
await call('POST /api/stock.php (over-remove blocked)', 'POST', '/api/stock.php',
  { product_id: 1, type: 'remove', qty: 999 }, { expect: 400, check: j => /Not enough stock/.test(j.error) });
await call('GET  /api/products.php?id=1 (stock now 27)', 'GET', '/api/products.php?id=1', undefined, { check: j => j.stock === 27 });

/* 7. PURCHASES endpoint (repaired file) */
await call('POST /api/purchases.php (buy 24 whiskey @150)', 'POST', '/api/purchases.php',
  { ref: 'PO-1001', supplier_id: sup.json.id, purchase_date: new Date().toISOString().slice(0, 10), paid: 1000,
    items: [{ product_id: 1, qty: 24, cost: 150 }] }, { expect: 201, check: j => j && j.id === 1 });
await call('GET  /api/purchases.php (list joins supplier)', 'GET', '/api/purchases.php', undefined,
  { check: j => Array.isArray(j) && j.length === 1 && j[0].supplier === 'Accra Beverages Ltd' && j[0].total === 3600 });
await call('GET  /api/purchases.php?id=1 (detail + items)', 'GET', '/api/purchases.php?id=1', undefined,
  { check: j => j && j.items.length === 1 && j.items[0].qty === 24 && j.supplier_email === 'sales@accrabeverages.test' });
await call('GET  /api/products.php?id=1 (stock 27+24=51, cost updated to 150)', 'GET', '/api/products.php?id=1', undefined,
  { check: j => j.stock === 51 && j.purchasePrice === 150 });

/* 8. USERS endpoint (repaired file) */
await call('GET  /api/users.php (list)', 'GET', '/api/users.php', undefined,
  { check: j => Array.isArray(j) && j.length === 1 });
const nu = await call('POST /api/users.php (add staff)', 'POST', '/api/users.php',
  { name: 'Yaw Boateng', email: 'yaw@lushview.test', password: 'staffpass1', role: 'staff' },
  { expect: 201, check: j => j && j.id === 2 });
await call('GET  /api/users.php?id=2', 'GET', '/api/users.php?id=2', undefined,
  { check: j => j && j.email === 'yaw@lushview.test' && j.role === 'staff' });
await call('PUT  /api/users.php?id=2 (promote to manager)', 'PUT', '/api/users.php?id=2',
  { name: 'Yaw Boateng', email: 'yaw@lushview.test', role: 'manager', active: 1 }, { check: j => j && j.ok === true });
await call('PUT  /api/users.php?id=2 (duplicate email rejected)', 'PUT', '/api/users.php?id=2',
  { name: 'Yaw Boateng', email: 'ama@lushview.test', role: 'manager' }, { expect: 409 });
await call('DELETE /api/users.php?id=2', 'DELETE', '/api/users.php?id=2', undefined, { check: j => j && j.ok === true });
await call('DELETE /api/users.php?id=1 (cannot delete self)', 'DELETE', '/api/users.php?id=1', undefined, { expect: 400 });

/* 9. REPORTS endpoint (repaired file) — cross-check the maths */
const ym = new Date().toISOString().slice(0, 7);
const pl = await call('GET  /api/reports.php?type=pl (P&L maths)', 'GET',
  `/api/reports.php?type=pl&from=${ym}-01&to=${new Date().toISOString().slice(0, 10)}`, undefined,
  { check: j => j && j.revenue === 740 });
const plj = pl.json;
const cogsExpected = 2 * 180 + 12 * 12;      // purchase_price at time of sale
const netExpected = 740 - cogsExpected - 450.5;
console.log('\n  P&L payload:', J({ revenue: plj && plj.revenue, subtotal: plj && plj.subtotal, discount: plj && plj.discount,
  cogs: plj && plj.cogs, gross_profit: plj && plj.gross_profit, total_expenses: plj && plj.total_expenses,
  net_profit: plj && plj.net_profit, margin: plj && plj.net_margin_percent }));
console.log(`  expected: cogs=${cogsExpected}, net=${netExpected}, margin=${(netExpected / 740 * 100).toFixed(2)}`);
await call(`GET  /api/reports.php?type=pl (cogs=${cogsExpected}, net=${netExpected})`, 'GET',
  `/api/reports.php?type=pl&from=${ym}-01&to=${new Date().toISOString().slice(0, 10)}`, undefined,
  { check: j => j.cogs === cogsExpected && Math.abs(j.net_profit - netExpected) < 0.01 });
await call('GET  /api/reports.php?type=customers', 'GET', '/api/reports.php?type=customers', undefined,
  { check: j => Array.isArray(j) && j[0].name === 'Kojo Owusu' && j[0].total_spent === expectTotal });
await call('GET  /api/reports.php?type=suppliers', 'GET', '/api/reports.php?type=suppliers', undefined,
  { check: j => Array.isArray(j) && j[0].name === 'Accra Beverages Ltd' && j[0].outstanding === 2600 });
await call('GET  /api/reports.php?type=nonsense (rejected)', 'GET', '/api/reports.php?type=nonsense', undefined, { expect: 400 });

/* 10. DASHBOARD + remaining endpoints */
await call('GET  /api/dashboard.php', 'GET', '/api/dashboard.php', undefined,
  { check: j => j && j.last7 && j.last7.length === 7 });
await call('POST /api/auth.php?action=logout', 'POST', '/api/auth.php?action=logout', {});
await call('GET  /api/products.php after logout (401)', 'GET', '/api/products.php', undefined, { expect: 401 });

/* 11. schema + data-dir hardening */
const meta = await php.runStream({ code: `<?php
require '/site/api/db.php';
db();
echo "DATA_DIR=" . DATA_DIR . PHP_EOL;
echo "dir_exists=" . (is_dir(DATA_DIR) ? 'yes' : 'no') . PHP_EOL;
echo "htaccess=" . (file_exists(DATA_DIR . '/.htaccess') ? 'yes' : 'no') . PHP_EOL;
echo "sqlite=" . (file_exists(DATA_DIR . '/lushview.sqlite') ? 'yes' : 'no') . PHP_EOL;
echo "tables=" . implode(',', array_column(db()->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(), 'name')) . PHP_EOL;
echo "journal=" . db()->query('PRAGMA journal_mode')->fetchColumn() . PHP_EOL;
` });
console.log('\n--- db.php bootstrap / schema checks ---\n' + await meta.stdoutText);

/* report */
console.log('\n' + '='.repeat(96));
for (const r of results) {
  const mark = r.ok ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${String(r.status).padEnd(4)} (want ${String(r.expect).padEnd(4)})  ${r.label}`);
  if (!r.ok) console.log(`        got: ${typeof r.body === 'string' ? r.body : J(r.body).slice(0, 200)}`);
}
console.log('='.repeat(96));
console.log(`\nTOTAL: ${pass + fail} checks — ${pass} passed, ${fail} failed`);
console.log('db file created at:', fs.existsSync(DATA) ? DATA : '(not on host mount)');
process.exit(fail ? 1 : 0);
