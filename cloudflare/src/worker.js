// PANDAI API — Cloudflare Worker + D1
const COLLECTIONS = ['users','products','orders','installments','visits','officer','payment_config'];
const SINGLETON = ['officer','payment_config'];
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
const enc = new TextEncoder();

async function hashPw(password, saltB64) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt: unb64(saltB64), iterations: 100000 }, key, 256);
  return b64(bits);
}
async function hmac(secret, data) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  return b64(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
async function signToken(env, payload) {
  const body = b64(enc.encode(JSON.stringify({ ...payload, exp: Date.now() + 7*864e5 })));
  return body + '.' + await hmac(env.JWT_SECRET, body);
}
async function verifyToken(env, req) {
  const t = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const [body, sig] = t.split('.');
  if (!body || !sig || sig !== await hmac(env.JWT_SECRET, body)) return null;
  const p = JSON.parse(new TextDecoder().decode(unb64(body)));
  return p.exp > Date.now() ? p : null;
}
const cors = (env) => ({
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
});
const json = (env, data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json', ...cors(env) } });

const ownerOf = (col, doc, uid) =>
  col === 'users' ? doc.id : (doc.userId || doc.supplierId || doc.ownerId || uid);

async function upsert(env, col, id, owner, doc) {
  await env.DB.prepare(
    `INSERT INTO records (collection,id,owner_id,data,updated_at) VALUES (?,?,?,?,?)
     ON CONFLICT(collection,id) DO UPDATE SET owner_id=excluded.owner_id, data=excluded.data, updated_at=excluded.updated_at`
  ).bind(col, id, owner, JSON.stringify(doc), Date.now()).run();
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(env) });
    const url = new URL(req.url);
    const path = url.pathname;
    try {
      // ---------- AUTH ----------
      if (path === '/api/auth/login' && req.method === 'POST') {
        const { email, password } = await req.json();
        const e = String(email || '').trim().toLowerCase();
        let acc = await env.DB.prepare('SELECT * FROM accounts WHERE email=?').bind(e).first();
        // Bootstrap admin pertama dari secret ADMIN_EMAIL / ADMIN_PASSWORD
        if (!acc && env.ADMIN_EMAIL && e === env.ADMIN_EMAIL.toLowerCase() && password === env.ADMIN_PASSWORD) {
          const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
          const id = 'adm_' + Date.now();
          await env.DB.prepare('INSERT INTO accounts VALUES (?,?,?,?,?,?)')
            .bind(id, e, await hashPw(password, salt), salt, 'admin', Date.now()).run();
          await upsert(env, 'users', id, id, { id, email: e, name: 'Admin Koperasi', role: 'admin' });
          acc = await env.DB.prepare('SELECT * FROM accounts WHERE id=?').bind(id).first();
        }
        if (!acc) return json(env, { error: 'not_found' }, 404);
        if (await hashPw(password || '', acc.salt) !== acc.pass_hash) return json(env, { error: 'wrong_password' }, 401);
        const token = await signToken(env, { uid: acc.id, role: acc.role });
        return json(env, { token, uid: acc.id, role: acc.role });
      }
      if (path === '/api/auth/register' && req.method === 'POST') {
        const { email, password, profile = {} } = await req.json();
        const e = String(email || '').trim().toLowerCase();
        if (!e || !password || password.length < 6) return json(env, { error: 'invalid' }, 400);
        if (await env.DB.prepare('SELECT 1 FROM accounts WHERE email=?').bind(e).first()) return json(env, { error: 'exists' }, 409);
        const role = profile.role === 'supplier' ? 'supplier' : 'user'; // admin TIDAK bisa daftar sendiri
        const id = String(profile.id || (role === 'supplier' ? 'sup_' : 'usr_') + Date.now());
        const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
        await env.DB.prepare('INSERT INTO accounts VALUES (?,?,?,?,?,?)')
          .bind(id, e, await hashPw(password, salt), salt, role, Date.now()).run();
        delete profile.passwordHash;
        await upsert(env, 'users', id, id, { ...profile, id, email: e, role });
        return json(env, { token: await signToken(env, { uid: id, role }), uid: id, role });
      }

      // ---------- BUTUH LOGIN ----------
      const auth = await verifyToken(env, req);
      if (!auth) return json(env, { error: 'unauthorized' }, 401);
      const isAdmin = auth.role === 'admin';

      // Ambil data sesuai peran
      if (path === '/api/sync' && req.method === 'GET') {
        const out = {};
        for (const col of COLLECTIONS) {
          let q, args = [col];
          if (isAdmin || ['products','officer','payment_config'].includes(col)) q = 'SELECT data FROM records WHERE collection=?';
          else if (auth.role === 'supplier' && col === 'orders') { q = 'SELECT data FROM records WHERE collection=? AND data LIKE ?'; args.push(`%"${auth.uid}"%`); }
          else { q = 'SELECT data FROM records WHERE collection=? AND owner_id=?'; args.push(auth.uid); }
          const { results } = await env.DB.prepare(q).bind(...args).all();
          out[col] = results.map(r => JSON.parse(r.data));
        }
        return json(env, out);
      }

      // Kirim perubahan
      if (path === '/api/sync' && req.method === 'POST') {
        const { changes = [] } = await req.json();
        let ok = 0, denied = 0;
        for (const c of changes.slice(0, 200)) {
          const { collection: col, id, doc, deleted } = c;
          if (!COLLECTIONS.includes(col) || !id) { denied++; continue; }
          const existing = await env.DB.prepare('SELECT owner_id,data FROM records WHERE collection=? AND id=?').bind(col, String(id)).first();
          const owner = existing ? existing.owner_id : ownerOf(col, doc || {}, auth.uid);
          const adminOnly = SINGLETON.includes(col) || (col === 'products' && false);
          const allowed = isAdmin || (!adminOnly && owner === auth.uid) || (col === 'products' && auth.role === 'supplier' && (doc||{}).supplierId === auth.uid);
          if (!allowed && !(col === 'orders' && !existing)) { denied++; continue; }
          if (deleted) { if (isAdmin) await env.DB.prepare('DELETE FROM records WHERE collection=? AND id=?').bind(col, String(id)).run(); ok++; continue; }
          const next = { ...doc };
          if (col === 'users') { // role & kredensial tidak boleh diubah dari klien
            delete next.passwordHash; delete next.password;
            const acc = await env.DB.prepare('SELECT role FROM accounts WHERE id=?').bind(String(id)).first();
            if (acc) next.role = acc.role;
          }
          await upsert(env, col, String(id), col === 'orders' && !existing ? auth.uid : owner, next);
          ok++;
        }
        return json(env, { ok, denied });
      }

      // ---------- ADMIN ----------
      if (path === '/api/admin/stats' && req.method === 'GET') {
        if (!isAdmin) return json(env, { error: 'forbidden' }, 403);
        const { results } = await env.DB.prepare('SELECT collection, COUNT(*) AS total FROM records GROUP BY collection').all();
        const acc = await env.DB.prepare('SELECT role, COUNT(*) AS total FROM accounts GROUP BY role').all();
        return json(env, { records: results, accounts: acc.results });
      }
      return json(env, { error: 'not_found' }, 404);
    } catch (err) {
      return json(env, { error: 'server_error', detail: String(err.message || err) }, 500);
    }
  }
};
