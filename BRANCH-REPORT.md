# Branch & Pull Request Report (`iwani1/Inventory-`)

**Date:** 2026-10-03  
**Canonical branch:** `main`  
**Canonical release:** [`v1.0-fixed`](https://github.com/iwani1/Inventory-/releases/tag/v1.0-fixed)  
**Deployable archive:** `lushview-bar-fixed.zip` (`SHA-256: a3f5d64772cbf3e1bdfb44d7181297f2118730bcbe3aee8e3b618a170bce35cc`)

---

## 1. Shallow-Clone Warning (`.git/shallow` Graft Boundary)

When this repository is cloned with shallow history, `.git/shallow` grafts `9852109` and `f544e82`. Across a shallow graft boundary, `git merge-base --is-ancestor` and `git log main..branch` return **false negatives**.

Always run:

```bash
git fetch --unshallow --all
```

before performing any ancestry check, and do not build a `git bundle` from a shallow clone.

---

## 2. Branch Inventory & Disposition

| Branch | Tip Commit | Relationship to `main` | PR | Disposition |
|---|---|---|---|---|
| `main` | Latest merge | Canonical production branch | — | **Keep (Default branch)** |
| `arena/01a102f5-inventory` | Latest fix commit | Merged into `main` | PR #5 | **Merged** — lands sidebar/hamburger fix, rebuilt `tailwind.css`, ported PR #2 assets, guides & tests |
| `arena/01a102a4-inventory` | `31ad8c4` | Ancestor of `main` (via PR #3 merge `e37b78f`) | PR #3 (Merged) | Repaired 5 PHP endpoints (`db.php`, `users.php`, `reports.php`, `purchases.php`, `stock.php`) |
| `arena/01a10274-inventory` | `9852109` | Ancestor of `main` (identical to PR #1 merge) | — | **Deleted** (stale, 0 unique commits) |
| `iwani1-patch-1` | `f544e82` | Ancestor of `main` (uploaded `lushview-bar.zip`, merged via PR #3) | — | **Deleted** (stale, 0 unique commits) |
| `arena/01a10242-inventory` | `2553862` | Ancestor of `main` (second parent of PR #1 merge `9852109`) | PR #1 (Merged) | **Deleted** (stale, 0 unique commits) |
| `arena/01a10289-inventory` | `7e51f9a` | Parallel root off `9852109` | PR #2 (Closed) | **Valuable assets ported into `main`; PR #2 closed** (see Section 3) |
| `arena/01a102e3-inventory` | `7e51f9a` | Identical to `arena/01a10289-inventory` (`7e51f9a`) | PR #4 (Closed) | Duplicate of PR #2 (`7e51f9a`) |

---

## 3. Detailed Comparison: `main` (`lushview-bar-fixed.zip`) vs PR #2 (`lush-view-bar-app-php.zip`)

PR #2 (`arena/01a10289-inventory`, commit `7e51f9a`) was created by rebranding `invenza-app php test1.zip` directly, whereas `lushview-bar.zip` (repaired on `main` as `lushview-bar-fixed.zip`) is the richer Lush View Bar build.

### What `main` (`lushview-bar-fixed.zip`) has that PR #2 lacks:
1. **`api/users.php`** — Full Team & Users CRUD API (list, get, create, role promotion, duplicate-email `409` guard, self-delete guard).
2. **`api/reports.php`** — Dedicated reporting endpoint (`pl` Profit & Loss with COGS + expenses + net margin, `customers` report, `suppliers` report).
3. **Sub-endpoints in `api/purchases.php` and `api/stock.php`** — Purchase detail with line items (`GET /api/purchases.php?id=...`) and per-product stock movement history (`GET /api/stock.php?product_id=...`).
4. **Database migration fallback in `api/db.php`** — Automatically falls back to legacy `invenza-data` if present so existing installations do not lose data.
5. **Rose/Crimson Lush View Bar theme (`#E11D48` / `#BE123C`)** with flat, direct 23-link sidebar navigation (`.sidebar-nav`, `.nav-link`, `.nav-label`, `.nav-section-title`).

### What PR #2 had that has now been ported into `main` (`lushview-bar-fixed.zip`):
1. **Bar-specific installer seeds in `api/install.php`**:
   - **Categories (8):** `Spirits`, `Beer & Cider`, `Wine`, `Soft Drinks & Mixers`, `Cocktails`, `Ready-to-Drink`, `Bar Snacks`, `Glassware & Supplies`
   - **Units (9):** `Bottle`, `Can`, `Crate`, `Keg`, `Glass`, `Shot`, `Milliliter`, `Liter`, `Pack`
2. **Brand icon & favicon (`assets/img/favicon.svg` + cocktail-glass SVG logo)**:
   - `assets/img/favicon.svg` added and linked in `<head>` across all 39 HTML pages.
   - Cocktail-glass SVG mark replaces the generic 3D cube in the sidebar (`assets/js/app.js`), Sign In (`pages/login.html`), and Create Account (`pages/register.html`).

Because `main` now incorporates every feature from both builds while keeping all 12 PHP endpoints and 45/45 acceptance checks passing, PR #2 (and duplicate PR #4) were closed with a pointer to the updated `v1.0-fixed` release.
