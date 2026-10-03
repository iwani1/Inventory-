<?php
require __DIR__ . '/db.php';
$user = require_login(); $pdo = db();
$E = ['categories' => ['name'], 'brands' => ['name'], 'units' => ['name'],
  'customers' => ['name','company','email','phone','city','address'],
  'suppliers' => ['name','company','email','phone','city','address'],
  'expenses'  => ['title','category','amount','expense_date','note']];
$e = $_GET['e'] ?? ''; if (!isset($E[$e])) fail('Unknown resource', 404);
$cols = $E[$e]; $id = (int)($_GET['id'] ?? 0); $m = $_SERVER['REQUEST_METHOD'];
$clean = function (array $b) use ($cols) {
    $v = [];
    foreach ($cols as $c) { $x = trim((string)($b[$c] ?? '')); $v[$c] = $c === 'amount' ? num($x) : ($x === '' ? null : $x); }
    if (empty($v[$cols[0]])) fail('The first field is required');
    return $v;
};
try {
    if ($m === 'GET') json_out($pdo->query("SELECT * FROM $e ORDER BY id DESC")->fetchAll());
    if ($m === 'POST') {
        $v = $clean(body());
        $pdo->prepare("INSERT INTO $e(" . implode(',', $cols) . ') VALUES(' . implode(',', array_fill(0, count($cols), '?')) . ')')->execute(array_values($v));
        json_out(['id' => (int)$pdo->lastInsertId()], 201);
    }
    if ($m === 'PUT' && $id) {
        $v = $clean(body());
        $pdo->prepare("UPDATE $e SET " . implode(',', array_map(fn($c) => "$c=?", $cols)) . ' WHERE id=?')->execute([...array_values($v), $id]);
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE' && $id) {
        require_role($user, ['admin', 'manager']);
        $pdo->prepare("DELETE FROM $e WHERE id=?")->execute([$id]);
        json_out(['ok' => true]);
    }
    fail('Method not allowed', 405);
} catch (PDOException $x) { fail(str_contains($x->getMessage(), 'UNIQUE') ? 'That name already exists' : 'Database error', 409); }
