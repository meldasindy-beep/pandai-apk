# 🌾 PANDAI - Koperasi Digital Sembako UMKM (PWA)

**PANDAI** adalah Progressive Web App (PWA) yang dirancang khusus untuk membantu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM)—seperti pemilik warung kelontong, pedagang pasar, dan pelaku usaha kuliner harian—mendapatkan pasokan sembako grosir langsung dari supplier dengan sistem **Beli Sekarang, Bayar Nanti (BNPL)** melalui koperasi digital.

---

## 🌟 Fitur Utama Aplikasi

### 🛒 1. Pengadaan Sembako Langsung dari Supplier
- Akses ke distributor resmi dan produsen (Beras Ramos, Pandan Wangi, Minyak Bimoli, Filma, Gulaku, Telur Peti, Bogasari Segitiga Biru, Indomie Dus, Bawang Merah, dll.).
- Harga grosir lebih hemat dibanding harga eceran pasar (menampilkan nominal penghematan langsung).
- Filter kategori sembako dan pencarian produk secara *real-time*.

### 💳 2. Beli Sekarang, Bayar Nanti (Koperasi BNPL)
- **Tenor 14 Hari Tanpa Bunga (0% Bunga)**: Solusi favorit warung untuk perputaran stok harian cepat tanpa beban bunga.
- **Tenor Panjang (1 - 3 Bulan)**: Bunga koperasi ringan (1.5% - 2.5% per bulan) untuk pembelian stok skala besar.
- **Plafon Limit Bertahap**: Limit awal otomatis naik seiring ketepatan pembayaran cicilan (Tier Silver Rp 2 Jt ➔ Gold Rp 5 Jt ➔ Platinum Rp 10 Jt).
- Kalkulasi otomatis total belanja, angsuran per termin, sisa limit, dan cek ketersediaan limit secara instan.

### 🔔 3. Pengingat Jatuh Tempo & Pembayaran Digital (QRIS Resmi BRI & Transfer Bank)
- **Tampilan Kode QRIS Resmi (BRImo):** Mengintegrasikan poster QRIS resmi Bank BRI atas nama **IMELDA SINDI AYU SAPUTRI** (`qris-imelda.jpg`), lengkap dengan logo QRIS & GPN, verifikasi aktif 24 jam, serta fitur perbesar gambar dan tombol unduh.
- **Data Rekening Resmi Bank BRI:**
  - **Nama Bank:** Bank BRI (BritAma)
  - **Nomor Rekening:** `665501030233535`
  - **Atas Nama:** `IMELDA SINDI AYU SAPUTRI`
- **Fitur Pembayaran Interaktif:**
  - Tombol **"📋 Salin No. Rek"** (665501030233535) untuk kemudahan transfer langsung melalui mobile banking / ATM.
  - Tombol **"📋 Salin Nominal"** untuk memastikan jumlah transfer presisi tanpa salah ketik.
  - Tombol **"📥 Unduh Gambar QRIS"** untuk menyimpan poster QRIS ke galeri ponsel.
  - Panduan scan komprehensif untuk aplikasi perbankan (BRImo, BCA Mobile, Livin' Mandiri, BNI Mobile) dan e-wallet (GoPay, OVO, DANA, ShopeePay, LinkAja).
  - Tombol **"✅ Saya Sudah Bayar / Transfer"** untuk simulasi instan verifikasi pelunasan dan otomatisasi pengembalian limit kredit.
- **Pilihan Saluran Lengkap:** Tab switcher instan antara **QRIS Resmi (BRImo)** dan **Transfer Bank BRI**.
- Banner peringatan mencolok di Beranda saat tagihan mendekati tanggal jatuh tempo (<= 3 hari).
- Pelunasan tagihan otomatis mengembalikan limit kredit dan menaikkan skor kelancaran kredit (+3 poin).

### 📦 4. Riwayat Transaksi & Fitur Repeat Order (1-Klik)
- Pelacakan status pengiriman (*Menunggu Konfirmasi ➔ Diproses Gudang Supplier ➔ Armada Pick-up Berangkat ➔ Selesai Diterima*).
- Tombol **"Pesan Ulang (Repeat Order)"**: 1 klik untuk memasukkan seluruh daftar belanjaan lama kembali ke keranjang agar pemilik warung bisa restock kilat.

### 👨‍💼 5. Pendampingan Lapangan (Field Officer)
- **Profil Petugas Lapangan Resmi:** **Imelda Sindi Ayu Saputri** (Field Officer Senior Koperasi PANDAI Wilayah Pasar Minggu & Pancoran, Rating ⭐ 4.9).
- **Integrasi Langsung WhatsApp:** Terhubung langsung ke nomor `0895-3631-03296` (`https://wa.me/62895363103296`) dengan template kata-kata sapaan konsultasi pertama kali otomatis (dapat diedit atau langsung dikirim dalam 1 klik).
- **Jadwal Kunjungan Rutin:** Pendampingan rutin ke warung untuk cek pembukuan kas, audit stok fisik, dan verifikasi kelayakan kenaikan plafon limit kredit.
- **Form Pengajuan Kunjungan:** Mitra warung dapat mengajukan tanggal & sesi waktu kunjungan tambahan sesuai kebutuhan usaha.

### 🔐 6. Sistem Autentikasi & Login Terpisah
Aplikasi menyediakan login terpisah antara **Mitra UMKM** dan **Admin Koperasi**:

#### A. Akun Demo Mitra UMKM:
- **Email:** `warung.berkah@pandai.id`
- **Kata Sandi:** `password123`
- **Pemilik:** Ibu Siti Aminah (Warung Berkah Makmur)
- **Status:** Tier Gold (Limit Rp 5.000.000, Sisa Rp 3.250.000, Cicilan Aktif)

#### B. Akun Demo Admin Koperasi:
- **Email:** `admin@pandai.id`
- **Kata Sandi:** `admin123`
- **Nama:** Budi Santoso, S.E. (Koordinator Koperasi PANDAI)
- **Fitur Admin:**
  - **Monitoring KPI Berdasarkan Data Riil:** Menghitung total akun terdaftar, mitra warung, plafon kredit terpakai/tersedia, dan status cicilan langsung dari database nyata (`localStorage`) tanpa angka buatan/dummy.
  - **Pencatatan Riwayat Autentikasi Pengguna:** Merekam tanggal registrasi, waktu login terakhir, dan frekuensi login berhasil setiap mitra warung dan admin.
  - **Approval & Penyesuaian Plafon Limit Kredit:** Mengelola dan meningkatkan limit modal UMKM secara transparan (Tier Silver, Gold, Platinum).
  - **Kelola Sembako & Pesanan:** Menambah/mengedit stok harga supplier dan memantau status pengiriman pesanan secara *real-time*.

*(Tersedia tombol **⚡ Coba Demo Cepat (1-Klik Masuk)** pada halaman login untuk pengujian instan).*

---

## 📱 Desain & UX
- **Palet Warna:** Hijau Segar (`#16A34A` / `#0F5132`) & Putih untuk kesan terpercaya di sektor pangan, dengan aksen Oranye Cerah (`#F97316`) untuk tombol aksi utama (*Call to Action*).
- **Tipografi:** Google Font Poppins dengan teks besar dan kontras tinggi yang ramah bagi pelaku UMKM.
- **Navigasi Bawah (Bottom Navigation Bar):** Memudahkan pengoperasian satu tangan di ponsel.
- **Responsif:** Tampilan mobile-first yang elegan, dilengkapi tombol toggle untuk beralih ke mode layar lebar desktop.

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Buka Langsung di Browser
Cukup klik dua kali berkas `index.html` atau klik kanan dan pilih **Buka dengan (Open with) Google Chrome / Microsoft Edge**. Seluruh fungsionalitas aplikasi dan simulasi localStorage akan langsung berjalan tanpa server backend.

### Opsi 2: Menjalankan Sebagai PWA (Progressive Web App)
Untuk merasakan pengalaman instalasi PWA di ponsel atau desktop:
1. Jalankan web server lokal (misalnya menggunakan ekstensi *Live Server* di VS Code atau server HTTP apapun).
2. Buka URL lokal (misal: `http://localhost:5500`).
3. Pada browser, klik tombol **"Pasang Aplikasi PANDAI"** pada banner yang muncul atau melalui menu titik tiga browser (***Install / Add to Home screen***).
4. Aplikasi dapat dibuka secara *standalone* dan bekerja saat *offline* berkat dukungan `manifest.json` dan `sw.js`.

---

## 📁 Struktur Berkas

```
apk pandai/
├── index.html        # Seluruh aplikasi (HTML, CSS kustom, JavaScript logika, modal)
├── manifest.json     # Konfigurasi PWA Web App Manifest
├── sw.js             # Service Worker untuk caching aset dan dukungan offline
├── icon-192.png      # Ikon aplikasi PWA resolusi 192x192
├── icon-512.png      # Ikon aplikasi PWA resolusi 512x512
├── qris-imelda.jpg   # Gambar poster resmi QRIS BRI a.n. IMELDA SINDI AYU SAPUTRI
└── README.md         # Dokumentasi panduan aplikasi
```
