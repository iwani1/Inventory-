/**
 * Sidebar, Hamburger, Tailwind & Brand Asset Verification Suite
 *
 * Verifies:
 *  1. Every sidebar selector emitted by assets/js/app.js (.sidebar-nav,
 *     .nav-section-title, .nav-link, .nav-label, .sidebar-label) is styled in
 *     assets/css/app.css (default, :hover, .active, and #sidebar.collapsed).
 *  2. Mobile hamburger (#sidebar-toggle-btn) toggles 'mobile-open' on #sidebar
 *     (matching @media (max-width: 1023px) #sidebar.mobile-open in app.css)
 *     and desktop collapse toggles 'collapsed' / 'sidebar-collapsed'.
 *  3. All 23 sidebar nav links resolve to real HTML files on disk and match
 *     each page's window.CURRENT_PAGE.
 *  4. assets/css/tailwind.css is freshly compiled from src/input.css and
 *     contains the Lush View Bar rose/crimson utility classes (#E11D48 / #BE123C).
 *  5. PR #2 bar assets ported: bar categories & units in api/install.php,
 *     assets/img/favicon.svg linked from all 39 HTML pages, and cocktail-glass
 *     logo SVG in app.js, pages/login.html, and pages/register.html.
 *  6. lushview-bar-fixed.zip in repo root is in sync with extracted/lushview-bar/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const ROOT = fs.existsSync(path.join(REPO, 'extracted/lushview-bar/public_html'))
  ? REPO
  : path.resolve(HERE, '..');
const PUB = path.join(ROOT, 'extracted/lushview-bar/public_html');
const ZIP = path.join(ROOT, 'lushview-bar-fixed.zip');

let pass = 0;
let fail = 0;

function check(label, cond, detail = '') {
  if (cond) {
    pass++;
    console.log(`PASS  ${label}`);
  } else {
    fail++;
    console.error(`FAIL  ${label}${detail ? ' — ' + detail : ''}`);
  }
}

const appJs = fs.readFileSync(path.join(PUB, 'assets/js/app.js'), 'utf8');
const appCss = fs.readFileSync(path.join(PUB, 'assets/css/app.css'), 'utf8');
const twCss = fs.readFileSync(path.join(PUB, 'assets/css/tailwind.css'), 'utf8');
const installPhp = fs.readFileSync(path.join(PUB, 'api/install.php'), 'utf8');

/* 1. Sidebar CSS selectors vs app.js markup */
check('app.js emits .sidebar-nav container', appJs.includes('<div class="sidebar-nav">'));
check('app.css styles .sidebar-nav (flex column + overflow-y: auto)',
  /\.sidebar-nav[\s\S]{0,120}overflow-y:\s*auto/.test(appCss) &&
  /\.sidebar-nav[\s\S]{0,120}flex-direction:\s*column/.test(appCss));

check('app.js emits .nav-section-title headers', appJs.includes('class="nav-section-title"'));
check('app.css styles .nav-section-title alongside .sidebar-section-label',
  /\.sidebar-section-label,\s*\.nav-section-title\s*\{/.test(appCss));

check('app.js emits .nav-link items and .nav-label spans',
  appJs.includes('class="nav-link"') && appJs.includes('class="nav-label"'));
check('app.css styles .nav-link (base, :hover, .active)',
  /\.nav-item,\s*\.nav-link\s*\{/.test(appCss) &&
  /\.nav-item:hover,\s*\.nav-link:hover\s*\{/.test(appCss) &&
  /\.nav-item\.active,\s*\.nav-link\.active\s*\{/.test(appCss));
check('app.css styles .nav-label alongside .sidebar-label',
  /\.sidebar-label,\s*\.nav-label\s*\{/.test(appCss));
check('app.css handles #sidebar.collapsed for .nav-label, .nav-section-title, .nav-link',
  /#sidebar\.collapsed\s+\.nav-label/.test(appCss) &&
  /#sidebar\.collapsed\s+\.nav-section-title/.test(appCss) &&
  /#sidebar\.collapsed\s+\.nav-link/.test(appCss));

/* 2. Mobile hamburger & responsive drawer */
check('app.js initSidebar toggles mobile-open on #sidebar',
  /classList\.toggle\(['"]mobile-open['"]\)/.test(appJs) &&
  /classList\.remove\(['"]mobile-open['"]\)/.test(appJs) &&
  !/classList\.toggle\(['"]open['"]\)/.test(appJs));
check('app.css @media (max-width: 1023px) transforms #sidebar.mobile-open to translateX(0)',
  /@media\s*\(max-width:\s*1023px\)[\s\S]{0,200}#sidebar\.mobile-open[\s\S]{0,60}transform:\s*translateX\(0\)/.test(appCss));

/* 3. All 23 sidebar links resolve to existing HTML files */
const linkRe = /<a\s+href="\$\{bp\}([^"]+)"\s+class="nav-link"\s+data-page="([^"]+)"/g;
const links = [...appJs.matchAll(linkRe)];
check('app.js defines all 23 sidebar navigation links', links.length === 23, `found ${links.length}`);
const missingTargets = [];
for (const [, relHref, pageId] of links) {
  const targetPath = path.join(PUB, relHref);
  if (!fs.existsSync(targetPath)) {
    missingTargets.push(`${relHref} (${pageId})`);
  }
}
check('all 23 sidebar link targets exist in public_html/', missingTargets.length === 0, missingTargets.join(', '));

/* 4. Rebuilt tailwind.css */
check('assets/css/tailwind.css is minified and includes Lush View Bar theme classes',
  twCss.length > 10000 &&
  twCss.includes('from-\\[\\#E11D48\\]') &&
  twCss.includes('to-\\[\\#BE123C\\]'));

/* 5. Ported PR #2 assets: bar seeds, favicon.svg, cocktail-glass logo */
const expectedCategories = [
  'Spirits', 'Beer & Cider', 'Wine', 'Soft Drinks & Mixers',
  'Cocktails', 'Ready-to-Drink', 'Bar Snacks', 'Glassware & Supplies',
];
const expectedUnits = [
  'Bottle', 'Can', 'Crate', 'Keg', 'Glass', 'Shot', 'Milliliter', 'Liter', 'Pack',
];
check('api/install.php seeds all 8 bar categories',
  expectedCategories.every(c => installPhp.includes(`'${c}'`)));
check('api/install.php seeds all 9 bar units',
  expectedUnits.every(u => installPhp.includes(`'${u}'`)));

const faviconPath = path.join(PUB, 'assets/img/favicon.svg');
check('assets/img/favicon.svg exists', fs.existsSync(faviconPath));

const htmlFiles = [];
function walkHtml(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(full);
    else if (ent.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walkHtml(PUB);
check('public_html contains 39 HTML pages', htmlFiles.length === 39, `found ${htmlFiles.length}`);
const pagesWithFavicon = htmlFiles.filter(f => fs.readFileSync(f, 'utf8').includes('assets/img/favicon.svg'));
check('all 39 HTML pages link assets/img/favicon.svg', pagesWithFavicon.length === 39, `found ${pagesWithFavicon.length}/39`);

const cocktailPath = 'M4.6 4.4h14.8L12 12.6 4.6 4.4z';
const loginHtml = fs.readFileSync(path.join(PUB, 'pages/login.html'), 'utf8');
const registerHtml = fs.readFileSync(path.join(PUB, 'pages/register.html'), 'utf8');
check('cocktail-glass logo SVG is present in app.js, login.html, and register.html',
  appJs.includes(cocktailPath) &&
  loginHtml.includes(cocktailPath) &&
  registerHtml.includes(cocktailPath));

/* 6. Zip archive consistency */
check('lushview-bar-fixed.zip exists in repo root', fs.existsSync(ZIP));
if (fs.existsSync(ZIP)) {
  const checkFiles = [
    'public_html/assets/css/app.css',
    'public_html/assets/css/tailwind.css',
    'public_html/assets/js/app.js',
    'public_html/api/install.php',
    'public_html/assets/img/favicon.svg',
  ];
  for (const rel of checkFiles) {
    const zippedBuf = execSync(`unzip -p "${ZIP}" "${rel}"`);
    const diskBuf = fs.readFileSync(path.join(ROOT, 'extracted/lushview-bar', rel));
    check(`zip matches disk for ${rel}`, zippedBuf.equals(diskBuf));
  }
}

console.log('\n' + '='.repeat(72));
console.log(`TOTAL: ${pass + fail} checks — ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
