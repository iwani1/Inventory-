<?php
require __DIR__ . '/db.php';
require_login();
$q = fn($t) => db()->query("SELECT id,name FROM $t ORDER BY name")->fetchAll();
json_out(['categories' => $q('categories'), 'brands' => $q('brands'), 'units' => $q('units')]);
