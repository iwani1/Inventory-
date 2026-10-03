# Lush View Bar — Start Here

Welcome to the **Lush View Bar** POS & Inventory repository (`iwani1/Inventory-`).

---

## 1. Which File Should I Deploy?

Always deploy **`lushview-bar-fixed.zip`** in the repository root (also linked on the [`v1.0-fixed` release](https://github.com/iwani1/Inventory-/releases/tag/v1.0-fixed)):

- **File:** `lushview-bar-fixed.zip`
- **SHA-256:** `a3f5d64772cbf3e1bdfb44d7181297f2118730bcbe3aee8e3b618a170bce35cc`
- **Extracted working tree:** `extracted/lushview-bar/`

> **Do not deploy** `lushview-bar.zip` (the original upload with 5 broken PHP endpoints) or the older `invenza-*.zip` archives.

---

## 2. What Is Included in `lushview-bar-fixed.zip`?

1. **All 12 PHP 8.1+ / SQLite API endpoints working (`api/*.php`)** — including the 5 endpoints (`db.php`, `users.php`, `reports.php`, `purchases.php`, `stock.php`) whose `$` variable sigils were restored and verified against PHP 8.3.
2. **Styled Left Sidebar & Working Mobile Hamburger (`assets/css/app.css`, `assets/js/app.js`)**:
   - `.sidebar-nav`, `.nav-section-title`, `.nav-link`, and `.nav-label` are fully styled in `app.css` (base, hover, active, and collapsed states).
   - Clicking `#sidebar-toggle-btn` toggles `mobile-open` on mobile (`< 1024px`, matching `@media (max-width: 1023px) #sidebar.mobile-open`) and collapses/expands the sidebar on desktop.
3. **Rebuilt `assets/css/tailwind.css`** — Compiled cleanly from `src/input.css` + `tailwind.config.js` so all Lush View Bar theme classes (`#E11D48` / `#BE123C`) are present.
4. **Bar-Specific Installer Seeds & Brand Icons (Ported from PR #2)**:
   - `api/install.php` seeds 8 bar categories (`Spirits`, `Beer & Cider`, `Wine`, `Soft Drinks & Mixers`, `Cocktails`, `Ready-to-Drink`, `Bar Snacks`, `Glassware & Supplies`) and 9 bar units (`Bottle`, `Can`, `Crate`, `Keg`, `Glass`, `Shot`, `Milliliter`, `Liter`, `Pack`).
   - `assets/img/favicon.svg` linked across all 39 HTML pages, plus the cocktail-glass logo mark in the sidebar, login, and registration pages.

---

## 3. Running Locally on Fedora Linux

Run a single command from the repository root:

```bash
./reset-and-run-fedora.sh
```

Or see **[`RESET-AND-RUN.md`](RESET-AND-RUN.md)** for full step-by-step instructions.

---

## 4. Deploying to cPanel / GreenGeeks

1. Upload the **contents** of `public_html/` (from `lushview-bar-fixed.zip`) into your server's `public_html/` directory.
2. In cPanel → **Select PHP Version**, choose **PHP 8.1+** and enable `pdo_sqlite`, `sqlite3`, `session`, and `json`.
3. Visit `https://yourdomain.com/api/install.php`, create your admin account, and then **delete `api/install.php`**.
4. Log in at `https://yourdomain.com/pages/login.html`.

---

## 5. Key Documentation & Test Harnesses

| Path | Description |
|---|---|
| [`START-HERE.md`](START-HERE.md) | This quick-start overview |
| [`RESET-AND-RUN.md`](RESET-AND-RUN.md) | Step-by-step local reset & run guide for Fedora Linux |
| [`reset-and-run-fedora.sh`](reset-and-run-fedora.sh) | One-command Fedora reset, verification, and local server launcher |
| [`BRANCH-REPORT.md`](BRANCH-REPORT.md) | Full audit of all branches, PRs, shallow-clone grafts, and cleanup |
| [`HANDOFF.md`](HANDOFF.md) | Session handoff & summary of all repairs and verifications |
| [`extracted/AUDIT-lushview-bar.md`](extracted/AUDIT-lushview-bar.md) | Detailed technical audit of the PHP & CSS/JS repairs |
| `extracted/tests/sidebar-check.mjs` | 25-check verification suite for sidebar CSS, hamburger, Tailwind, bar seeds, favicon & zip sync |
| `extracted/tests/php-lint.mjs` | PHP 8.3 tokeniser/syntax check across all 12 API endpoints |
| `extracted/tests/acceptance.mjs` | 45-check end-to-end API + SQLite acceptance test suite |
