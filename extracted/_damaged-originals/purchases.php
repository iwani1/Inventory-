<?php
require __DIR__ . '/db.php';
 = require_login();  = db();
 = 'SELECT p.*, s.name AS supplier, s.email AS supplier_email, s.phone AS supplier_phone FROM purchases p LEFT JOIN suppliers s ON s.id=p.supplier_id';
if (['REQUEST_METHOD'] === 'GET') {
    if (!empty(['id'])) {
         = ->prepare( . ' WHERE p.id=?');
        ->execute([(int)['id']]);
         = ->fetch(); if (!) fail('Not found', 404);
         = ->prepare('SELECT * FROM purchase_items WHERE purchase_id=?');
        ->execute([['id']]);
        ['items'] = ->fetchAll();
        json_out();
    }
     = ['from'] ?? '0000-01-01';  = ['to'] ?? '9999-12-31';
     = ->prepare( . ' WHERE date(COALESCE(p.purchase_date, p.created_at)) BETWEEN ? AND ? ORDER BY p.id DESC LIMIT 1000');
    ->execute([, ]);
    json_out(->fetchAll());
}
if (['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);
 = body();  = is_array(['items'] ?? null) ? ['items'] : [];
if (!) fail('Add at least one product line');
try {
     = tx(function () use (, , ) {
        ->prepare('INSERT INTO purchases(ref,supplier_id,purchase_date,user_id) VALUES(?,?,?,?)')
          ->execute([trim(['ref'] ?? '') ?: null, ((int)(['supplier_id'] ?? 0)) ?: null, ['purchase_date'] ?? date('Y-m-d'), ['id']]);
         = (int)->lastInsertId();  = 0;
        foreach ( as ) {
             = num(['qty'] ?? 0);  = num(['cost'] ?? 0);
            if ( <= 0) throw new RuntimeException('Quantities must be above zero');
             = ->prepare('SELECT id,name FROM products WHERE id=?'); ->execute([(int)(['product_id'] ?? 0)]);
             = ->fetch(); if (!) throw new RuntimeException('A product on the list no longer exists');
            ->prepare('INSERT INTO purchase_items(purchase_id,product_id,name,qty,cost) VALUES(?,?,?,?,?)')->execute([, ['id'], ['name'], , ]);
            ->prepare('UPDATE products SET stock = stock + ?, purchase_price = ? WHERE id=?')->execute([, , ['id']]);
            ->prepare("INSERT INTO stock_movements(product_id,type,qty,note,user_id) VALUES(?,'purchase',?,?,?)")->execute([['id'], , 'Purchase #' . , ['id']]);
             +=  * ;
        }
        ->prepare('UPDATE purchases SET total=?, paid=? WHERE id=?')->execute([, min(, num(['paid'] ?? )), ]);
        return ;
    });
} catch (RuntimeException ) { fail(->getMessage()); }
json_out(['id' => ], 201);
