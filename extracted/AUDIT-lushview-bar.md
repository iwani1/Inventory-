# Lush View Bar — audit, repair & verification report

**Original archive:** `lushview-bar.zip` (240 KB, 113 entries, CRC-clean)
**Repaired archive:** `lushview-bar-fixed.zip` (same 92 files, 5 of them rewritten — see below)
**Extracted working copy:** `extracted/lushview-bar/`
**Date:** 2026-10-03

## 1. What the app is

A bar POS / inventory system aimed at GreenGeeks-style cPanel hosting.

| Layer | Details |
|---|---|
| Front end | 39 static HTML pages, Tailwind CSS 3.4, 2,813 lines of vanilla JS in `assets/js/` |
| Back end | 12 PHP endpoints in `api/` — JSON over `fetch`, PHP session cookie auth, `X-Requested-With: fetch` CSRF header check |
| Storage | SQLite via PDO, DB **outside** `public_html` (`../lushview-data/lushview.sqlite`), schema auto-created, WAL mode, legacy `invenza-data` fallback |
| Setup | `api/install.php` creates the admin and seeds categories/units, then is meant to be deleted |

Areas covered: dashboard, products / categories / brands / units, stock adjustment, sales + POS, purchases, invoices, customers, suppliers, expenses, users & roles, 6 report pages, 5 settings pages, auth pages.

## 2. The defect found in the original archive

5 of the 12 PHP endpoints were **corrupted — every PHP variable sigil (`$`) stripped**, so they could not even be tokenised. `api/db.php` is required by every other endpoint, so the entire API (login included) was dead on arrival.

| File | Lines | Parser error |
|---|---|---|
| `api/db.php` | 197 | `syntax error, unexpected token "=", expecting "::"` |
| `api/users.php` | 72 | `syntax error, unexpected token "=", expecting end of file` |
| `api/reports.php` | 80 | same |
| `api/purchases.php` | 42 | same |
| `api/stock.php` | 25 | same |

Example (`api/users.php` as shipped):

```php
 = require_login();
 = db();
 = ['REQUEST_METHOD'];
```

**Cause:** the files were written through an unquoted shell heredoc / double-quoted shell string — the shell expanded `$pdo`, `$user`, `$b`, … to nothing before saving. Only variable names were lost: SQL, string literals, method names, control flow and whitespace all survived intact. `api/db.php` lost only the variables inside its `db()` function; the rest of that file (schema DDL, helpers) was unharmed. `api/purchases.php` and `api/stock.php` also contain Lush View additions (detail/history sub-endpoints) that do **not** exist in the sibling `invenza-app` archives, so they could not simply be copied over.

Not damaged: all 9 JS files (they pass `node --check`, and their `${}` template literals are intact), all HTML/CSS, and the 242 static asset references resolve. The two other project archives (`invenza-app.zip`, `invenza-app php test1.zip`) are 100% clean.

## 3. The repair

All five files were rebuilt **in place** in `extracted/lushview-bar/public_html/api/`, preserving every feature. Variable names were taken from the intact sibling archive where the same code exists (`invenza-app php test1`: `db.php`, `purchases.php`, `stock.php` use identical lines and names), and from the surrounding code and schema for the two Lush-View-only files (`users.php`, `reports.php`).

Names restored:

| File | Variables reintroduced |
|---|---|
| `db.php` | `$pdo`, `$dir`, `$dbFile` (inside `db()` only) |
| `purchases.php` | `$user`, `$pdo`, `$sel`, `$st`, `$row`, `$it`, `$p`, `$pid`, `$total`, `$qty`, `$cost`, `$prod`, `$r`, `$e`, `$b`, `$items`, `$from`, `$to`, `$id` |
| `stock.php` | `$user`, `$pdo`, `$st`, `$b`, `$pid`, `$qty`, `$sign`, `$p`, `$e` |
| `users.php` | `$user`, `$pdo`, `$method`, `$id`, `$st`, `$u`, `$b`, `$name`, `$email`, `$pass`, `$role`, `$active`, `$e` |
| `reports.php` | `$user`, `$pdo`, `$type`, `$from`, `$to`, `$st`, `$sales`, `$cogs`, `$expenses`, `$totalExpenses`, `$revenue`, `$gross`, `$net`, `$margin`, `$rows` |

No other file was touched: the repaired archive differs from the original in exactly those 5 paths.

## 4. Verification (three independent layers)

1. **Parse check** — every PHP file tokenised with a real PHP 8.3.33 engine (php-wasm): **12/12 OK** (was 7/12). Re-run against the packaged zip: 12/12 OK.
2. **Reconstruction proof** — stripping the `$` sigils back out of each repaired file reproduces the shipped file **byte-for-byte** (`diff` clean). This proves the logic, SQL, strings and whitespace are exactly what the author wrote, and that the only change is restoring variable names.
3. **Live acceptance test** — the app was booted on PHP 8.3.33 + SQLite (PDO, WAL confirmed) with a real request handler and exercised end-to-end: **45/45 checks passed**.

   Covered: fresh `install.php` → admin created + categories/units seeded; login / `me` / wrong-password 401 / logout / post-logout 401; product create (opening stock + movement) and GET list/detail; customer, supplier, expense creation; **sale** of 2×whiskey + 12×beer → `subtotal 760, discount 20, total 740`, stock decremented 24→22 and 120→108, movements logged, oversell rejected; **stock adjustment** +5, over-remove rejected; **purchase** 24×@150 → total 3600, stock 27→51, moving-average cost updated; purchase list (supplier join) + detail with line items; **users** list/detail/create/promote/duplicate-email 409/delete/self-delete blocked; **reports** P&L cross-checked by hand (`cogs 504`, `net −214.5`, `margin −28.99 %`, expense categories), customer report (`total_spent 740`), supplier report (`outstanding 2600`), unknown type 400; dashboard KPIs and 7-day series; DB directory + `.htaccess` hardening and all 13 tables created.

   Test harness kept at `extracted/tests/` (`php-lint.mjs`, `acceptance.mjs`; needs `npm i @php-wasm/node php-wasm`, run with Node 18+).

## 5. Deploying the repaired build

1. Upload the **contents** of `public_html/` into the site's `public_html/` (overwrite).
2. cPanel → PHP 8.1+ with `pdo_sqlite`, `sqlite3`, `session`, `json` enabled.
3. Visit `https://yourdomain.com/api/install.php`, create the admin, then **delete `api/install.php`**.
4. Log in at `/pages/login.html`. Business name/currency live in `assets/js/pages.js` (`window.CUR`, `window.BIZ`) or in Settings.

## 6. Live preview

`extracted/preview/server.mjs` serves the repaired build for testing (Node `http` + the same php-wasm
runtime, `0.0.0.0:8080`). Open `/api/install.php` first to create an admin, exactly like on cPanel;
the SQLite file lives in the in-memory VFS, so data resets whenever the server restarts. This preview
is for testing only — deploy `lushview-bar-fixed.zip` for real.

## 7. Artifacts in this repo

| Path | What it is |
|---|---|
| `lushview-bar-fixed.zip` | ready-to-upload repaired build (same layout as the original) |
| `extracted/lushview-bar/` | the working copy that was repaired |
| `extracted/_damaged-originals/` | the 5 broken files exactly as shipped, kept for reference |
| `extracted/tests/` | PHP lint harness + 45-check acceptance suite |
| `extracted/preview/` | live preview server (php-wasm + node http) |
| `extracted/AUDIT-lushview-bar.md` | this report |
