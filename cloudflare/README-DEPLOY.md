# Deploy PANDAI ke Cloudflare (Database D1 + Admin)

Jalankan dari folder `cloudflare/`:

1. `npm i -g wrangler && wrangler login`
2. `wrangler d1 create pandai-db` → salin `database_id` ke `wrangler.toml`
3. `wrangler d1 execute pandai-db --remote --file=schema.sql`
4. Secret (akan ditanya nilainya):
   - `wrangler secret put JWT_SECRET`  (isi string acak panjang)
   - `wrangler secret put ADMIN_EMAIL`  (mis. admin@pandai.id)
   - `wrangler secret put ADMIN_PASSWORD`  (password kuat, BUKAN admin123)
5. `wrangler deploy` → catat URL, mis. `https://pandai-api.xxx.workers.dev`
6. Di `index.html`, isi `window.PANDAI_API = "URL_WORKER_ANDA"`
7. Hosting frontend: Cloudflare Pages (upload folder proyek ini, kecuali `cloudflare/` dan `test_*.html`).
   Lalu ubah `ALLOWED_ORIGIN` di `wrangler.toml` ke domain Pages Anda dan `wrangler deploy` ulang.

## Cara kerja
- Login admin diverifikasi server (PBKDF2 + token). Admin pertama dibuat otomatis saat login dengan ADMIN_EMAIL/ADMIN_PASSWORD.
- Pendaftaran publik hanya bisa jadi Mitra (`user`) atau Supplier — tidak bisa jadi admin.
- Admin melihat/mengubah semua data; mitra & supplier hanya data miliknya.
- Akun lokal lama otomatis dimigrasi ke D1 saat login pertama.
- Cek data: `PandaiCloud.stats()` di konsol (khusus admin) atau `GET /api/admin/stats`.

## Catatan keamanan (tahap berikutnya)
Logika limit kredit & pelunasan masih dihitung di browser, jadi mitra teknis bisa mengubah nilai limitnya sendiri.
Untuk produksi, pindahkan perhitungan itu ke Worker. Nomor rekening di README lama sebaiknya tidak dipublikasikan.
