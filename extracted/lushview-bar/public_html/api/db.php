<?php
declare(strict_types=1);

// Disable error display to prevent malformed JSON responses on shared hosting
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Database lives OUTSIDE public_html: /home/<user>/lushview-data/lushview.sqlite
const DATA_DIR = __DIR__ . '/../../lushview-data';
const LEGACY_DIR = __DIR__ . '/../../invenza-data';

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dir = is_file(LEGACY_DIR . '/invenza.sqlite') ? LEGACY_DIR : DATA_DIR;
    $dbFile = is_file(LEGACY_DIR . '/invenza.sqlite') ? LEGACY_DIR . '/invenza.sqlite' : DATA_DIR . '/lushview.sqlite';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    if (is_dir($dir) && !file_exists($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "Require all denied
Deny from all
");
    }
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
    ensure_schema($pdo);
    return $pdo;
}
function json_out($data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
function fail(string $msg, int $code = 400): never { json_out(['error' => $msg], $code); }
function body(): array {
    $r = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($r) ? $r : [];
}
function start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('lushview');
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
        session_start();
    }
}
function require_login(): array {
    start_session();
    if (empty($_SESSION['uid'])) fail('Not authenticated', 401);
    // Simple CSRF defence: state-changing calls must come from our JS
    if ($_SERVER['REQUEST_METHOD'] !== 'GET' && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'fetch') fail('Bad request', 403);
    $st = db()->prepare('SELECT id,name,email,role FROM users WHERE id=? AND active=1');
    $st->execute([$_SESSION['uid']]);
    $u = $st->fetch();
    if (!$u) { session_destroy(); fail('Not authenticated', 401); }
    return $u;
}
function require_role(array $u, array $roles): void {
    if (!in_array($u['role'], $roles, true)) fail('You do not have permission to do that', 403);
}

function ensure_schema(PDO $p): void {
    $p->exec("
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories(
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS brands(
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS units(
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS products(
      id INTEGER PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      barcode TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
      unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
      purchase_price REAL NOT NULL DEFAULT 0,
      selling_price REAL NOT NULL DEFAULT 0,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      stock REAL NOT NULL DEFAULT 0,
      min_stock REAL DEFAULT 0,
      max_stock REAL DEFAULT 0,
      description TEXT,
      image TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS stock_movements(
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      qty REAL NOT NULL,
      note TEXT,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_mov_product ON stock_movements(product_id);
    CREATE TABLE IF NOT EXISTS customers(
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      city TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS suppliers(
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      city TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS expenses(
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      amount REAL NOT NULL DEFAULT 0,
      expense_date TEXT,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS purchases(
      id INTEGER PRIMARY KEY,
      ref TEXT,
      supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      purchase_date TEXT,
      total REAL NOT NULL DEFAULT 0,
      paid REAL NOT NULL DEFAULT 0,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS purchase_items(
      id INTEGER PRIMARY KEY,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      product_id INTEGER,
      name TEXT,
      qty REAL NOT NULL,
      cost REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sales(
      id INTEGER PRIMARY KEY,
      invoice_no TEXT,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      subtotal REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      tax_percent REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      payment_method TEXT,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sale_items(
      id INTEGER PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id INTEGER,
      name TEXT,
      qty REAL NOT NULL,
      price REAL NOT NULL,
      cost REAL NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
    ");
}
/** Run $f inside a write transaction; throw RuntimeException('msg') to abort with a user-facing error. */
function tx(callable $f) {
    $p = db(); $p->exec('BEGIN IMMEDIATE');
    try { $r = $f($p); $p->exec('COMMIT'); return $r; }
    catch (Throwable $e) { $p->exec('ROLLBACK'); throw $e; }
}
function num($v): float { return max(0, (float)$v); }
