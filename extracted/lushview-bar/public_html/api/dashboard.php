<?php
require __DIR__ . '/db.php';
require_login(); $pdo = db();
$one = function (string $sql, array $a = []) use ($pdo) { $s = $pdo->prepare($sql); $s->execute($a); return (float)($s->fetchColumn() ?: 0); };
$rows = function (string $sql, array $a = []) use ($pdo) { $s = $pdo->prepare($sql); $s->execute($a); return $s->fetchAll(); };
$ym = date('Y-m');
$rev = $one("SELECT SUM(subtotal-discount) FROM sales WHERE strftime('%Y-%m',created_at)=?", [$ym]);
$cogs = $one("SELECT SUM(i.qty*i.cost) FROM sale_items i JOIN sales s ON s.id=i.sale_id WHERE strftime('%Y-%m',s.created_at)=?", [$ym]);
$exp = $one("SELECT SUM(amount) FROM expenses WHERE strftime('%Y-%m',expense_date)=?", [$ym]);
$byDay = array_column($rows("SELECT date(created_at) d, SUM(total) t FROM sales WHERE date(created_at) >= date('now','-6 days') GROUP BY d"), 't', 'd');
$last7 = []; for ($i = 6; $i >= 0; $i--) { $d = date('Y-m-d', strtotime("-$i days")); $last7[] = ['day' => $d, 'total' => (float)($byDay[$d] ?? 0)]; }
json_out([
  'products' => (int)$one("SELECT COUNT(*) FROM products WHERE status='Active'"),
  'stock_value' => $one('SELECT SUM(stock*purchase_price) FROM products'),
  'low' => (int)$one('SELECT COUNT(*) FROM products WHERE stock>0 AND stock<=min_stock'),
  'out' => (int)$one('SELECT COUNT(*) FROM products WHERE stock<=0'),
  'today_sales' => $one("SELECT SUM(total) FROM sales WHERE date(created_at)=date('now')"),
  'month_sales' => $one("SELECT SUM(total) FROM sales WHERE strftime('%Y-%m',created_at)=?", [$ym]),
  'month_purchases' => $one("SELECT SUM(total) FROM purchases WHERE strftime('%Y-%m',created_at)=?", [$ym]),
  'profit' => $rev - $cogs - $exp, 'last7' => $last7,
  'low_items' => $rows('SELECT name,sku,stock,min_stock FROM products WHERE stock<=min_stock ORDER BY stock LIMIT 8'),
  'recent' => $rows('SELECT s.invoice_no,s.total,s.created_at,c.name AS customer FROM sales s LEFT JOIN customers c ON c.id=s.customer_id ORDER BY s.id DESC LIMIT 6'),
  'top' => $rows("SELECT i.name, SUM(i.qty) qty, SUM(i.qty*i.price) revenue FROM sale_items i JOIN sales s ON s.id=i.sale_id WHERE s.created_at >= datetime('now','-30 days') GROUP BY i.product_id ORDER BY qty DESC LIMIT 5"),
]);
