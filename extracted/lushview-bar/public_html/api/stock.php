<?php
require __DIR__ . '/db.php';
$user = require_login(); $pdo = db();
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_GET['product_id'])) {
        $st = $pdo->prepare('SELECT m.*, p.name, p.sku FROM stock_movements m JOIN products p ON p.id=m.product_id WHERE m.product_id=? ORDER BY m.id DESC LIMIT 200');
        $st->execute([(int)$_GET['product_id']]);
        json_out($st->fetchAll());
    }
    json_out($pdo->query('SELECT m.*, p.name, p.sku FROM stock_movements m JOIN products p ON p.id=m.product_id ORDER BY m.id DESC LIMIT 150')->fetchAll());
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);
$b = body(); $pid = (int)($b['product_id'] ?? 0); $qty = num($b['qty'] ?? 0);
$sign = ($b['type'] ?? '') === 'remove' ? -1 : 1;
if (!$pid || $qty <= 0) fail('Choose a product and enter a quantity above zero');
try {
    tx(function ($p) use ($pid, $qty, $sign, $b, $user) {
        $st = $p->prepare('UPDATE products SET stock = stock + ? WHERE id = ? AND stock + ? >= 0');
        $st->execute([$sign * $qty, $pid, $sign * $qty]);
        if (!$st->rowCount()) throw new RuntimeException('Not enough stock to remove that quantity');
        $p->prepare("INSERT INTO stock_movements(product_id,type,qty,note,user_id) VALUES(?,'adjustment',?,?,?)")
          ->execute([$pid, $sign * $qty, trim($b['note'] ?? '') ?: null, $user['id']]);
    });
} catch (RuntimeException $e) { fail($e->getMessage()); }
json_out(['ok' => true]);
