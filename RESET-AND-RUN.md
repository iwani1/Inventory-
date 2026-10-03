# Reset & Run Guide (Fedora Linux & Local Preview)

This guide explains how to reset your local clone to the latest repaired build of **Lush View Bar**, wipe any stale SQLite database state, run the verification suites, and launch the app locally on Fedora Linux (or any Linux/macOS host).

---

## Quick One-Command Run (Fedora Linux)

From the repository root:

```bash
./reset-and-run-fedora.sh
```

Or to also hard-reset your local Git checkout to `origin/main` first:

```bash
./reset-and-run-fedora.sh --git-reset
```

What the script does:
1.Optionally fetches `origin/main` (unshallowing if `.git/shallow` is present) and resets the working tree (`--git-reset`).
2. Removes `extracted/lushview-bar/lushview-data/` so `/api/install.php` starts from a clean slate (pass `--keep-db` to preserve existing data).
3. Runs `node extracted/tests/sidebar-check.mjs` (25 checks verifying sidebar CSS selectors, mobile hamburger `mobile-open` toggle, rebuilt `tailwind.css`, bar installer seeds, `favicon.svg` on all 39 pages, cocktail-glass logo, and zip sync).
4. Installs `php-cli php-pdo php-json sqlite` via `dnf` if needed (or falls back to the Node `php-wasm` server with `--wasm`).
5. Starts the server at `http://localhost:8080`.

---

## Step-by-Step Manual Instructions

### 1. Sync to the Latest `main`

```bash
git fetch --unshallow origin 2>/dev/null || git fetch origin
git checkout main
git reset --hard origin/main
```

Verify the packaged archive checksum:

```bash
sha256sum lushview-bar-fixed.zip
# Expected: a3f5d64772cbf3e1bdfb44d7181297f2118730bcbe3aee8e3b618a170bce35cc  lushview-bar-fixed.zip
```

### 2. Wipe Any Old SQLite Database

The app stores its SQLite database outside `public_html/` at `extracted/lushview-bar/lushview-data/lushview.sqlite`:

```bash
rm -rf extracted/lushview-bar/lushview-data
```

### 3. Run the App Locally

#### Option A — Native PHP CLI on Fedora (Recommended)

```bash
sudo dnf install -y php-cli php-pdo php-json sqlite
php -S 0.0.0.0:8080 -t extracted/lushview-bar/public_html
```

#### Option B — Node.js + `php-wasm` Preview Server (Zero Native PHP Required)

```bash
cd extracted/preview
npm install
node server.mjs
```

### 4. First-Time Setup & Login

1. Open **`http://localhost:8080/api/install.php`** in your browser.
2. Create your admin user (password must be at least 8 characters).
   - This automatically creates the 13 SQLite tables in WAL mode and seeds the 8 bar categories (`Spirits`, `Beer & Cider`, `Wine`, `Soft Drinks & Mixers`, `Cocktails`, `Ready-to-Drink`, `Bar Snacks`, `Glassware & Supplies`) and 9 bar units (`Bottle`, `Can`, `Crate`, `Keg`, `Glass`, `Shot`, `Milliliter`, `Liter`, `Pack`).
3. Log in at **`http://localhost:8080/pages/login.html`**.

---

## Running the Automated Verification Suites

```bash
# 1. Sidebar CSS, hamburger toggle, Tailwind build, brand assets & zip sync (25 checks)
node extracted/tests/sidebar-check.mjs

# 2. PHP 8.3 syntax/tokeniser lint across all 12 endpoints (12/12 OK)
node extracted/tests/php-lint.mjs

# 3. End-to-end API + SQLite acceptance suite (45/45 checks)
node extracted/tests/acceptance.mjs
```

*(Note: `php-lint.mjs` and `acceptance.mjs` use `@php-wasm/node` from `extracted/preview/node_modules`.)*
