# Inventory-

Build artifacts for the **Lush View Bar** inventory management system (a rebrand of the Invenza app).

## Artifacts

| File | What it is | Status |
| --- | --- | --- |
| `lush-view-bar-app-php.zip` | Deployable PHP 8.1+ / SQLite app, branded for Lush View Bar. | **Current build** |
| `invenza-app php test1.zip` | Previous PHP build (Invenza branding). | Superseded |
| `invenza-app.zip` | Earlier static HTML/CSS/JS build. | Superseded |
| `invenzatailwindcss-10.zip` | Tailwind v3 source kit + component documentation. | Reference |

## Deploying `lush-view-bar-app-php.zip`

1. Upload the *contents* of `public_html/` into your host's `public_html/` root (cPanel/GreenGeeks steps are in the `README.txt` bundled inside the zip).
2. Use PHP 8.1 or newer with `pdo_sqlite`, `sqlite3`, `session`, `json` enabled.
3. Visit `https://yourdomain.com/api/install.php`, create the admin user, then **delete `install.php`**.
4. Log in at `https://yourdomain.com/pages/login.html`.
5. Edit business name, currency and receipt text in `assets/js/pages.js` (`CUR`, `BIZ`) or under Settings → General / Sales.

The SQLite database is created outside the web root at `~/lushviewbar-data/lushviewbar.sqlite`.

## What changed in this build

- Brand renamed from *Invenza* to *Lush View Bar* across every page, title, footer, email default and the installer.
- New cocktail-glass logo mark (sidebar, sign-in, register, invoices) plus an SVG favicon on all pages.
- Business defaults set for the venue: company name, receipt header/footer, support email, address, phone.
- Installer now seeds bar inventory categories (Spirits, Beer & Cider, Wine, Mixers, Cocktails, Bar Snacks, Glassware & Supplies) and units (Bottle, Can, Crate, Keg, Glass, Shot, Milliliter, Liter, Pack).
- Session name, data directory and database file renamed (`lushviewbar`), package name is `lush-view-bar`.
- Store-room wording replaces warehouse wording in user- and settings-facing copy.

## Rebuilding the CSS

```bash
cd public_html
npm install
npm run build     # one-off build; npm run watch for development
```

Requires Node 18+. Tailwind configuration lives in `tailwind.config.js`.
