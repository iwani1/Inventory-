# Lush View Bar — Inventory & POS (`iwani1/Inventory-`)

Deployable PHP 8.1+ / SQLite Point-of-Sale and Inventory Management application for **Lush View Bar**.

This repository intentionally holds only the shipped artifact and its launcher:

| File | What it is |
|---|---|
| **`lushview-bar-fixed.zip`** | Repaired, ready-to-deploy cPanel build (`README.txt` + `public_html/`) with all 12 PHP endpoints, fixed sidebar/hamburger CSS & JS, rebuilt `tailwind.css`, bar-specific installer seeds, `favicon.svg`, and the cocktail-glass logo. |
| **`reset-and-run-fedora.sh`** | Unpacks the zip and serves it locally on Fedora (PHP + SQLite). |
| `README.md` | This file. |

`lushview-bar-fixed.zip` SHA-256: `a3f5d64772cbf3e1bdfb44d7181297f2118730bcbe3aee8e3b618a170bce35cc`

Everything else — superseded archives, report documents, and the `extracted/` / `tests/` scratch trees — has been removed. The prior builds remain in git history (`git log --diff-filter=D --name-only`).

---

## Quick start (Fedora / local)

```bash
./reset-and-run-fedora.sh
```

The script unpacks `lushview-bar-fixed.zip` into a runtime directory **outside** the repository, resets the SQLite database, and serves the app on port 8080 — so the checkout stays at these three files.

```
1. First-time setup: http://localhost:8080/api/install.php
2. Sign in:          http://localhost:8080/pages/login.html
3. Dashboard:        http://localhost:8080/dashboard.html
```

### Options

| Invocation | Effect |
|---|---|
| `./reset-and-run-fedora.sh` | Unpack, reset the database, serve on `:8080` |
| `./reset-and-run-fedora.sh --keep-db` | Keep the existing SQLite database |
| `./reset-and-run-fedora.sh --clean` | Discard the previous unpack and re-unpack the zip |
| `./reset-and-run-fedora.sh --git-reset` | Also hard-reset the checkout to `origin/main` |
| `PORT=9000 ./reset-and-run-fedora.sh` | Serve on a different port |
| `./reset-and-run-fedora.sh --help` | Show usage |

The unpack location defaults to `${XDG_DATA_HOME:-$HOME/.local/share}/lushview-bar`; override it with `LUSHVIEW_RUNTIME_DIR=/path ./reset-and-run-fedora.sh`. The script re-unpacks automatically when the zip's SHA-256 changes.

Requires `unzip` plus PHP CLI with `pdo_sqlite` (`sudo dnf install -y php-cli php-pdo sqlite unzip`); the script installs the PHP packages for you on Fedora.

> The `--wasm` flag is gone. The Node `php-wasm` fallback lived in the now-deleted `extracted/preview/` scratch tree.

## Deploying to cPanel / GreenGeeks

1. Upload the *contents* of `public_html/` from the zip into your host's `public_html/` root. Full step-by-step instructions are in `README.txt`, bundled inside the zip.
2. Use PHP 8.1 or newer with `pdo_sqlite`, `sqlite3`, `session`, and `json` enabled.
3. Visit `https://yourdomain.com/api/install.php`, create the admin user, then **delete `install.php`**.
4. Log in at `https://yourdomain.com/pages/login.html`.
5. Edit business name and currency in `assets/js/pages.js` (`CUR`, `BIZ`), or under Settings → General / Sales.

### Where the database lives

`api/db.php` resolves its data directory to `__DIR__ . '/../../lushview-data'` — i.e. a `lushview-data/` folder **as a sibling of `public_html/`, outside the web root**, holding `lushview.sqlite`. Run the script locally and that is `<runtime>/lushview-bar/lushview-data/lushview.sqlite`; on cPanel it is `/home/<user>/lushview-data/lushview.sqlite`.

## Rebuilding the CSS

`tailwind.config.js`, `postcss.config.js`, `src/input.css` and `package.json` ship inside the zip, so the stylesheet can be rebuilt from an unpacked copy:

```bash
cd <runtime>/lushview-bar/public_html
npm install
npm run build     # one-off build; npm run watch for development
```

Tailwind is invoked through `npx`, so any current Node LTS (18+) works. `package.json` pins `tailwindcss ^3.4.17`.
