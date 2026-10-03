import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime } from '@php-wasm/node';
const php = new PHP(await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 42 } }));
const r = await php.runStream({ code: `<?php
echo "PHP " . PHP_VERSION . PHP_EOL;
echo "sapi: " . php_sapi_name() . PHP_EOL;
foreach (['pdo_sqlite','sqlite3','pdo','json','session','mbstring'] as $e) printf("%-10s %s\n", $e, extension_loaded($e) ? 'yes' : 'no');
echo "php://input = [" . @file_get_contents('php://input') . "]\n";
echo "cwd writable: " . (is_writable('/tmp') ? 'yes':'no') . PHP_EOL;
`});
console.log(await r.stdoutText);
console.error((await r.stderrText).slice(0, 600));
