<?php
require __DIR__ . '/db.php';
$user = require_login();
$pdo = db();
$type = $_GET['type'] ?? 'pl';

if ($type === 'pl') {
    $from = $_GET['from'] ?? date('Y-m-01');
    $to = $_GET['to'] ?? date('Y-m-d');
    
    $st = $pdo->prepare('SELECT COUNT(*) as sales_count, COALESCE(SUM(subtotal),0) as subtotal, COALESCE(SUM(discount),0) as discount, COALESCE(SUM(subtotal - discount),0) as revenue, COALESCE(SUM(tax),0) as tax, COALESCE(SUM(total),0) as total, COALESCE(SUM(paid),0) as paid FROM sales WHERE date(created_at) BETWEEN ? AND ?');
    $st->execute([$from, $to]);
    $sales = $st->fetch();

    $st = $pdo->prepare('SELECT COALESCE(SUM(i.qty * i.cost), 0) FROM sale_items i JOIN sales s ON s.id=i.sale_id WHERE date(s.created_at) BETWEEN ? AND ?');
    $st->execute([$from, $to]);
    $cogs = (float)$st->fetchColumn();

    $st = $pdo->prepare('SELECT COALESCE(category, "General") as category, COUNT(*) as count, COALESCE(SUM(amount),0) as total FROM expenses WHERE date(COALESCE(expense_date, created_at)) BETWEEN ? AND ? GROUP BY category ORDER BY total DESC');
    $st->execute([$from, $to]);
    $expenses = $st->fetchAll();
    $totalExpenses = array_sum(array_column($expenses, 'total'));

    $revenue = (float)$sales['revenue'];
    $gross = $revenue - $cogs;
    $net = $gross - $totalExpenses;
    $margin = $revenue > 0 ? round(($net / $revenue) * 100, 2) : 0;

    json_out([
        'from' => $from,
        'to' => $to,
        'sales_count' => (int)$sales['sales_count'],
        'subtotal' => (float)$sales['subtotal'],
        'discount' => (float)$sales['discount'],
        'revenue' => $revenue,
        'tax' => (float)$sales['tax'],
        'total' => (float)$sales['total'],
        'paid' => (float)$sales['paid'],
        'cogs' => $cogs,
        'gross_profit' => $gross,
        'expense_categories' => $expenses,
        'total_expenses' => $totalExpenses,
        'net_profit' => $net,
        'net_margin_percent' => $margin,
    ]);
}

if ($type === 'customers') {
    $rows = $pdo->query('
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
    json_out($rows);
}

if ($type === 'suppliers') {
    $rows = $pdo->query('
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
    json_out($rows);
}

fail('Unknown report type', 400);
