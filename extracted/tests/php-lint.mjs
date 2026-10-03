import { PhpNode } from 'php-wasm/PhpNode';
import fs from 'node:fs';
import path from 'node:path';

const root = '/home/user/Inventory-/extracted/lushview-bar/public_html';
const files = [];
const walk = d => { for (const e of fs.readdirSync(d, {withFileTypes:true})) {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (e.name.endsWith('.php')) files.push(p);
} };
walk(root);

const items = files.map(f => ({ f: f.replace(root + '/', ''), b: fs.readFileSync(f).toString('base64') }));
const payload = JSON.stringify(items);

const php = new PhpNode({ version: '8.3' });
let out = '';
php.addEventListener('output', e => { out += e.detail.join(''); });
await php.run(`<?php
$items = json_decode(base64_decode('${Buffer.from(payload).toString('base64')}'), true);
foreach ($items as $it) {
  $code = base64_decode($it['b']);
  try { token_get_all($code, TOKEN_PARSE); echo "OK\t" . $it['f'] . "\n"; }
  catch (Throwable $e) { echo "BROKEN\t" . $it['f'] . "\t" . $e->getMessage() . "\n"; }
}`);
process.stdout.write(out);
