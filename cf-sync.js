/* PANDAI ⇄ Cloudflare (Workers + D1). Isi PANDAI_API dengan URL Worker Anda.
   Jika kosong, aplikasi tetap berjalan offline dengan localStorage seperti sebelumnya. */
(function () {
  const API = (window.PANDAI_API || '').replace(/\/$/, '');
  if (!API) return;
  const TK = 'pandai_cf_token';
  const MAP = { pandai_users_v2:'users', pandai_products_v2:'products', pandai_orders_v2:'orders',
    pandai_installments_v2:'installments', pandai_visits_v2:'visits', pandai_officer_v2:'officer', pandai_payment_config_v2:'payment_config' };
  const SINGLE = ['officer', 'payment_config'];
  const rawSet = Storage.prototype.setItem;
  const snap = {}; let queue = [], timer = null, applying = false;

  const toMap = (col, raw) => {
    let v; try { v = JSON.parse(raw); } catch (e) { return {}; }
    if (SINGLE.includes(col)) return { main: JSON.stringify(v) };
    const m = {}; (Array.isArray(v) ? v : []).forEach(d => { if (d && d.id) m[d.id] = JSON.stringify(d); });
    return m;
  };
  Object.entries(MAP).forEach(([k, col]) => { snap[col] = toMap(col, localStorage.getItem(k) || '[]'); });

  async function api(path, opt = {}) {
    const r = await fetch(API + path, { ...opt, headers: { 'Content-Type': 'application/json',
      ...(localStorage.getItem(TK) ? { Authorization: 'Bearer ' + localStorage.getItem(TK) } : {}) } });
    return { status: r.status, data: await r.json().catch(() => ({})) };
  }

  async function flush() {
    timer = null; if (!queue.length || !localStorage.getItem(TK)) { queue = []; return; }
    const changes = queue; queue = [];
    const r = await api('/api/sync', { method: 'POST', body: JSON.stringify({ changes }) }).catch(() => null);
    if (!r || r.status === 401) { if (r) localStorage.removeItem(TK); }
  }

  Storage.prototype.setItem = function (key, value) {
    rawSet.call(this, key, value);
    const col = MAP[key]; if (!col || applying || this !== localStorage) return;
    const now = toMap(col, value), old = snap[col];
    for (const id in now) if (now[id] !== old[id]) queue.push({ collection: col, id, doc: JSON.parse(now[id]) });
    for (const id in old) if (!(id in now)) queue.push({ collection: col, id, deleted: true });
    snap[col] = now;
    clearTimeout(timer); timer = setTimeout(flush, 800);
  };

  async function pull() {
    const r = await api('/api/sync'); if (r.status !== 200) return;
    applying = true;
    Object.entries(MAP).forEach(([k, col]) => {
      const remote = r.data[col] || [];
      if (SINGLE.includes(col)) { if (remote[0]) rawSet.call(localStorage, k, JSON.stringify(remote[0])); }
      else {
        const local = JSON.parse(localStorage.getItem(k) || '[]'), byId = new Map(local.map(d => [d.id, d]));
        remote.forEach(d => { const l = byId.get(d.id); byId.set(d.id, { ...l, ...d, ...(l && l.passwordHash ? { passwordHash: l.passwordHash } : {}) }); });
        rawSet.call(localStorage, k, JSON.stringify([...byId.values()]));
      }
      snap[col] = toMap(col, localStorage.getItem(k) || '[]');
    });
    applying = false;
    if (window.State) { State.load(); if (window.renderApp) renderApp(); }
  }

  async function serverLogin(email, password, localUser) {
    let r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (r.status === 404 && localUser && localUser.role !== 'admin') { // migrasi akun lokal lama ke D1
      const { passwordHash, ...profile } = localUser;
      r = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, profile }) });
    }
    if (r.data && r.data.token) { rawSet.call(localStorage, TK, r.data.token); await pull(); }
  }

  const wrap = (name, getCreds) => {
    const orig = window[name]; if (typeof orig !== 'function') return;
    window[name] = function (e) {
      const c = getCreds(); const res = orig.apply(this, arguments);
      setTimeout(() => {
        if (!c.email || !c.password) return;
        const cu = JSON.parse(localStorage.getItem('pandai_current_user_v2') || 'null');
        if (cu) serverLogin(c.email, c.password, cu).catch(() => {});
      }, 300);
      return res;
    };
  };
  const val = id => (document.getElementById(id) || {}).value || '';
  wrap('handleUnifiedLogin', () => ({ email: val('loginEmail').trim(), password: val('loginPassword').trim() }));
  wrap('handleUserRegister', () => ({ email: val('regEmail').trim(), password: val('regPassword').trim() }));
  wrap('handleSupplierRegister', () => ({ email: val('supRegEmail').trim(), password: val('supRegPassword').trim() }));
  ['handleUserLogin', 'handleSupplierLogin', 'handleAdminLogin'].forEach(n => { window[n] = window.handleUnifiedLogin; });

  const origLogout = window.logout;
  if (typeof origLogout === 'function') window.logout = function () { localStorage.removeItem(TK); return origLogout.apply(this, arguments); };

  window.PandaiCloud = { pull, stats: () => api('/api/admin/stats') };
  if (localStorage.getItem(TK)) pull().catch(() => {});
})();
