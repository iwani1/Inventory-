<?php
require __DIR__ . '/db.php';
$user = require_login();
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];
$id = (int)($_GET['id'] ?? 0);

if ($method === 'GET') {
    require_role($user, ['admin', 'manager']);
    if ($id) {
        $st = $pdo->prepare('SELECT id,name,email,role,active,created_at FROM users WHERE id=?');
        $st->execute([$id]);
        $u = $st->fetch();
        if (!$u) fail('User not found', 404);
        json_out($u);
    }
    json_out($pdo->query('SELECT id,name,email,role,active,created_at FROM users ORDER BY id DESC')->fetchAll());
}

if ($method === 'POST') {
    require_role($user, ['admin']);
    $b = body();
    $name = trim($b['name'] ?? '');
    $email = strtolower(trim($b['email'] ?? ''));
    $pass = $b['password'] ?? '';
    $role = in_array($b['role'] ?? 'staff', ['admin', 'manager', 'staff'], true) ? $b['role'] : 'staff';
    if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 8) {
        fail('Name, valid email, and password (min 8 chars) are required');
    }
    try {
        $pdo->prepare("INSERT INTO users(name,email,password_hash,role,active) VALUES(?,?,?,?,'1')")
            ->execute([$name, $email, password_hash($pass, PASSWORD_DEFAULT), $role]);
        json_out(['id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        fail(str_contains($e->getMessage(), 'UNIQUE') ? 'Email already registered' : 'Database error', 409);
    }
}

if ($method === 'PUT') {
    require_role($user, ['admin']);
    if (!$id) fail('User ID required', 400);
    $b = body();
    $name = trim($b['name'] ?? '');
    $email = strtolower(trim($b['email'] ?? ''));
    $role = in_array($b['role'] ?? 'staff', ['admin', 'manager', 'staff'], true) ? $b['role'] : 'staff';
    $active = isset($b['active']) ? (int)(bool)$b['active'] : 1;
    if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Valid name and email are required');
    }
    try {
        if (!empty($b['password']) && strlen($b['password']) >= 8) {
            $pdo->prepare('UPDATE users SET name=?, email=?, role=?, active=?, password_hash=? WHERE id=?')
                ->execute([$name, $email, $role, $active, password_hash($b['password'], PASSWORD_DEFAULT), $id]);
        } else {
            $pdo->prepare('UPDATE users SET name=?, email=?, role=?, active=? WHERE id=?')
                ->execute([$name, $email, $role, $active, $id]);
        }
        json_out(['ok' => true]);
    } catch (PDOException $e) {
        fail(str_contains($e->getMessage(), 'UNIQUE') ? 'Email already in use' : 'Database error', 409);
    }
}

if ($method === 'DELETE') {
    require_role($user, ['admin']);
    if (!$id) fail('User ID required', 400);
    if ($id === (int)$user['id']) fail('Cannot delete your own account', 400);
    $pdo->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
    json_out(['ok' => true]);
}

fail('Method not allowed', 405);
