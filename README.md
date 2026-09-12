# Trade Journal Pro

Tolong buatkan kode lengkap untuk aplikasi PWA Trading Journal berbasis React, TypeScript, dan Tailwind CSS. 

### 1. Arsitektur & Aturan Kode

- **Pemisahan UI dan Logic (Separation of Concerns):** Pisahkan antara komponen UI murni (Presentational Components) dan business logic/state management (Custom Hooks / Container components). Jangan menumpuk state/logic di dalam komponen tampilan utama.

- **Reusable Components:** Buat komponen yang modular dan bisa digunakan kembali (misal: reusable Input, Select, Badge, Button, Card, Modal).

- **Responsive Design:** Wajib *fully responsive* (nyaman digunakan di layar mobile/HP, tablet, hingga desktop/laptop) dengan pendekatan mobile-first.

- **Modern & Custom UI:** Buat tampilan yang sangat menarik, elegan, modern, dan berasa seperti aplikasi SaaS profesional (bukan tampilan UI dasar/default Tailwind yang membosankan). Gunakan efek kaca (backdrop-blur / glassmorphism tipis), border halus, shadow lembut, transisi hover yang mulus, dan tipografi yang rapi.

### 2. Fitur Utama & Form Input Trading Journal

Buatkan form input pencatatan trading yang interaktif beserta daftar (list/table/card view) riwayat trading yang sudah dicatat. Field yang harus ada di dalam form:

1. **Date:** Input tanggal & waktu transaksi.

2. **Pair:** Input teks untuk instrumen trading (contoh: EURUSD, XAUUSD, BTCUSDT).

3. **Bias:** Pilihan (Bullish / Bearish). 

   - *Aturan Warna Badge/Background:* Jika **Bullish** beri background warna hijau (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`), jika **Bearish** beri background warna merah (`bg-rose-500/10 text-rose-400 border-rose-500/20`).

4. **Draw on Liquidity (DOL):** Input teks untuk target likuiditas (misal: Daily High, Previous Session Low).

5. **Entry Model:** Input teks atau pilihan model konfirmasi entry (misal: MSS, FVG Rejection, Order Block, Breaker).

6. **Killzone:** Pilihan sesi waktu (London Open, NY AM, Asian, NY PM, dll).

7. **Position:** Pilihan (Long / Short). 

   - *Aturan Warna:* **Long** beri warna hijau, **Short** beri warna merah.

8. **Status / Result (Profit/Lose):** Pilihan status trade:

   - Win -> Background hijau

   - Lose -> Background merah

   - Running -> Background oranye

   - Close -> Background merah muda (pink soft)

   - SL+ -> Background biru muda

   - BE (Break Even) -> Background abu-abu (gray)

9. **Risk to Reward (RR):** Input angka/desimal (contoh: 1:2, 1:3.5).

10. **Screenshot TradingView:** Input file/upload atau URL untuk melampirkan gambar analisis chart TradingView.

### 3. Persyaratan PWA (Progressive Web App)

- Sertakan konfigurasi file pendukung dasar PWA seperti `manifest.json` sederhana dan instruksi/setup service worker agar aplikasi ini bisa di-install layaknya aplikasi native di HP.

Tolong berikan struktur folder yang jelas serta kode modular untuk komponen-komponen utamanya (Form, Table/Card List, Custom Hooks untuk state, dan tipe datanya dalam TypeScript).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://trade-jurnal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b4b95c4-13ad-4e9c-82ad-8b4f613facfb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
