<?php
require __DIR__ . '/db.php';
$user = require_login(); $pdo = db();
$sel = 'SELECT s.*, c.name AS customer FROM sales s LEFT JOIN customers c ON c.id=s.customer_id';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_GET['id'])) {
        $st = $pdo->prepare($sel . ' WHERE s.id=?'); $st->execute([(int)$_GET['id']]);
        $s = $st->fetch(); if (!$s) fail('Not found', 404);
        $it = $pdo->prepare('SELECT name,qty,price FROM sale_items WHERE sale_id=?'); $it->execute([$s['id']]);
        $s['items'] = $it->fetchAll(); json_out($s);
    }
    $from = $_GET['from'] ?? '0000-01-01'; $to = $_GET['to'] ?? '9999-12-31';
    $st = $pdo->prepare($sel . ' WHERE date(s.created_at) BETWEEN ? AND ? ORDER BY s.id DESC LIMIT 1000'); $st->execute([$from, $to]);
    json_out($st->fetchAll());
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);
$b = body(); $items = is_array($b['items'] ?? null) ? $b['items'] : [];
if (!$items) fail('Add at least one product to the sale');
try {
    $id = tx(function ($p) use ($b, $items, $user) {
        $p->prepare('INSERT INTO sales(customer_id,payment_method,user_id) VALUES(?,?,?)')
          ->execute([((int)($b['customer_id'] ?? 0)) ?: null, $b['payment_method'] ?? 'Cash', $user['id']]);
        $sid = (int)$p->lastInsertId(); $sub = 0;
        foreach ($items as $it) {
            $qty = num($it['qty'] ?? 0); if ($qty <= 0) throw new RuntimeException('Quantities must be above zero');
            $r = $p->prepare("SELECT * FROM products WHERE id=? AND status='Active'"); $r->execute([(int)($it['product_id'] ?? 0)]);
            $prod = $r->fetch(); if (!$prod) throw new RuntimeException('A product on the list is unavailable');
            $price = isset($it['price']) && $it['price'] !== '' ? num($it['price']) : (float)$prod['selling_price'];
            $u = $p->prepare('UPDATE products SET stock = stock - ? WHERE id=? AND stock >= ?'); $u->execute([$qty, $prod['id'], $qty]);
            if (!$u->rowCount()) throw new RuntimeException('Not enough stock for ' . $prod['name'] . ' (' . (float)$prod['stock'] . ' left)');
            $p->prepare('INSERT INTO sale_items(sale_id,product_id,name,qty,price,cost) VALUES(?,?,?,?,?,?)')->execute([$sid, $prod['id'], $prod['name'], $qty, $price, $prod['purchase_price']]);
            $p->prepare("INSERT INTO stock_movements(product_id,type,qty,note,user_id) VALUES(?,'sale',?,?,?)")->execute([$prod['id'], -$qty, 'Sale #' . $sid, $user['id']]);
            $sub += $qty * $price;
        }
        $disc = min($sub, num($b['discount'] ?? 0)); $tp = num($b['tax_percent'] ?? 0);
        $tax = round(($sub - $disc) * $tp / 100, 2); $total = round($sub - $disc + $tax, 2);
        $p->prepare('UPDATE sales SET invoice_no=?, subtotal=?, discount=?, tax_percent=?, tax=?, total=?, paid=? WHERE id=?')
          ->execute(['INV-' . str_pad((string)$sid, 5, '0', STR_PAD_LEFT), $sub, $disc, $tp, $tax, $total, min($total, num($b['paid'] ?? $total)), $sid]);
        return $sid;
    });
} catch (RuntimeException $e) { fail($e->getMessage()); }
json_out(['id' => $id], 201);
