<?php
require __DIR__ . '/db.php';
start_session();
$action = $_GET['action'] ?? 'me';

if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $b = body();
    $st = db()->prepare('SELECT * FROM users WHERE email=? AND active=1');
    $st->execute([strtolower(trim($b['email'] ?? ''))]);
    $u = $st->fetch();
    if (!$u || !password_verify($b['password'] ?? '', $u['password_hash'])) { sleep(1); fail('Invalid email or password', 401); }
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
    json_out(['id' => $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'role' => $u['role']]);
}

if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $b = body();
    $first = trim($b['first_name'] ?? '');
    $last = trim($b['last_name'] ?? '');
    $name = trim("$first $last") ?: trim($b['name'] ?? '');
    $email = strtolower(trim($b['email'] ?? ''));
    $pass = $b['password'] ?? '';
    if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 8) {
        fail('Name, valid email, and password of at least 8 characters are required');
    }
    $pdo = db();
    try {
        $userCount = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        $role = $userCount === 0 ? 'admin' : 'staff';
        $pdo->prepare("INSERT INTO users(name,email,password_hash,role,active) VALUES(?,?,?,?,'1')")
            ->execute([$name, $email, password_hash($pass, PASSWORD_DEFAULT), $role]);
        json_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    } catch (PDOException $e) {
        fail(str_contains($e->getMessage(), 'UNIQUE') ? 'An account with that email already exists' : 'Database error', 409);
    }
}

if ($action === 'logout') {
    $_SESSION = []; session_destroy();
    json_out(['ok' => true]);
}

if ($action === 'profile' && ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT')) {
    $user = require_login();
    $b = body();
    $name = trim($b['name'] ?? '');
    $email = strtolower(trim($b['email'] ?? ''));
    if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Valid name and email are required');
    }
    $pdo = db();
    try {
        if (!empty($b['new_password'])) {
            if (empty($b['current_password'])) fail('Current password is required to change your password');
            $st = $pdo->prepare('SELECT password_hash FROM users WHERE id=?');
            $st->execute([$user['id']]);
            $hash = $st->fetchColumn();
            if (!password_verify($b['current_password'], $hash)) fail('Current password is incorrect');
            if (strlen($b['new_password']) < 8) fail('New password must be at least 8 characters');
            $pdo->prepare('UPDATE users SET name=?, email=?, password_hash=? WHERE id=?')
                ->execute([$name, $email, password_hash($b['new_password'], PASSWORD_DEFAULT), $user['id']]);
        } else {
            $pdo->prepare('UPDATE users SET name=?, email=? WHERE id=?')
                ->execute([$name, $email, $user['id']]);
        }
        json_out(['ok' => true, 'name' => $name, 'email' => $email, 'role' => $user['role']]);
    } catch (PDOException $e) {
        fail(str_contains($e->getMessage(), 'UNIQUE') ? 'Email is already in use by another account' : 'Database error', 409);
    }
}

json_out(require_login());
