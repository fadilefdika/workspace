# AGENTS.md — Personal Workspace (Modul 1: Job Tracker)

Dokumen ini adalah panduan teknis untuk AI coding agent (OpenCode / Claude Code) saat membangun, mengedit, atau melanjutkan proyek **Personal Workspace**. Baca seluruh dokumen sebelum membuat/mengubah file apa pun.

## 0. Konteks: Ini Bagian dari Workspace yang Lebih Besar

Repo ini **bukan** aplikasi job tracker berdiri sendiri. Ini adalah **satu workspace pribadi** — satu proses backend, satu frontend, satu `docker-compose.yml` — yang akan berisi beberapa modul, disusun sebagai **modular monolith**: satu aplikasi yang dijalankan, tapi kode dan datanya dipisah rapi per modul.

| Modul               | Status                                                 | Halaman utama                 |
| ------------------- | ------------------------------------------------------ | ----------------------------- |
| **Job Tracker**     | Dikerjakan sekarang (Section 1-11 di bawah)            | `/applications`, `/companies` |
| **Content Planner** | Selesai (MVP)                                          | `/content`                    |
| **Reading Digest**  | Belum dispek — artikel + glossary dari diskusi Threads | `/digest` (rencana)           |

**Prinsip arsitektur workspace ini:**

- **Satu backend Express, satu frontend Next.js, satu `docker-compose.yml`.** Modul baru tidak bikin repo/service baru — cukup folder modul baru di dalam struktur yang sama.
- **Kode dipisah per modul (vertical slice), bukan per layer.** Setiap modul punya folder sendiri berisi route, controller, service, dan schema Prisma miliknya sendiri — bukan semua controller dicampur di satu folder `controllers/` lintas modul. Lihat Section 3.
- **Data terisolasi penuh per modul.** Satu container PostgreSQL, tapi **3 database logis terpisah** (bukan 1 database dibagi-bagi tabel) — job tracker, content planner, dan reading digest tidak saling bisa `JOIN` satu sama lain di level SQL. Kalau nanti butuh ringkasan lintas modul, itu digabung di kode backend (beberapa query, digabung di JS), bukan lewat query SQL gabungan. Lihat Section 4 & 6.
- **Frontend punya satu `Sidebar` global** yang menghubungkan ke semua modul yang sudah ada, dibagi per kategori (mis. Find Job & Content).
- **Satu bahasa desain** untuk seluruh workspace — lihat Section 1.

Section 1-11 di bawah ini fokus ke spesifikasi **Job Tracker** sebagai modul pertama yang dikerjakan. Saat Content Planner atau Reading Digest mulai digarap, dokumen ini ditambah section serupa untuk modul tersebut — bukan dokumen terpisah.

## 1. Ringkasan Modul: Job Tracker

Fitur untuk melacak lamaran kerja (job application tracker) dan menyimpan daftar perusahaan incaran, diakses lewat REST API, dideploy sebagai bagian dari workspace tunggal ke VPS via Docker Compose.

**Prinsip desain (berlaku untuk seluruh workspace, bukan cuma modul ini):**

- Gaya bersih dan profesional, terinspirasi desain Apple — banyak whitespace, tipografi jadi elemen utama, permukaan flat (TIDAK ada glassmorphism, blur, gradient, atau efek dekoratif lain).
- Ikon dipakai seminimal mungkin, hanya kalau benar-benar membantu pemahaman (mis. ikon panah untuk navigasi) — bukan ikon di setiap label sebagai hiasan.
- Warna dipakai secukupnya dan hanya untuk makna: **merah/kuning/hijau untuk status atau progres** (mis. status lamaran, fit score). Di luar itu, palet netral (hitam/putih/abu-abu).
- **Satu tema saja (terang/light).** Tidak ada toggle dark/light mode — ini mengurangi kompleksitas UI tanpa banyak kehilangan manfaat untuk aplikasi personal.

## 2. Tech Stack

| Layer          | Teknologi                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------- |
| Backend        | Node.js + Express + TypeScript                                                              |
| ORM            | Prisma (satu Prisma Client terpisah per modul)                                              |
| Database       | PostgreSQL — 1 container, 3 database terisolasi                                             |
| Frontend       | Next.js 14+ (App Router) + TypeScript + Tailwind CSS                                        |
| Icons          | lucide-react (dipakai minim, lihat Section 1)                                               |
| Charts         | recharts                                                                                    |
| Container      | Docker + Docker Compose                                                                     |
| Target hosting | VPS milik sendiri, diakses lewat Tailscale (bukan expose publik langsung — lihat Section 9) |

**Non-negotiable:**

- Frontend TIDAK mengakses Prisma/database secara langsung. Semua data lewat HTTP request (`fetch`) ke REST API di `api/`. Ini proyek latihan REST API, jadi jangan pakai Next.js Server Actions/Route Handlers sebagai pengganti backend.
- Satu `api/` dan satu `web/` untuk seluruh workspace. Modul baru = folder modul baru di dalam struktur yang sama, bukan project baru.
- Tiap modul punya database Postgres sendiri (lihat Section 4) — jangan campur tabel lintas modul dalam satu database.

## 3. Struktur Repo (Monorepo, modular per-modul)

```
personal-workspace/
├── api/
│   ├── src/
│   │   ├── modules/
│   │   │   └── job-tracker/                  # ── Semua kode Job Tracker hidup di sini ──
│   │   │       ├── routes/
│   │   │       │   ├── applications.routes.ts
│   │   │       │   └── companies.routes.ts
│   │   │       ├── controllers/
│   │   │       │   ├── applications.controller.ts
│   │   │       │   └── companies.controller.ts
│   │   │       ├── services/                 # business logic, terpisah dari controller
│   │   │       ├── prisma/
│   │   │       │   ├── schema.prisma         # HANYA model Job Tracker
│   │   │       │   ├── seed.ts
│   │   │       │   └── migrations/
│   │   │       └── lib/
│   │   │           └── prisma-client.ts      # Prisma Client khusus modul ini, koneksi ke DB job tracker
│   │   │       # (nanti) modules/content-planner/... struktur sama persis
│   │   │       # (nanti) modules/reading-digest/... struktur sama persis
│   │   ├── shared/
│   │   │   ├── middlewares/                  # error handler, validasi request — dipakai semua modul
│   │   │   └── utils/
│   │   │       └── slug.ts                   # generateSlug() dengan collision handling
│   │   └── index.ts                          # entry point Express — mount router tiap modul di sini
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                      # Dashboard workspace (ringkasan lintas modul)
│   │   │   ├── applications/                 # ── Modul: Job Tracker ──
│   │   │   │   ├── page.tsx                  # List + Kanban toggle
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx              # Detail + edit + fit score + interview stages
│   │   │   │       └── prep/page.tsx         # Interview prep checklist per aplikasi
│   │   │   ├── companies/                    # ── Modul: Job Tracker ──
│   │   │   │   ├── page.tsx                  # Grid daftar perusahaan
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [slug]/page.tsx           # Detail + deal-breakers + riwayat lamaran
│   │   │   ├── content/                      # ── Modul: Content Planner (menyusul) ──
│   │   │   └── digest/                       # ── Modul: Reading Digest (menyusul) ──
│   │   ├── components/
│   │   │   ├── layout/Sidebar.tsx            # Navigasi sidebar global ke semua modul
│   │   │   ├── dashboard/                    # StatCards, FunnelChart, FollowUpReminders
│   │   │   ├── applications/                 # FitScoreBadge, InterviewStageList, FollowUpDraftModal
│   │   │   └── companies/                    # DealBreakerTags
│   │   ├── lib/
│   │   │   └── api-client.ts                 # wrapper fetch ke REST API (dipakai semua modul)
│   │   └── types/                            # shared TS types (bisa disinkron manual dg api/)
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml         # postgres (1 container, 3 database) + api + web
├── .env.example
└── AGENTS.md
```

**Kenapa `schema.prisma` per modul, bukan satu file gabungan:** karena tiap modul konek ke database Postgres yang berbeda (lihat Section 4), Prisma butuh satu schema + satu Prisma Client per database. Ini otomatis mengikuti keputusan isolasi data — bukan kerumitan tambahan yang sengaja dicari.

## 4. Data Model (Prisma Schema — Job Tracker)

Kolom DB pakai `snake_case`, field Prisma Client pakai `camelCase` via `@map()`. File ini ada di `api/src/modules/job-tracker/prisma/schema.prisma`, terpisah dari schema modul lain.

**Soft delete:** semua model punya kolom `deletedAt`. `DELETE` di REST API mengisi kolom ini (bukan hapus baris), dan semua query `GET`/list secara default filter `deletedAt: null` di service layer.

```prisma
model Company {
  id              String        @id @default(cuid())
  name            String
  slug            String        @unique   // lihat catatan slug unik + soft delete di bawah
  industry        String?
  location        String?
  websiteUrl      String?       @map("website_url")
  careerPageUrl   String?       @map("career_page_url")
  priority        Priority      @default(MEDIUM)
  researchNotes   String?       @map("research_notes")
  dealBreakers    String[]      @map("deal_breakers")   // mis. ["butuh S2", "wajib bahasa Mandarin native"]
  applications    Application[]
  deletedAt       DateTime?     @map("deleted_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  @@map("companies")
}

model Application {
  id                  String            @id @default(cuid())
  companyId           String            @map("company_id")
  company             Company           @relation(fields: [companyId], references: [id])
  position            String
  appliedDate         DateTime          @map("applied_date")
  source              ApplicationSource
  applicationLink     String?           @map("application_link")
  status              ApplicationStatus @default(APPLIED)
  statusUpdatedAt     DateTime          @default(now()) @map("status_updated_at")
  contactPerson       String?           @map("contact_person")
  contactInfo         String?           @map("contact_info")
  nextFollowUp        DateTime?         @map("next_follow_up")
  followUpCount       Int               @default(0) @map("follow_up_count")   // max 2x, dicek di service layer
  notes               String?
  salaryRange         String?           @map("salary_range")
  attachmentUrl       String?           @map("attachment_url")
  archivedJobDescription String?        @map("archived_job_description")     // snapshot teks lowongan saat apply
  fitScore            Int?              @map("fit_score")                    // 0-100, diisi manual atau via AI assist
  fitNotes            String?           @map("fit_notes")                    // alasan skor: kecocokan skill, lokasi, dst
  interviewStages      InterviewStage[]
  deletedAt           DateTime?         @map("deleted_at")
  createdAt           DateTime          @default(now()) @map("created_at")
  updatedAt           DateTime          @updatedAt @map("updated_at")

  @@map("applications")
}

model InterviewStage {
  id             String        @id @default(cuid())
  applicationId  String        @map("application_id")
  application    Application   @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  stageName      String        @map("stage_name")     // "HR Screening", "Technical Interview", "Final Round"
  scheduledAt    DateTime?     @map("scheduled_at")
  feedback       String?                              // catatan hasil/feedback ronde ini
  outcome        StageOutcome  @default(PENDING)
  deletedAt      DateTime?     @map("deleted_at")
  createdAt      DateTime      @default(now()) @map("created_at")

  @@map("interview_stages")
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

enum ApplicationSource {
  LINKEDIN
  JOBSTREET
  GLINTS
  COMPANY_WEBSITE
  REFERRAL
  CAREER_FAIR
  OTHER
}

enum ApplicationStatus {
  APPLIED
  SCREENING
  INTERVIEW_HR
  INTERVIEW_USER
  OFFER
  ACCEPTED
  REJECTED
  GHOSTED
}

enum StageOutcome {
  PENDING
  PASSED
  FAILED
}
```

**Aturan penting:**

- `slug` di `Company` WAJIB unik. Gunakan `utils/slug.ts` → jika slug sudah ada, tambahkan suffix angka (`chint-indonesia`, `chint-indonesia-2`, dst).
- **Slug + soft delete:** constraint `@unique` bawaan Prisma tetap menghitung baris yang sudah di-soft-delete sebagai "slug terpakai". Kalau ini masalah buatmu (mis. mau bisa pakai ulang nama company yang sudah dihapus), butuh **partial unique index** lewat raw SQL migration (`CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL`) — tandai sebagai catatan, kerjakan kalau kasusnya benar-benar muncul, jangan over-engineer di awal.
- Setiap perubahan `status` pada `Application` HARUS meng-update `statusUpdatedAt` (lakukan di service layer, jangan andalkan client).
- `archivedJobDescription` diisi otomatis saat `Application` dibuat (copy dari input `applicationLink`/paste manual) — jangan fetch ulang link setelahnya, karena listing bisa berubah/hilang.
- `fitScore`/`fitNotes` opsional saat create; bisa diisi manual dulu, endpoint AI-assist untuk generate otomatis termasuk fase lanjut (lihat Section 10).
- `dealBreakers` di `Company` murni informatif di MVP (ditampilkan sebagai tag), tanpa auto-reject otomatis — validasi keputusan tetap di tangan user, bukan sistem.
- `followUpCount` WAJIB dicek di service layer sebelum draft follow-up baru dibuat: tolak (400) jika sudah mencapai 2.
- Semua query list/detail default filter `deletedAt: null` di service layer — jangan andalkan frontend untuk menyaring data terhapus.
- Migrasi database WAJIB pakai `npx prisma migrate dev --name <deskripsi>`, jangan pakai `db push` di proyek ini.

## 5. Kontrak REST API

Base path: `/api/v1`

### Applications

| Method | Endpoint            | Body / Query                                                                                       | Response                                                                                                                                  |
| ------ | ------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/applications`     | query: `status`, `companyId`, `source`, `sort`, `page` (default 1), `limit` (default 20, maks 100) | `200` array of Application (include `company`), hanya yang `deletedAt: null`. Header `X-Total-Count`, `X-Total-Pages` untuk info paginasi |
| POST   | `/applications`     | JSON body sesuai field model                                                                       | `201` Application baru                                                                                                                    |
| GET    | `/applications/:id` | —                                                                                                  | `200` Application, `404` jika tidak ada/sudah dihapus                                                                                     |
| PATCH  | `/applications/:id` | field yang diubah                                                                                  | `200` Application terupdate                                                                                                               |
| DELETE | `/applications/:id` | —                                                                                                  | `204` no content — soft delete, isi `deletedAt`, bukan hapus baris                                                                        |

### Interview Stages (nested di bawah Applications)

| Method | Endpoint                            | Body / Query                         | Response                       |
| ------ | ----------------------------------- | ------------------------------------ | ------------------------------ |
| GET    | `/applications/:id/stages`          | —                                    | `200` array InterviewStage     |
| POST   | `/applications/:id/stages`          | `stageName`, `scheduledAt?`          | `201` InterviewStage baru      |
| PATCH  | `/applications/:id/stages/:stageId` | `feedback`, `outcome`, `scheduledAt` | `200` InterviewStage terupdate |

### Follow-up Draft

| Method | Endpoint                            | Body / Query | Response                                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ----------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/applications/:id/follow-up-draft` | —            | `200` `{ draftText: string }` — generate teks draft follow-up (template statis di MVP, AI-assist di fase lanjut). **Tidak pernah mengirim apa pun**, cuma generate teks untuk di-copy manual. `400` jika `followUpCount` sudah 2. Endpoint ini TIDAK increment `followUpCount` sendiri — increment terjadi lewat `PATCH /applications/:id` saat user konfirmasi draft terpakai. |

### Companies

| Method | Endpoint                        | Body / Query                                                                                    | Response                                                                                                                                        |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/companies`                    | query: `industry`, `location`, `priority`, `page` (default 1), `limit` (default 20, maks 100)   | `200` array of Company (include jumlah applications), hanya yang `deletedAt: null`. Header `X-Total-Count`, `X-Total-Pages` untuk info paginasi |
| POST   | `/companies`                    | `name`, `industry?`, `location?`, `dealBreakers?`, dll — `slug` di-generate otomatis di backend | `201` Company baru                                                                                                                              |
| GET    | `/companies/:slug`              | —                                                                                               | `200` Company detail, `404` jika tidak ada/sudah dihapus                                                                                        |
| PATCH  | `/companies/:slug`              | field yang diubah                                                                               | `200` Company terupdate                                                                                                                         |
| DELETE | `/companies/:slug`              | —                                                                                               | `204` no content — soft delete                                                                                                                  |
| GET    | `/companies/:slug/applications` | —                                                                                               | `200` array Application milik company ini (nested resource)                                                                                     |

### Dashboard / Insights

| Method | Endpoint                | Body / Query | Response                                                                                         |
| ------ | ----------------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| GET    | `/dashboard/summary`    | —            | `200` `{ totalApplied, inProgress, offers, rejected, responseRate }`                             |
| GET    | `/dashboard/funnel`     | —            | `200` `{ applied, screening, interview, offer, accepted }` — jumlah per tahap untuk funnel chart |
| GET    | `/dashboard/monthly`    | —            | `200` array `{ month, count }` — untuk chart aktivitas bulanan                                   |
| GET    | `/dashboard/follow-ups` | —            | `200` array Application dengan `nextFollowUp` sudah lewat/mendekati (7 hari)                     |

> Catatan: `/dashboard/*` di atas khusus data Job Tracker (dari database job tracker). Dashboard ringkasan lintas modul (Section 0) tidak bisa query gabungan lintas database — kalau nanti dibuat, backend akan panggil endpoint tiap modul secara terpisah lalu gabung hasilnya.

### Konvensi Response

- Sukses: langsung kembalikan data (bukan dibungkus `{ data: ... }`) supaya sederhana untuk latihan.
- Error: format konsisten `{ "error": { "message": string, "code": string } }` dengan HTTP status code yang sesuai (400 validasi, 404 not found, 500 server error).
- Semua request/response body JSON. Validasi input pakai `zod` di layer middleware sebelum masuk controller.
- **Paginasi**: endpoint list (`GET /applications`, `GET /companies`, dan endpoint list modul lain nanti) WAJIB mendukung `?page` & `?limit`, default `page=1` `limit=20`, dan menolak (400) kalau `limit` > 100. Info total data ada di response header (`X-Total-Count`, `X-Total-Pages`), bukan membungkus body — supaya body tetap array polos sesuai konvensi di atas.
- Konvensi ini berlaku untuk SEMUA modul, bukan cuma Job Tracker.

## 6. Environment Variables

`.env.example` (di root, dipakai Docker Compose):

```
# Database — satu container, tiga database logis terisolasi
POSTGRES_USER=workspace
POSTGRES_PASSWORD=changeme
# Database dibuat lewat init script Postgres (lihat docker-compose.yml), bukan otomatis dari POSTGRES_DB tunggal
DATABASE_URL_JOB_TRACKER=postgresql://workspace:changeme@postgres:5432/job_tracker
# (nanti) DATABASE_URL_CONTENT_PLANNER=postgresql://workspace:changeme@postgres:5432/content_planner
# (nanti) DATABASE_URL_READING_DIGEST=postgresql://workspace:changeme@postgres:5432/reading_digest

# API
API_PORT=4000

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Di `docker-compose.yml`, service `postgres` perlu init script (mis. `docker-entrypoint-initdb.d/init-databases.sql`) yang membuat ketiga database saat container pertama kali dibuat, karena image resmi Postgres cuma otomatis bikin 1 database dari `POSTGRES_DB`.

## 7. Data Seed Awal

**⚠️ Seed HANYA untuk environment development.** `seed.ts` WAJIB diawali guard berikut sebelum melakukan apa pun:

```ts
if (process.env.NODE_ENV === "production") {
  console.error(
    "❌ Seed script tidak boleh dijalankan di production. Dibatalkan.",
  );
  process.exit(1);
}
```

`npx prisma db seed` sendiri tidak menghapus data yang sudah ada (beda dengan `prisma migrate reset` yang memang mereset seluruh database) — tapi guard di atas tetap wajib ada sebagai lapisan pengaman kalau perintah ini pernah tidak sengaja dijalankan mengarah ke `DATABASE_URL_JOB_TRACKER` production.

`api/src/modules/job-tracker/prisma/seed.ts` memasukkan 9 perusahaan berikut (slug di-generate dari nama, field lain boleh placeholder kosong dulu — diisi manual belakangan lewat UI):

1. Chint Indonesia
2. Chin Nurinda Electric
3. Sinergi Giat Perkasa
4. NR Electric Jakarta
5. YPIT
6. YPTT
7. Huawei
8. Indonesia Morowali Industrial Park (IMIP)
9. CGS International

## 8. Frontend Conventions

- `src/lib/api-client.ts`: satu wrapper `fetch` terpusat (base URL dari `NEXT_PUBLIC_API_URL`, handle error JSON, typed response). Semua komponen fetch data lewat sini, jangan `fetch()` mentah tersebar di komponen. Berlaku untuk semua modul.
- **Desain**: flat, banyak whitespace, tipografi sebagai elemen utama. Tidak ada blur/gradient/glassmorphism. Ikon minim, dipakai hanya saat benar-benar membantu. Satu tema terang saja, tidak ada dark mode.
- **Warna status** (satu-satunya tempat warna dipakai bebas — merah/kuning/hijau untuk makna, sisanya netral):
  - `APPLIED` → abu-abu netral
  - `SCREENING` / `INTERVIEW_*` → kuning
  - `OFFER` / `ACCEPTED` → hijau
  - `REJECTED` / `GHOSTED` → merah
- Chart pakai `recharts`, styling ikut Tailwind design token (jangan inline hex, pakai CSS variable/Tailwind class). Funnel chart di dashboard pakai data dari `/dashboard/funnel`.
- Form tambah/edit gunakan modal atau halaman terpisah (`/new`, `/[id]`) — konsisten pilih salah satu pola untuk applications dan companies (dan modul berikutnya).
- `FitScoreBadge`: tampilkan `fitScore` sebagai badge angka + warna (0-40 merah, 41-70 kuning, 71-100 hijau); klik untuk lihat `fitNotes`.
- `DealBreakerTags`: render `dealBreakers` company sebagai tag/chip di halaman detail perusahaan — murni informatif, TIDAK memblokir apa pun di UI.
- `FollowUpDraftModal`: tombol "Generate Follow-up" di detail aplikasi memanggil `POST /applications/:id/follow-up-draft`, tampilkan teks di textarea yang bisa di-copy manual, tombol disabled kalau `followUpCount >= 2`.
- `InterviewStageList`: di halaman `/applications/[id]`, render timeline tahap interview (nama, jadwal, outcome, feedback) dengan tombol tambah tahap baru.
- `Sidebar.tsx`: navigasi utama di sisi kiri layar, dikelompokkan per kategori modul (mis. "Find Job", "Content").
- Aksi hapus di UI (tombol "Hapus") tetap terasa seperti hapus biasa bagi user — tidak perlu ada UI khusus "pulihkan data" di MVP, soft delete di backend murni untuk keamanan data, bukan fitur user-facing dulu.

## 9. Docker & Deployment

- `docker-compose.yml` berisi 3 service: `postgres` (dengan init script 3-database), `api`, `web` — satu set untuk seluruh workspace.
- Volume terpisah untuk: data Postgres (persist), dan folder upload attachment CV (`api/uploads` di-mount sebagai volume supaya tidak hilang saat redeploy).
- Restart policy semua service: `unless-stopped`.
- Backup: cron job `pg_dump` per database (3x, karena 3 database terpisah) terjadwal — di luar scope kode aplikasi, dicatat sebagai operational task di VPS.

**Akses ke aplikasi: lewat Tailscale, bukan port forwarding publik.**

Port forwarding saja tidak memberi keamanan — itu cuma soal routing jaringan, bukan enkripsi atau otentikasi. Untuk aplikasi personal seperti ini, pendekatan yang lebih simpel dan lebih aman:

- Service `api` dan `web` di VPS **tidak** bind ke `0.0.0.0` publik, cukup ke `localhost`/network internal Docker.
- Install [Tailscale](https://tailscale.com) di VPS dan di device pribadi (HP, laptop) — ini bikin jaringan privat terenkripsi antar device yang sudah kamu daftarkan, tanpa perlu buka port ke internet publik sama sekali.
- Akses aplikasi lewat IP Tailscale VPS (mis. `http://100.x.x.x:3000`) dari device manapun yang sudah terhubung ke Tailscale-mu.
- Konsekuensi: tidak perlu setup reverse proxy + TLS + sistem login terpisah untuk MVP, karena aplikasi memang tidak pernah terekspos ke internet publik. Kalau nanti kamu mau share akses ke orang lain di luar device pribadimu, baru saat itu perlu dipikirkan ulang (reverse proxy + TLS + auth publik).

## 10. Roadmap Implementasi (urutan kerja untuk agent)

1. **Setup monorepo workspace** — struktur folder modular (Section 3), `package.json` di `api/` & `web/`, `docker-compose.yml` dengan init script 3-database, `.env.example`.
2. **Backend MVP Job Tracker (schema lengkap sejak awal)** — Prisma schema modul job-tracker termasuk `InterviewStage`, `dealBreakers`, `fitScore`, `archivedJobDescription`, `followUpCount`, `deletedAt` di semua model (bukan ditambah belakangan); migration awal; seed script; CRUD `companies` & `applications` dengan soft delete; endpoint `interview-stages` & `follow-up-draft`; error handling middleware.
3. **Frontend MVP Job Tracker** — `api-client.ts`, `Navbar.tsx` global, desain sesuai Section 1 (flat, minim ikon, satu tema), halaman list & form CRUD applications dan companies (termasuk field fit score & deal-breakers di form), routing sesuai Section 3.
4. **Dashboard Job Tracker** — statistik ringkasan, **funnel chart**, monthly chart, reminder follow-up — pakai endpoint `/dashboard/*` dari awal, bukan hitung manual di frontend.
5. **Kanban view** untuk applications.
6. **Interview stages & prep page** — timeline tahap interview di detail aplikasi, halaman `/applications/[id]/prep` (checklist statis dulu: riset perusahaan, siapkan STAR examples, review JD — versi AI-generated masuk fase lanjut).
7. **Follow-up draft** — endpoint + modal, template statis dulu (placeholder `{position}`, `{company}`, `{appliedDate}`), AI-generated draft menyusul di fase lanjut.
8. **Deployment ke VPS** — Dockerfile tiap service, setup Tailscale di VPS, uji akses dari device pribadi, uji end-to-end.
9. **(Selesai)** — spek dan bangun modul Content Planner: folder `modules/content-planner/` baru dengan struktur sama, database baru (`content_planner`), halaman baru di `web/`.
10. **(Setelah itu)** — spek dan bangun modul Reading Digest, termasuk endpoint yang menerima teks utas Threads (dari ekstensi capture / paste manual) dan memanggil LLM untuk menghasilkan artikel + glossary.

**Fase lanjut (di luar MVP, dicatat supaya tidak lupa — jangan dikerjakan otomatis tanpa diminta):**

- AI-assist untuk `fitScore`/`fitNotes` otomatis (kirim job description ke Claude API, dapat skor + alasan).
- AI-generated follow-up draft (bukan template statis).
- Gmail sync untuk deteksi status otomatis dari email masuk.
- Skill gap analysis (`/insights`) — bandingkan profil vs kumpulan job description yang di-track.
- Dashboard ringkasan lintas modul (Job Tracker + Content Planner + Reading Digest dalam satu halaman, digabung di kode karena database terpisah).
- Partial unique index untuk `slug` supaya bisa dipakai ulang setelah company di-soft-delete (kalau kebutuhannya benar-benar muncul).
- Reverse proxy + TLS + auth publik, kalau nanti aplikasi perlu diakses orang lain di luar Tailscale-mu.

## 11. Verification Plan

**Otomatis:**

- `npm run build` di `api/` dan `web/` — pastikan tidak ada error TypeScript.
- `npx prisma migrate dev` & `npx prisma db seed` di modul job-tracker — migrasi & seed berjalan tanpa error, terhubung ke database `job_tracker` (bukan database lain).

**Manual:**

- CRUD penuh Applications & Companies lewat UI, verifikasi lewat REST API langsung (curl/Postman) juga.
- Soft delete: hapus satu Application/Company lewat UI, pastikan tidak muncul lagi di list, tapi barisnya masih ada di database dengan `deleted_at` terisi (cek langsung lewat `psql` atau Prisma Studio).
- Alur perubahan status lamaran (`APPLIED → ... → ACCEPTED/REJECTED/GHOSTED`), pastikan `statusUpdatedAt` ikut ter-update.
- Relasi Company ↔ Application: buat lamaran dari halaman detail company, cek muncul di riwayat.
- Slug collision: tambah 2 company dengan nama mirip, pastikan slug kedua tidak bentrok.
- Reminder follow-up muncul benar di dashboard untuk `nextFollowUp` yang sudah lewat/mendekati.
- Interview stages: tambah beberapa tahap ke satu aplikasi, ubah status/outcome tiap tahap, pastikan urut sesuai `createdAt`.
- Follow-up draft: generate draft 2x lalu coba ke-3 kalinya, pastikan endpoint menolak dengan `400` setelah `followUpCount` mencapai 2.
- Funnel chart & dashboard summary: cocokkan angka yang ditampilkan dengan hitungan manual dari data seed/testing.
- Deal-breaker tags tampil di halaman detail company, tidak memblokir create/edit apa pun.
- Isolasi database: konek langsung ke database `job_tracker` lewat `psql`, pastikan cuma tabel modul ini yang ada di sana (tidak tercampur modul lain begitu modul lain dibangun).
- Akses via Tailscale: dari device yang sudah terhubung ke Tailscale, aplikasi bisa dibuka; dari luar jaringan Tailscale, aplikasi tidak bisa dijangkau sama sekali.
- Desain: cek tidak ada elemen blur/gradient/glassmorphism, tidak ada toggle tema, warna non-status konsisten netral.
- `npm run lint` dan `npm run format:check` lulus tanpa error di `api/` dan `web/`.
- Paginasi: `GET /applications?limit=1` dan `GET /companies?limit=1` mengembalikan 1 item tapi header `X-Total-Count` menunjukkan jumlah total yang benar; `?limit=101` ditolak `400`.
- Seed guard: coba jalankan `NODE_ENV=production npx prisma db seed`, pastikan script menolak jalan dan keluar dengan pesan error, bukan diam-diam mengeksekusi.
- `deploy.sh`: uji di VPS staging/percobaan — matikan sengaja salah satu migrasi (bikin gagal), pastikan script berhenti sebelum `docker compose up -d` (container lama tetap jalan, bukan ter-swap ke kode baru dengan skema lama).

## 12. Code Quality: Linting & Formatting

Berlaku untuk seluruh workspace (`api/` dan `web/`), satu konfigurasi dipakai bersama lewat file di root repo.

- **ESLint** (`@typescript-eslint/recommended`) untuk aturan kode TypeScript, **Prettier** untuk formatting. Pasang `eslint-config-prettier` supaya kedua tool tidak saling bentrok soal aturan format.
- Konfigurasi Prettier (`.prettierrc` di root):
  ```json
  {
    "singleQuote": true,
    "semi": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2
  }
  ```
- Jalankan lint & format check sebagai bagian dari verification plan (Section 11): `npm run lint` dan `npm run format:check` harus lulus tanpa error sebelum dianggap selesai.
- **Fase lanjut** (jangan dikerjakan otomatis tanpa diminta): `husky` + `lint-staged` untuk auto-format saat commit.

## 13. Deployment Flow (Update Aplikasi Setelah Live)

- Alur update: SSH ke VPS (lewat Tailscale) → `git pull` → build image baru → jalankan migrasi Prisma per modul **sebelum** container aktif diganti → swap ke container baru. Dibuat sebagai script `deploy.sh` di root repo supaya konsisten, bukan diketik manual tiap kali:

  ```bash
  #!/usr/bin/env bash
  set -e

  # Tambah nama modul baru di sini begitu modul itu punya schema.prisma sendiri
  MODULES=("job-tracker")

  git pull origin main

  echo "🔨 Build image baru (belum mengganti container yang sedang jalan)..."
  docker compose build api web

  echo "🗄  Menjalankan migrasi Prisma per modul, pakai image baru lewat container sekali-pakai..."
  for module in "${MODULES[@]}"; do
    docker compose run --rm api npx prisma migrate deploy \
      --schema=./src/modules/${module}/prisma/schema.prisma
  done

  echo "🚀 Migrasi selesai, swap ke container baru..."
  docker compose up -d

  docker compose ps
  ```

  **Kenapa urutannya begini (build → migrate → swap), bukan build+swap dulu baru migrate:** kalau container `api` langsung diganti sebelum migrasi jalan, ada jeda di mana kode baru sudah aktif tapi skema database masih lama — request yang masuk di jeda itu bisa error. Dengan `docker compose run --rm` (container sekali-pakai, bukan `exec` ke container yang sedang melayani traffic), migrasi jalan pakai image baru tanpa mengganggu `api` yang lama, dan `api` yang lama baru diganti (`up -d`) setelah migrasi dipastikan sukses. Kalau migrasi gagal, `set -e` menghentikan script sebelum sempat swap — `api` lama tetap jalan, bukan berakhir di kondisi kode baru + skema lama.

- **Fase lanjut** (jangan dikerjakan otomatis tanpa diminta): GitHub Actions untuk build & test otomatis di setiap push. Auto-deploy (lewat Watchtower atau GitHub Actions yang SSH ke VPS) sengaja TIDAK direkomendasikan dulu — untuk project personal, deploy manual yang kamu trigger sendiri memberi kesempatan review sebelum versi baru live, dibanding auto-update yang langsung jalan begitu ada push baru.

## 14. Logging

- Pakai **pino** untuk logging terstruktur di backend (`api/`) — lebih ringan dibanding winston, cukup untuk kebutuhan personal project ini.
- Level log: `error` untuk exception yang tertangkap di error-handling middleware, `warn` untuk kondisi tidak normal tapi tidak fatal (mis. request ditolak validasi), `info` untuk event penting (server start, migrasi selesai). Hindari `console.log` polos untuk hal-hal ini.
- Docker sendiri sudah otomatis menangkap stdout/stderr lewat `docker compose logs -f api` — pino dipakai supaya log yang ditangkap itu terstruktur (level, timestamp, JSON) dan gampang di-filter, bukan cuma teks bebas.
- Format log: pretty-print (`pino-pretty`) saat development, JSON polos saat production (lebih gampang di-parse kalau nanti dikirim ke tool log management, meski itu di luar scope MVP).

---

_Dokumen ini adalah acuan utama untuk AI coding agent, mencakup seluruh workspace (bukan cuma Job Tracker). Jika ada perubahan keputusan arsitektur di tengah development — termasuk saat modul baru mulai digarap — update dokumen ini juga supaya tetap jadi source of truth._

# AGENTS.md — Tambahan (Section 15-22)

> Dokumen ini adalah **addendum** untuk `AGENTS.md` utama. Tempelkan section di bawah ini setelah Section 14 (Logging), atau sisipkan masing-masing ke section terkait (ditandai di judul tiap bagian). Semua keputusan di sini bersifat rekomendasi — validasi dulu sebelum jadi source of truth permanen.

---

## 15. Revisi Keputusan: Isolasi Data Antar Modul (update Section 4 & 6)

**Keputusan awal:** 3 database Postgres terpisah penuh per modul.

**Revisi yang direkomendasikan:** tetap isolasi logis penuh (tidak ada JOIN lintas modul), tapi lewat **Postgres schema**, bukan database terpisah — dalam satu database, satu `DATABASE_URL`.

**Kenapa direvisi:** untuk aplikasi single-user personal, manfaat isolasi-per-database (keamanan multi-tenant, scaling independen, mencegah tim lain nyenggol tabel) tidak relevan. Biayanya nyata: 3x koneksi, 3x migration folder, dan dashboard lintas modul (Section 0, roadmap #9) terpaksa digabung manual di JS karena benar-benar tidak bisa query gabungan sama sekali — bukan cuma tidak disarankan.

**Kalau tetap ingin database terpisah penuh** (misal karena sengaja latihan pola ini untuk konteks kerja yang menuntut microservices-thinking), itu keputusan valid — cukup tulis eksplisit di Section 4 kenapa, supaya jelas ini pilihan sadar, bukan default yang tidak dipertimbangkan ulang.

**Kalau pindah ke schema-based:**

```prisma
// api/src/modules/job-tracker/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["job_tracker"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model Company {
  // ...
  @@schema("job_tracker")
}
```

```
# .env — satu DATABASE_URL untuk semua modul
DATABASE_URL=postgresql://workspace:changeme@postgres:5432/workspace
```

Init script Postgres berubah dari "buat 3 database" jadi "buat 3 schema di 1 database" (`CREATE SCHEMA job_tracker; CREATE SCHEMA content_planner; CREATE SCHEMA reading_digest;`). Tetap 1 Prisma Client per modul kalau mau strict (masing-masing di-scope ke schema-nya lewat `schemas` array), tapi sekarang dashboard lintas modul (roadmap #9) *bisa* pakai raw SQL gabungan (`SELECT ... FROM job_tracker.applications JOIN reading_digest.articles ...`) kalau nanti benar-benar dibutuhkan (lihat Section 20), tanpa harus stitching di JS.

---

## 16. Model Data Tambahan (update Section 4)

### a. `Attachment` — pisah dari `attachmentUrl` tunggal

Satu lamaran biasanya butuh CV + cover letter + kadang portfolio berbeda. Field tunggal memaksa workaround. Ganti `attachmentUrl` di `Application` dengan relasi:

```prisma
model Attachment {
  id            String         @id @default(cuid())
  applicationId String         @map("application_id")
  application   Application    @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  type          AttachmentType
  url           String
  createdAt     DateTime       @default(now()) @map("created_at")

  @@map("attachments")
}

enum AttachmentType {
  CV
  COVER_LETTER
  PORTFOLIO
  OTHER
}
```

### b. Offer final pada `Application`

`salaryRange` mencatat ekspektasi awal, bukan angka yang benar-benar ditawarkan. Tambahkan:

```prisma
model Application {
  // ...existing fields...
  offeredSalary  String?   @map("offered_salary")
  offeredAt      DateTime? @map("offered_at")
}
```

Berguna untuk membandingkan offer lintas perusahaan saat negosiasi — data historis, bukan cuma catatan sesaat.

---

## 17. Testing Strategy (update Section 11 & 12)

Verification plan sekarang murni manual + build/lint. Tambahkan unit test untuk logika service-layer yang paling gampang salah diam-diam:

| Target | Kenapa perlu di-test |
|---|---|
| `generateSlug()` + collision handling | Salah di sini = data company tumpang tindih tanpa error yang jelas |
| `followUpCount >= 2` → tolak draft baru | Kalau lolos, follow-up draft bisa dibuat tak terbatas tanpa terdeteksi lewat UI |
| Perubahan `status` → `statusUpdatedAt` ter-update | Kalau lupa, funnel chart & reminder jadi salah hitung diam-diam |

Setup: **Vitest** (ringan, cocok dengan stack TS yang sudah ada), test file co-located dengan service (`applications.service.test.ts`). Tambahkan `npm run test` ke verification plan Section 11, jalankan sebelum `lint`/`format:check`.

---

## 18. Job Tracker — Skill Gap Tracking (extend Section 4, 5, 8)

Fitur "skill gap analysis" di roadmap saat ini ditandai fase lanjut dengan asumsi butuh AI. Versi manual (tanpa AI) sudah bisa dibangun di MVP dan memberi nilai nyata:

### Data model

```prisma
model Application {
  // ...existing fields...
  requiredSkills String[] @map("required_skills")  // tag manual dari JD saat create, mis. ["React", "PostgreSQL", "Bahasa Mandarin"]
}
```

Diisi manual saat create application (textarea comma-separated → array, sama pola dengan `dealBreakers` di Company).

### Endpoint baru

| Method | Endpoint | Response |
|---|---|---|
| GET | `/insights/skill-gaps` | `200` array `{ skill, appliedCount, rejectedCount, rejectionRate }` — agregasi `requiredSkills` dari applications dengan status `REJECTED`/`GHOSTED`, diurutkan `rejectionRate` menurun |

Logika: `service` layer hitung frekuensi tiap skill yang muncul di `requiredSkills` pada applications yang gagal, dibanding total applications yang menyebut skill itu. Query biasa, tidak butuh AI — endpoint AI-assist (fase lanjut, kirim JD ke Claude API untuk ekstraksi skill otomatis) tinggal ditambahkan belakangan tanpa mengubah struktur data ini.

### Frontend

Halaman baru `/insights` (Section 3, tambahkan ke `web/src/app/`): tabel skill × rejection rate, sort default rejection rate tertinggi. Ini yang menjawab "di skill apa saya paling sering gagal" — value langsung tanpa nunggu AI-assist.

---

## 19. Job Tracker — STAR Bank (extend Section 4, 5, 8, roadmap #6)

Halaman `/applications/[id]/prep` saat ini checklist statis per-aplikasi, tidak reusable. Ubah jadi bank cerita yang terus diperkaya lintas aplikasi:

### Data model

```prisma
model StarStory {
  id          String   @id @default(cuid())
  title       String                              // "Migrasi database tanpa downtime"
  competency  String                               // tag: "Leadership", "Conflict Resolution", "Problem Solving", dst — free text, bukan enum, biar fleksibel
  situation   String
  task        String
  action      String
  result      String
  usedInApplicationIds String[] @map("used_in_application_ids")  // cukup array id, tanpa relasi formal — dicatat kapan dipakai
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("star_stories")
}
```

### Endpoint baru

Resource independen (tidak nested di bawah `/applications`, karena satu cerita dipakai lintas banyak lamaran): `GET/POST /star-stories`, `PATCH/DELETE /star-stories/:id`.

### Frontend

- Halaman baru `/star-stories` — daftar cerita, filter per `competency`.
- Di `/applications/[id]/prep`, tambahkan panel "Cerita relevan" yang menampilkan `StarStory` yang competency-nya cocok dengan `requiredSkills` aplikasi ini (matching sederhana string, bukan AI) — dari sinilah checklist statis jadi terasa personal tanpa AI-assist.

---

## 20. Modul Reading Digest — Spek Awal (isi Section 0 & roadmap #10)

Spesifikasi awal supaya modul ini terhubung ke skill gap (Section 18), bukan cuma penyimpanan artikel lepas.

### Prinsip

- Struktur folder & isolasi data sama persis dengan Job Tracker (Section 3), di `modules/reading-digest/`.
- Tiap entri digest **wajib** ditag skill/topik (`tags String[]`) — memakai kosakata skill yang sama dengan `requiredSkills` di Job Tracker (tidak ada foreign key lintas database/schema, tapi konvensi penamaan tag disamakan manual).

### Data model (awal)

```prisma
model DigestEntry {
  id            String   @id @default(cuid())
  sourceType    SourceType @map("source_type")   // THREADS_THREAD, ARTICLE_URL, MANUAL_PASTE
  sourceUrl     String?  @map("source_url")
  rawContent    String   @map("raw_content")       // teks asli yang di-paste/capture
  generatedArticle String? @map("generated_article") // hasil LLM, null sebelum diproses
  glossary      Json?                                // [{ term, definition }] hasil LLM
  tags          String[]                             // skill/topik, konvensi sama dengan requiredSkills job-tracker
  deletedAt     DateTime? @map("deleted_at")
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("digest_entries")
}

enum SourceType {
  THREADS_THREAD
  ARTICLE_URL
  MANUAL_PASTE
}
```

### Koneksi ke skill gap

Endpoint `GET /insights/skill-gaps` (Section 18) tinggal di-extend di layer dashboard-gabungan (Section 0 — digabung di kode backend, bukan SQL join, kecuali sudah pindah ke schema-based/Section 15): untuk tiap skill dengan rejection rate tinggi, tampilkan jumlah `DigestEntry` yang sudah ditag skill itu. Ini yang membuat 3 modul benar-benar "berkesinambungan" seperti yang diminta — bukan cuma hidup di docker-compose yang sama, tapi saling mengisi: job tracker menunjukkan gap, reading digest menunjukkan progres belajar untuk menutup gap itu.

**Non-negotiable tambahan:** endpoint AI (ekstraksi artikel+glossary dari `rawContent`) dipanggil manual per-entry (tombol "Generate" di UI), bukan otomatis saat create — supaya kamu bisa review teks mentah dulu sebelum kena biaya API call, konsisten dengan pola `fitScore`/AI-assist di Job Tracker (opsional saat create).

---

## 21. Modul Content Planner — Spek Awal Minimal (isi Section 0 & roadmap #9)

Spek minimal supaya modul ini tidak jadi "belum dispek selamanya". Fokus MVP: personal branding terkait karier (LinkedIn/portfolio), bukan content planner umum.

### Data model (awal)

```prisma
model ContentIdea {
  id          String    @id @default(cuid())
  title       String
  theme       String?                                // narasi karier: "career transition", "technical deep-dive", dst
  platform    Platform  @default(LINKEDIN)
  status      ContentStatus @default(IDEA)
  draftText   String?   @map("draft_text")
  publishedUrl String?  @map("published_url")
  publishedAt DateTime? @map("published_at")
  linkedSkills String[] @map("linked_skills")         // sama konvensi tag dengan modul lain
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("content_ideas")
}

enum Platform {
  LINKEDIN
  BLOG
  OTHER
}

enum ContentStatus {
  IDEA
  DRAFTING
  SCHEDULED
  PUBLISHED
}
```

MVP: CRUD sederhana + kanban by `status` (pola sama dengan applications). Endpoint AI-assist (draft dari `linkedSkills`/`StarStory` terkait) eksplisit ditunda — dicatat di roadmap fase lanjut modul ini, bukan dikerjakan sekaligus dengan CRUD dasar.

---

## 22. Revisi Roadmap & Prioritas Eksekusi (update Section 10)

Urutan yang direkomendasikan, mengoreksi risiko scope untuk solo builder:

1-8. **Sama seperti roadmap asli** (setup → backend → frontend → dashboard → kanban → interview stages → follow-up draft → deploy), **ditambah** Section 16-19 di atas (Attachment, offer fields, skill gap endpoint, STAR bank) sebagai bagian dari MVP Job Tracker — karena semuanya beroperasi di data yang sama, bukan modul baru, jadi tidak menambah kompleksitas arsitektur.
9. **Pakai Job Tracker (+ skill gap + STAR bank) minimal 2-3 minggu nyata** sebelum mulai modul baru — ini bukan langkah teknis, tapi checkpoint wajib. Modul kedua/ketiga hanya bernilai kalau kebiasaan pertama sudah kepakai.
10. Reading Digest (Section 20) — didahulukan dari Content Planner karena terhubung langsung ke skill gap yang sudah punya data nyata dari langkah 9.
11. Content Planner (Section 21).

**Alasan menukar urutan modul 3 & 4 dari roadmap asli:** Reading Digest punya jalur nilai yang jelas dan terukur (menutup skill gap yang sudah teridentifikasi), sedangkan Content Planner nilainya lebih ke branding jangka panjang — lebih aman dibangun setelah ada bahan nyata (dari Reading Digest + STAR bank) untuk dikonten-kan.