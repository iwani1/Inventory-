<?php
require __DIR__ . '/db.php';
 = require_login();
 = db();
 = ['type'] ?? 'pl';

if ( === 'pl') {
     = ['from'] ?? date('Y-m-01');
     = ['to'] ?? date('Y-m-d');
    
     = ->prepare('SELECT COUNT(*) as sales_count, COALESCE(SUM(subtotal),0) as subtotal, COALESCE(SUM(discount),0) as discount, COALESCE(SUM(subtotal - discount),0) as revenue, COALESCE(SUM(tax),0) as tax, COALESCE(SUM(total),0) as total, COALESCE(SUM(paid),0) as paid FROM sales WHERE date(created_at) BETWEEN ? AND ?');
    ->execute([, ]);
     = ->fetch();

     = ->prepare('SELECT COALESCE(SUM(i.qty * i.cost), 0) FROM sale_items i JOIN sales s ON s.id=i.sale_id WHERE date(s.created_at) BETWEEN ? AND ?');
    ->execute([, ]);
     = (float)->fetchColumn();

     = ->prepare('SELECT COALESCE(category, "General") as category, COUNT(*) as count, COALESCE(SUM(amount),0) as total FROM expenses WHERE date(COALESCE(expense_date, created_at)) BETWEEN ? AND ? GROUP BY category ORDER BY total DESC');
    ->execute([, ]);
     = ->fetchAll();
     = array_sum(array_column(, 'total'));

     = (float)['revenue'];
     =  - ;
     =  - ;
     =  > 0 ? round(( / ) * 100, 2) : 0;

    json_out([
        'from' => ,
        'to' => ,
        'sales_count' => (int)['sales_count'],
        'subtotal' => (float)['subtotal'],
        'discount' => (float)['discount'],
        'revenue' => ,
        'tax' => (float)['tax'],
        'total' => (float)['total'],
        'paid' => (float)['paid'],
        'cogs' => ,
        'gross_profit' => ,
        'expense_categories' => ,
        'total_expenses' => ,
        'net_profit' => ,
        'net_margin_percent' => ,
    ]);
}

if ( === 'customers') {
     = ->query('
        SELECT c.*,
          COUNT(s.id) as orders_count,
          COALESCE(SUM(s.total), 0) as total_spent,
          COALESCE(SUM(s.paid), 0) as total_paid,
          COALESCE(SUM(s.total - s.paid), 0) as outstanding,
          MAX(s.created_at) as last_order_date
        FROM customers c
        LEFT JOIN sales s ON s.customer_id = c.id
        GROUP BY c.id
        ORDER BY total_spent DESC
    ')->fetchAll();
    json_out();
}

if ( === 'suppliers') {
     = ->query('
        SELECT s.*,
          COUNT(p.id) as purchases_count,
          COALESCE(SUM(p.total), 0) as total_spent,
          COALESCE(SUM(p.paid), 0) as total_paid,
          COALESCE(SUM(p.total - p.paid), 0) as outstanding,
          MAX(COALESCE(p.purchase_date, p.created_at)) as last_purchase_date
        FROM suppliers s
        LEFT JOIN purchases p ON p.supplier_id = s.id
        GROUP BY s.id
        ORDER BY total_spent DESC
    ')->fetchAll();
    json_out();
}

fail('Unknown report type', 400);
