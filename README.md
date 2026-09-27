# RealityCheck ⚡
> *Cek dulu sebelum dijalankan.*

RealityCheck adalah aplikasi web berbasis AI yang membantu pengguna mengevaluasi apakah rencana aktivitas harian mereka realistis berdasarkan waktu, durasi, prioritas, konflik jadwal, kepadatan aktivitas, dan waktu istirahat.

---

## 🌟 Fitur Utama

1. **Natural Language Plan Input**: Pengguna cukup mengetikkan rencana dalam bahasa sehari-hari tanpa harus mengisi tabel jadwal manual.
2. **AI Plan Analysis (Structured JSON)**:
   - Status kelayakan: **Realistis**, **Perlu Penyesuaian**, **Berisiko Terlalu Padat**
   - Feasibility Score (0–100)
   - Ekstraksi Timeline aktivitas (jam mulai, selesai, durasi)
   - Deteksi konflik waktu (tumpang tindih)
   - Deteksi risiko kepadatan & waktu tidur
   - Rekomendasi penyesuaian alternatif
   - Catatan informasi penting yang belum tersedia
3. **Preset 3 Test Cases**: 1-click test cases langsung sesuai panduan tugas.
4. **Riwayat Analisis (LocalStorage)**: Tersimpan otomatis di browser dengan fitur filter, hapus, dan lihat ulang.
5. **Dukungan Model Fleksibel**: Google Gemini, OpenAI, Groq, atau mode bawaan cerdas tanpa API key.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Bootstrap 5 + SCSS + Custom Slate/Indigo Design System
- **Icons**: Lucide React + Bootstrap Icons
- **AI Integration**: Structured Prompting dengan output JSON valid

---

## 🚀 Cara Menjalankan

1. **Install dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Lingkungan (Opsional)**:
   Salin `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Isi `AI_API_KEY` (misalnya API key dari [Google AI Studio](https://aistudio.google.com/)).

3. **Jalankan server development**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🧪 Evaluasi 3 Test Case Bawaan

| Test Case | Contoh Input | Expected Result |
|---|---|---|
| **1. Konflik Jelas** | `Kuliah 08.00-12.00. Kerja 11.00-15.00.` | AI mendeteksi bentrok pukul 11.00–12.00 (High severity). |
| **2. Jadwal Padat** | `Senin kuliah 08.00–12.00, kerja 13.00–17.00, gym 18.00–20.00, tugas 20.00–23.00, belajar 23.00–01.00.` | Status **Berisiko Terlalu Padat**, mendeteksi jam tidur berkurang dan tanpa jeda istirahat. |
| **3. Jadwal Seimbang** | `Kuliah 08.00-12.00. Istirahat 12.00-13.00. Tugas 14.00-16.00. Olahraga 17.00-18.00.` | Status **Realistis**, tidak ada konflik. |
