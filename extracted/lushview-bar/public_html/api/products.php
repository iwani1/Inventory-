<?php
require __DIR__ . '/db.php';
$user = require_login();
$pdo = db();
$m = $_SERVER['REQUEST_METHOD'];
$id = (int)($_GET['id'] ?? 0);
const SEL = 'SELECT p.*, c.name AS category, b.name AS brand, u.name AS unit FROM products p
  LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id LEFT JOIN units u ON u.id=p.unit_id';

function shape(array $r): array {
    return ['id' => (int)$r['id'], 'name' => $r['name'], 'sku' => $r['sku'], 'barcode' => $r['barcode'],
        'category' => $r['category'] ?? '-', 'brand' => $r['brand'] ?? '-', 'unit' => $r['unit'] ?? '-',
        'category_id' => $r['category_id'], 'brand_id' => $r['brand_id'], 'unit_id' => $r['unit_id'],
        'stock' => (float)$r['stock'], 'minStock' => (float)$r['min_stock'], 'maxStock' => (float)$r['max_stock'],
        'purchasePrice' => (float)$r['purchase_price'], 'sellingPrice' => (float)$r['selling_price'],
        'tax' => (float)$r['tax'], 'discount' => (float)$r['discount'], 'description' => $r['description'],
        'status' => $r['status'], 'created' => substr((string)($r['created_at'] ?? ''), 0, 10), 'image' => $r['image']];
}
function fields(array $b): array {
    $name = trim($b['name'] ?? ''); $sku = trim($b['sku'] ?? '');
    if ($name === '' || $sku === '') fail('Product name and SKU are required');
    $num = fn($k) => max(0, (float)($b[$k] ?? 0));
    $fk = fn($k) => ((int)($b[$k] ?? 0)) ?: null;
    $status = in_array($b['status'] ?? 'Active', ['Active', 'Inactive', 'Draft'], true) ? $b['status'] : 'Active';
    $img = trim($b['image'] ?? '') ?: null;
    return [$sku, $name, trim($b['barcode'] ?? '') ?: null, $fk('category_id'), $fk('brand_id'), $fk('unit_id'),
        $num('purchase_price'), $num('selling_price'), $num('tax'), $num('discount'),
        $num('min_stock'), $num('max_stock'), trim($b['description'] ?? '') ?: null, $status, $img];
}

try {
    if ($m === 'GET') {
        if ($id) {
            $st = $pdo->prepare(SEL . ' WHERE p.id=?'); $st->execute([$id]);
            $r = $st->fetch(); if (!$r) fail('Not found', 404);
            json_out(shape($r));
        }
        json_out(array_map('shape', $pdo->query(SEL . ' ORDER BY p.id DESC')->fetchAll()));
    }
    $b = body();
    if ($m === 'POST') {
        $f = fields($b);
        $open = max(0, (float)($b['opening_stock'] ?? 0));
        $pdo->beginTransaction();
        $pdo->prepare('INSERT INTO products(sku,name,barcode,category_id,brand_id,unit_id,purchase_price,selling_price,tax,discount,min_stock,max_stock,description,status,image,stock)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([...$f, $open]);
        $pid = (int)$pdo->lastInsertId();
        if ($open > 0) $pdo->prepare("INSERT INTO stock_movements(product_id,type,qty,note,user_id) VALUES(?,'opening',?,'Opening stock',?)")->execute([$pid, $open, $user['id']]);
        $pdo->commit();
        json_out(['id' => $pid], 201);
    }
    if ($m === 'PUT' && $id) {
        $pdo->prepare('UPDATE products SET sku=?,name=?,barcode=?,category_id=?,brand_id=?,unit_id=?,purchase_price=?,selling_price=?,tax=?,discount=?,min_stock=?,max_stock=?,description=?,status=?,image=? WHERE id=?')
            ->execute([...fields($b), $id]);
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE' && $id) {
        require_role($user, ['admin', 'manager']);
        $pdo->prepare('DELETE FROM products WHERE id=?')->execute([$id]);
        json_out(['ok' => true]);
    }
    fail('Method not allowed', 405);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    fail(str_contains($e->getMessage(), 'UNIQUE') ? 'That SKU already exists' : 'Database error', str_contains($e->getMessage(), 'UNIQUE') ? 409 : 500);
}
