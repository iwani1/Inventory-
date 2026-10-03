/**
 * Live preview server for the repaired Lush View Bar build.
 *
 * Serves public_html/ (static files) + executes the PHP API through a real
 * PHP 8.3 WebAssembly runtime with pdo_sqlite — the same stack the app targets.
 *
 * Run:  node server.mjs            (listens on 0.0.0.0:8080)
 * First visit /api/install.php to create the admin, exactly like on cPanel.
 * The SQLite database lives in the in-memory VFS, so data resets on restart.
 */
import { PHP, PHPRequestHandler } from '@php-wasm/universal';
import { loadNodeRuntime, createNodeFsMountHandler } from '@php-wasm/node';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../lushview-bar/public_html');
const PORT = Number(process.env.PORT || 8080);

const php = new PHP(await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 1 } }));
php.mount('/site', createNodeFsMountHandler(APP));
const handler = new PHPRequestHandler({ php, documentRoot: '/site', absoluteUrl: 'http://localhost' });

const server = http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;

    const r = await handler.request({
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: body ? new Uint8Array(body) : undefined,
    });

    const headers = { ...(r.headers || {}) };
    delete headers['content-encoding'];
    res.writeHead(r.httpStatusCode || 200, headers);
    res.end(Buffer.from(r.bytes ?? new Uint8Array()));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('preview error: ' + (e?.message || e));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lush View Bar preview: http://0.0.0.0:${PORT}/  (docroot ${APP})`);
  console.log('First run: open /api/install.php and create the admin account.');
  if (!fs.existsSync(APP)) console.error('WARNING: docroot not found:', APP);
});
