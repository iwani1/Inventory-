<?php
require __DIR__ . '/db.php';
 = require_login();
 = db();
 = ['REQUEST_METHOD'];
 = (int)(['id'] ?? 0);

if ( === 'GET') {
    require_role(, ['admin', 'manager']);
    if () {
         = ->prepare('SELECT id,name,email,role,active,created_at FROM users WHERE id=?');
        ->execute([]);
         = ->fetch();
        if (!) fail('User not found', 404);
        json_out();
    }
    json_out(->query('SELECT id,name,email,role,active,created_at FROM users ORDER BY id DESC')->fetchAll());
}

if ( === 'POST') {
    require_role(, ['admin']);
     = body();
     = trim(['name'] ?? '');
     = strtolower(trim(['email'] ?? ''));
     = ['password'] ?? '';
     = in_array(['role'] ?? 'staff', ['admin', 'manager', 'staff'], true) ? ['role'] : 'staff';
    if (! || !filter_var(, FILTER_VALIDATE_EMAIL) || strlen() < 8) {
        fail('Name, valid email, and password (min 8 chars) are required');
    }
    try {
        ->prepare("INSERT INTO users(name,email,password_hash,role,active) VALUES(?,?,?,?,'1')")
            ->execute([, , password_hash(, PASSWORD_DEFAULT), ]);
        json_out(['id' => (int)->lastInsertId()], 201);
    } catch (PDOException ) {
        fail(str_contains(->getMessage(), 'UNIQUE') ? 'Email already registered' : 'Database error', 409);
    }
}

if ( === 'PUT') {
    require_role(, ['admin']);
    if (!) fail('User ID required', 400);
     = body();
     = trim(['name'] ?? '');
     = strtolower(trim(['email'] ?? ''));
     = in_array(['role'] ?? 'staff', ['admin', 'manager', 'staff'], true) ? ['role'] : 'staff';
     = isset(['active']) ? (int)(bool)['active'] : 1;
    if (! || !filter_var(, FILTER_VALIDATE_EMAIL)) {
        fail('Valid name and email are required');
    }
    try {
        if (!empty(['password']) && strlen(['password']) >= 8) {
            ->prepare('UPDATE users SET name=?, email=?, role=?, active=?, password_hash=? WHERE id=?')
                ->execute([, , , , password_hash(['password'], PASSWORD_DEFAULT), ]);
        } else {
            ->prepare('UPDATE users SET name=?, email=?, role=?, active=? WHERE id=?')
                ->execute([, , , , ]);
        }
        json_out(['ok' => true]);
    } catch (PDOException ) {
        fail(str_contains(->getMessage(), 'UNIQUE') ? 'Email already in use' : 'Database error', 409);
    }
}

if ( === 'DELETE') {
    require_role(, ['admin']);
    if (!) fail('User ID required', 400);
    if ( === (int)['id']) fail('Cannot delete your own account', 400);
    ->prepare('DELETE FROM users WHERE id=?')->execute([]);
    json_out(['ok' => true]);
}

fail('Method not allowed', 405);
