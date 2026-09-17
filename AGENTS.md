# AGENTS.md — Apple-Style Productivity Design System

Dokumen ini adalah panduan wajib bagi AI agent (Claude Code, Cursor, Copilot, dll) saat menulis atau mengubah UI di proyek ini. Tujuannya: menghasilkan tampilan bernuansa **produktivitas ala Apple** — tenang, presisi, banyak whitespace, hierarki tipografi yang jelas, dan interaksi yang halus tanpa berlebihan. Pikirkan referensi: Apple Notes, Reminders, Freeform, Settings, dan halaman produk apple.com.

Stack: **Next.js + Tailwind CSS**. Semua aturan di bawah harus diterapkan lewat `tailwind.config` dan konvensi class, bukan CSS ad-hoc yang tersebar.

---

## 1. Prinsip Inti

1. **Clarity over decoration** — Setiap elemen visual harus punya fungsi. Tidak ada gradient, shadow, atau border tanpa alasan.
2. **Depth via layering, bukan warna** — Kedalaman dibuat lewat blur (`backdrop-blur`), transparansi tipis, dan shadow lembut — bukan warna kontras keras.
3. **Consistency di seluruh scale** — Satu unit spacing, satu skala tipografi, satu set radius dipakai konsisten di semua komponen.
4. **Motion yang bermakna** — Animasi hanya untuk merespons aksi pengguna (buka/tutup, konfirmasi, transisi state), bukan hiasan otomatis di setiap elemen saat load.
5. **Konten dulu, chrome kemudian** — UI harus terasa lapang; biarkan konten (teks, data, daftar tugas) menjadi fokus utama, bukan card dan border di sekitarnya.

---

## 2. Warna

Gunakan sistem warna netral + satu accent, dengan dukungan light/dark mode penuh (Apple selalu punya keduanya).

### Token dasar (`tailwind.config.ts` → `theme.extend.colors`)

```js
colors: {
  // Netral — dasar dari semua UI
  canvas: {
    light: '#FFFFFF',
    DEFAULT: '#F5F5F7',   // background khas apple.com / macOS
    dark: '#000000',
    darkElevated: '#1C1C1E', // dark mode surface (iOS/macOS system gray 6)
  },
  ink: {
    DEFAULT: '#1D1D1F',   // teks utama (bukan hitam pekat #000)
    secondary: '#6E6E73', // teks sekunder / caption
    tertiary: '#86868B',
    inverted: '#F5F5F7',
  },
  separator: {
    light: 'rgba(0,0,0,0.08)',
    dark: 'rgba(255,255,255,0.12)',
  },
  // Accent tunggal — pilih satu, jangan campur banyak warna brand
  accent: {
    DEFAULT: '#0071E3',   // Apple blue
    hover: '#0077ED',
    subtle: '#E8F0FE',
  },
  // Semantic (secukupnya, jangan warna-warni)
  success: '#34C759',
  warning: '#FF9F0A',
  danger: '#FF3B30',
}
```

**Aturan pemakaian:**
- Background utama: `bg-canvas` (light) / `dark:bg-black`.
- Card/panel: sedikit lebih terang dari background, bukan putih polos di atas putih — pakai `bg-white/70 backdrop-blur-xl` untuk efek "frosted glass" khas macOS.
- Jangan pakai warna hitam pekat `#000000` untuk teks — selalu `ink` (`#1D1D1F`).
- Satu accent color untuk seluruh aksi utama (tombol primer, link, toggle aktif). Jangan tambah warna brand kedua.

---

## 3. Tipografi

Apple menggunakan **SF Pro**, tapi itu berlisensi Apple. Untuk web, gunakan fallback yang paling dekat secara visual:

```js
fontFamily: {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"SF Pro Display"',
    '"SF Pro Text"',
    'Inter',       // fallback terbaik jika bukan device Apple
    'system-ui',
    'sans-serif',
  ],
}
```

> Jika ingin konsistensi lintas platform (Windows/Android), gunakan **Inter** sebagai font utama — bentuknya paling dekat dengan geometri SF Pro dan gratis.

### Skala tipografi (dipakai sebagai utility class kustom, bukan `text-lg` acak)

| Role         | Size / Line-height | Weight | Tailwind class contoh |
|---           |---                  |---     |---|
| Display      | 56px / 1.05         | 700    | `text-[56px] leading-[1.05] font-bold tracking-tight` |
| Title 1      | 34px / 1.1          | 700    | `text-[34px] leading-[1.1] font-bold tracking-tight` |
| Title 2      | 24px / 1.2          | 600    | `text-2xl leading-tight font-semibold` |
| Title 3      | 20px / 1.3          | 600    | `text-xl leading-snug font-semibold` |
| Body         | 17px / 1.5          | 400    | `text-[17px] leading-relaxed` |
| Callout      | 15px / 1.4          | 400    | `text-[15px] leading-normal` |
| Caption      | 13px / 1.3          | 400    | `text-[13px] text-ink-secondary` |

**Aturan:**
- Letter-spacing sedikit negatif (`tracking-tight`) untuk heading besar — ciri khas SF Pro Display.
- Jangan gunakan huruf kapital semua (`uppercase`) untuk label — Apple jarang memakainya di produktivitas app.
- Maksimal 2 bobot font per halaman (mis. regular + semibold). Hindari 4–5 weight sekaligus.
- Lebar baris teks body maksimal ~60–70 karakter (`max-w-prose` atau `max-w-[600px]`).

---

## 4. Spacing & Grid

Apple menggunakan grid 8pt. Terapkan lewat `spacing` scale Tailwind (kelipatan 4, tapi biasakan pakai kelipatan 8: `p-2`(8px), `p-4`(16px), `p-6`(24px), `p-8`(32px), `p-12`(48px), `p-16`(64px)).

```js
spacing: {
  '18': '4.5rem',
  '22': '5.5rem',
}
```

**Aturan layout:**
- Container utama: `max-w-6xl mx-auto px-6 md:px-10`.
- Jarak antar-section besar: `py-24` atau `py-32` di desktop — Apple sangat generous dengan whitespace vertikal.
- Jarak antar elemen dalam card: konsisten `gap-4` atau `gap-6`, jangan campur nilai custom di tiap tempat.

---

## 5. Radius, Border, Shadow

```js
borderRadius: {
  sm: '8px',
  DEFAULT: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px', // untuk pill button/badge
},
boxShadow: {
  card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
  elevated: '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.1)',
  focus: '0 0 0 4px rgba(0,113,227,0.25)', // ring accent saat fokus
}
```

**Aturan:**
- Radius konsisten per "tier": card besar → `rounded-2xl` (20px), tombol/input → `rounded-xl` (16px) atau `rounded-lg`, badge/pill → `rounded-full`.
- Shadow selalu lembut dan menyebar (soft, diffused) — hindari shadow tajam/gelap.
- Border tipis (`border border-separator-light dark:border-separator-dark`) lebih sering dipakai daripada shadow tebal untuk memisahkan elemen.

---

## 6. Komponen Kunci

### Card / Panel
```html
<div class="rounded-2xl bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl
            border border-black/5 dark:border-white/10
            shadow-card p-6">
  ...
</div>
```

### Tombol Primer
```html
<button class="rounded-full bg-accent hover:bg-accent-hover text-white
               text-[15px] font-medium px-5 py-2.5
               transition-colors duration-200
               focus-visible:ring-4 focus-visible:ring-accent/25 outline-none">
  Simpan Perubahan
</button>
```

### Tombol Sekunder
```html
<button class="rounded-full bg-black/[0.04] hover:bg-black/[0.08]
               dark:bg-white/10 dark:hover:bg-white/15
               text-ink dark:text-white text-[15px] font-medium px-5 py-2.5
               transition-colors duration-200">
  Batal
</button>
```

### Navbar (frosted, sticky khas apple.com)
```html
<nav class="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70
            border-b border-black/5 dark:border-white/10">
  ...
</nav>
```

### Sidebar (khas app produktivitas macOS — Notes/Reminders)
- Background sedikit beda dari konten utama: `bg-canvas dark:bg-[#1C1C1E]`.
- Item aktif: `bg-accent/10 text-accent rounded-lg`, bukan border tebal.

---

## 7. Motion

```js
transitionTimingFunction: {
  apple: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // ease standar Apple
}
```

**Aturan:**
- Durasi singkat: `duration-150` sampai `duration-300` untuk hover/klik; `duration-300`–`duration-500` untuk modal/panel muncul.
- Gunakan `transition-all` secara hati-hati — lebih baik spesifik (`transition-colors`, `transition-transform`) agar performa tetap halus.
- Modal/sheet muncul dengan scale + fade, bukan slide kasar:
  ```
  data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95
  data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95
  ```
- Hormati `prefers-reduced-motion` — matikan animasi non-esensial jika user mengaktifkan setting ini.
- Jangan beri animasi fade-in terpisah di setiap card saat scroll (efek "stagger" yang berlebihan) — ini justru bukan gaya Apple, cenderung terlalu ramai untuk app produktivitas.

---

## 8. Dark Mode

Wajib mendukung dark mode penuh dari awal (`darkMode: 'class'` di `tailwind.config.ts`), bukan tambahan belakangan:
- Background: `bg-white dark:bg-black`
- Surface/card: `bg-white dark:bg-[#1C1C1E]`
- Teks: `text-ink dark:text-white`
- Border/separator: `border-black/5 dark:border-white/10`

---

## 9. Aksesibilitas (non-negotiable)

- Semua elemen interaktif punya `focus-visible:ring-*` yang terlihat jelas.
- Kontras teks minimal WCAG AA (4.5:1 untuk body text).
- Target sentuh minimal 44×44px untuk tombol/ikon (standar Apple HIG).
- Semua ikon aksi punya `aria-label` jika tanpa teks.

---

## 10. Checklist untuk Agent Sebelum Commit UI

- [ ] Tidak ada warna accent kedua selain `accent` yang didefinisikan.
- [ ] Semua radius/shadow/spacing memakai token dari `tailwind.config`, bukan nilai arbitrary baru.
- [ ] Dark mode sudah dicek untuk komponen yang baru dibuat.
- [ ] Tidak ada animasi otomatis berlebihan (stagger fade-in di banyak card).
- [ ] Line-length teks body tidak melebihi ~70 karakter.
- [ ] Fokus keyboard terlihat jelas pada semua elemen interaktif baru.
- [ ] Whitespace antar-section cukup lapang (bukan padat/rapat seperti dashboard SaaS generik).

---

## 11. Yang Harus Dihindari

- ❌ Card dengan `shadow-lg` gelap + border tebal berwarna.
- ❌ Gradient warna-warni sebagai dekorasi background.
- ❌ Font tebal di semua teks (over-bolding).
- ❌ Badge/label serba `UPPERCASE` dengan tracking lebar di setiap tempat.
- ❌ Banyak warna brand berbeda untuk status yang sebenarnya bisa pakai satu accent + semantic color secukupnya.
- ❌ Layout padat tanpa margin — beri elemen ruang untuk "bernapas".