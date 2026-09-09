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
