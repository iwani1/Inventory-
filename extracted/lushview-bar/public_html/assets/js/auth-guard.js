/* Loads on every protected page: defines api() helper and redirects to login if not signed in. */
(function () {
  var base = document.currentScript.src.replace(/assets\/js\/auth-guard\.js.*$/, '');
  window.API_BASE = base + 'api/';
  window.APP_BASE = base;
  document.documentElement.style.visibility = 'hidden';
  window.api = async function (path, opt) {
    opt = opt || {};
    var r = await fetch(API_BASE + path, {
      method: opt.method || 'GET', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
      body: opt.body ? JSON.stringify(opt.body) : undefined
    });
    var d = await r.json().catch(function () { return {}; });
    if (r.status === 401) { location.href = APP_BASE + 'pages/login.html'; throw new Error('Please sign in'); }
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  };
  window.logout = async function (e) {
    if (e) e.preventDefault();
    try { await api('auth.php?action=logout'); } catch (x) {}
    location.href = APP_BASE + 'pages/login.html';
  };
  api('auth.php?action=me').then(function (u) { window.CURRENT_USER = u; })
    .catch(function () {}).then(function () { document.documentElement.style.visibility = ''; });
})();
