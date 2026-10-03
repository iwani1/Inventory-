<?php
require __DIR__ . '/db.php';
 = require_login();  = db();
if (['REQUEST_METHOD'] === 'GET') {
    if (!empty(['product_id'])) {
         = ->prepare('SELECT m.*, p.name, p.sku FROM stock_movements m JOIN products p ON p.id=m.product_id WHERE m.product_id=? ORDER BY m.id DESC LIMIT 200');
        ->execute([(int)['product_id']]);
        json_out(->fetchAll());
    }
    json_out(->query('SELECT m.*, p.name, p.sku FROM stock_movements m JOIN products p ON p.id=m.product_id ORDER BY m.id DESC LIMIT 150')->fetchAll());
}
if (['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);
 = body();  = (int)(['product_id'] ?? 0);  = num(['qty'] ?? 0);
 = (['type'] ?? '') === 'remove' ? -1 : 1;
if (! ||  <= 0) fail('Choose a product and enter a quantity above zero');
try {
    tx(function () use (, , , , ) {
         = ->prepare('UPDATE products SET stock = stock + ? WHERE id = ? AND stock + ? >= 0');
        ->execute([ * , ,  * ]);
        if (!->rowCount()) throw new RuntimeException('Not enough stock to remove that quantity');
        ->prepare("INSERT INTO stock_movements(product_id,type,qty,note,user_id) VALUES(?,'adjustment',?,?,?)")
          ->execute([,  * , trim(['note'] ?? '') ?: null, ['id']]);
    });
} catch (RuntimeException ) { fail(->getMessage()); }
json_out(['ok' => true]);
