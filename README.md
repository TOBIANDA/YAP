# ⚡ YAP - Mobile AI Studio (Free API Edition)

Aplikasi AppBuilder generasi baru dengan antarmuka **Foku Pastel Sky**, dirancang untuk merancang dan menguji aplikasi web secara instan menggunakan **Google Gemini Free Tier & Groq Cloud Free Tier**.

---

## ✨ Fitur Utama

1. **🌐 Integrasi API AI Sungguhan Tanpa Generator Cadangan:**
   - **Google Gemini API (Free Tier):** Terhubung ke `gemini-2.0-flash` dan `gemini-1.5-flash` gratis via Google AI Studio. Sangat stabil dan cerdas menghasilkan kode aplikasi web.
   - **Groq Cloud API (Free Tier):** Inferensi tercepat di dunia (<1 detik) menggunakan model `llama-3.3-70b-versatile` dan `llama-3.1-8b-instant`.
   - **Pollinations.ai:** Opsi tambahan tanpa API key.
   - **🚫 Tanpa Generator Cadangan:** YAP tidak lagi menggunakan template statis/dummy cadangan (catatan, jam offline hardcoded). Semua kode di-generate secara real-time dan orisinal sesuai permintaan pengguna. Jika terjadi kendala kuota/koneksi, YAP akan memberikan laporan error transparan dan panduan pengaturan key.

2. **📱 APK Mobile Android:**
   - Berkas installer release mandiri [`yap.apk`](yap.apk) siap diinstal langsung di smartphone Android.
   - Menggunakan WebView hardware-accelerated dengan sinkronisasi Live Preview dan engine API baru.

3. **🐾 Maskot Hyper-Interaktif:**
   - **Pose Tangan Simetris:** Lambaian tangan panjang dihilangkan, diganti pose tangan bersandar imut (*cute resting paws*).
   - **Live Eye Tracking:** Mata dan pupil maskot bergerak halus mengikuti kursor mouse atau sentuhan layar.
   - **Ekspresi Dinamis & Kedipan Alami:** Ekspresi berubah dinamis (*normal*, *happy*, *love*, *thinking*, *surprised*).
   - **Jelly Bounce Physics:** Ketukan pada maskot memicu efek *squash & stretch* elastis dan combo burst.

4. **📱 Live Preview Sandbox & Code Inspector:**
   - Uji aplikasi dalam frame responsif Ponsel & Layar Penuh.
   - Ekspor kode dalam 1 klik (.html) atau salin langsung ke clipboard.

---

## 🛠️ Antigravity Skills yang Dipasang

Sesuai direktori [Antigravity Skills Directory](https://antigravityskills.directory/), skill-skill berikut telah ditambahkan ke `.agents/skills/`:
- **`app-builder`**: Application building orchestrator untuk merencanakan arsitektur, tech-stack, dan perancangan aplikasi.
- **`gemini-api-dev`**: Spesialis integrasi Google Gemini API resmi (Gemini 2.5 / 2.0 / 1.5 Flash).
- **`flutter-expert`**: Spesialis Flutter dan Dart untuk pengembangan dan perbaikan APK mobile.
- **`mobile-developer`**: Arsitektur aplikasi mobile dan Android native best practices.
- **`frontend-developer`**: Perancangan UI/UX modern, responsive layout, dan komponen web modern.
- **`frontend-api-integration-patterns`**: Pola integrasi REST & AI API di sisi frontend.

---

## 🚀 Cara Menjalankan

1. **Versi Web:** Cukup buka [`index.html`](index.html) atau klik ganda [`start.bat`](start.bat).
2. **Versi Android:** Pasang berkas [`yap.apk`](yap.apk) ke ponsel Android Anda.
