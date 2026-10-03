<?php
// Run ONCE in the browser, create the admin, then DELETE this file.
require __DIR__ . '/db.php';
$pdo = db();
$has = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
$msg = '';
if ($has) {
    $msg = 'Already installed. Delete install.php from the server.';
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $n = trim($_POST['name'] ?? ''); $e = strtolower(trim($_POST['email'] ?? '')); $p = $_POST['password'] ?? '';
    if (!$n || !filter_var($e, FILTER_VALIDATE_EMAIL) || strlen($p) < 8) {
        $msg = 'Enter a name, a valid email and a password of at least 8 characters.';
    } else {
        $pdo->prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?, 'admin')")
            ->execute([$n, $e, password_hash($p, PASSWORD_DEFAULT)]);
        foreach (['Spirits','Beer & Cider','Wine','Soft Drinks & Mixers','Cocktails','Ready-to-Drink','Bar Snacks','Glassware & Supplies'] as $x) $pdo->prepare('INSERT OR IGNORE INTO categories(name) VALUES(?)')->execute([$x]);
        foreach (['Bottle','Can','Crate','Keg','Glass','Shot','Milliliter','Liter','Pack'] as $x) $pdo->prepare('INSERT OR IGNORE INTO units(name) VALUES(?)')->execute([$x]);
        $has = 1; $msg = 'Done! Admin created. DELETE api/install.php now, then log in at pages/login.html.';
    }
}
?><!DOCTYPE html><meta charset="utf-8"><title>Install Lush View Bar</title>
<body style="font-family:sans-serif;max-width:380px;margin:60px auto">
<h2>Lush View Bar Setup</h2><?php if ($msg) echo '<p><b>' . htmlspecialchars($msg) . '</b></p>'; ?>
<?php if (!$has): ?><form method="post">
<p><input name="name" placeholder="Your name" style="width:100%;padding:8px" required></p>
<p><input name="email" type="email" placeholder="Admin email" style="width:100%;padding:8px" required></p>
<p><input name="password" type="password" placeholder="Password (8+ chars)" style="width:100%;padding:8px" required minlength="8"></p>
<button style="padding:8px 16px;cursor:pointer">Create admin</button></form><?php endif; ?></body>
