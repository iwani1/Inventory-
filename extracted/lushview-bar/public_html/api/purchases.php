<?php
require __DIR__ . '/db.php';
$user = require_login(); $pdo = db();
$sel = 'SELECT p.*, s.name AS supplier, s.email AS supplier_email, s.phone AS supplier_phone FROM purchases p LEFT JOIN suppliers s ON s.id=p.supplier_id';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_GET['id'])) {
        $st = $pdo->prepare($sel . ' WHERE p.id=?');
        $st->execute([(int)$_GET['id']]);
        $row = $st->fetch(); if (!$row) fail('Not found', 404);
        $it = $pdo->prepare('SELECT * FROM purchase_items WHERE purchase_id=?');
        $it->execute([$row['id']]);
        $row['items'] = $it->fetchAll();
        json_out($row);
    }
    $from = $_GET['from'] ?? '0000-01-01'; $to = $_GET['to'] ?? '9999-12-31';
    $st = $pdo->prepare($sel . ' WHERE date(COALESCE(p.purchase_date, p.created_at)) BETWEEN ? AND ? ORDER BY p.id DESC LIMIT 1000');
    $st->execute([$from, $to]);
    json_out($st->fetchAll());
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);
$b = body(); $items = is_array($b['items'] ?? null) ? $b['items'] : [];
if (!$items) fail('Add at least one product line');
try {
    $id = tx(function ($p) use ($b, $items, $user) {
        $p->prepare('INSERT INTO purchases(ref,supplier_id,purchase_date,user_id) VALUES(?,?,?,?)')
          ->execute([trim($b['ref'] ?? '') ?: null, ((int)($b['supplier_id'] ?? 0)) ?: null, $b['purchase_date'] ?? date('Y-m-d'), $user['id']]);
        $pid = (int)$p->lastInsertId(); $total = 0;
        foreach ($items as $it) {
            $qty = num($it['qty'] ?? 0); $cost = num($it['cost'] ?? 0);
            if ($qty <= 0) throw new RuntimeException('Quantities must be above zero');
            $r = $p->prepare('SELECT id,name FROM products WHERE id=?'); $r->execute([(int)($it['product_id'] ?? 0)]);
            $prod = $r->fetch(); if (!$prod) throw new RuntimeException('A product on the list no longer exists');
            $p->prepare('INSERT INTO purchase_items(purchase_id,product_id,name,qty,cost) VALUES(?,?,?,?,?)')->execute([$pid, $prod['id'], $prod['name'], $qty, $cost]);
            $p->prepare('UPDATE products SET stock = stock + ?, purchase_price = ? WHERE id=?')->execute([$qty, $cost, $prod['id']]);
            $p->prepare("INSERT INTO stock_movements(product_id,type,qty,note,user_id) VALUES(?,'purchase',?,?,?)")->execute([$prod['id'], $qty, 'Purchase #' . $pid, $user['id']]);
            $total += $qty * $cost;
        }
        $p->prepare('UPDATE purchases SET total=?, paid=? WHERE id=?')->execute([$total, min($total, num($b['paid'] ?? $total)), $pid]);
        return $pid;
    });
} catch (RuntimeException $e) { fail($e->getMessage()); }
json_out(['id' => $id], 201);
