#!/bin/sh
# ==============================================================================
# 00-laravel-deploy.sh — Production Startup Script untuk Render Container
# Menjalankan: Permission Fix, Storage Link, Discover, Migrate, Seed Otomatis, Cache, & Supervisord
# ==============================================================================
set -eu

cd /var/www/html

# 1. Pastikan port fallback jika Render tidak menyediakan $PORT
: "${PORT:=80}"
export PORT

echo "===> [1/7] Mengonfigurasi Nginx port dinamis: ${PORT}..."
sed "s/\${PORT}/${PORT}/g" /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -t

echo "===> [2/7] Memperbaiki permission storage dan cache ke www-data..."
mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp
chown -R www-data:www-data storage bootstrap/cache /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "===> [3/7] Membuat storage symbolic link..."
php artisan storage:link --force || true

echo "===> [4/7] Menjalankan package discovery..."
php artisan package:discover --ansi

echo "===> [5/7] Menjalankan migrasi database PostgreSQL (force)..."
# Loop tunggu koneksi database siap (maksimal 45 detik)
if [ "${DB_CONNECTION:-}" = "pgsql" ] || [ -n "${DATABASE_URL:-}" ]; then
  echo "Memeriksa kesiapan PostgreSQL database..."
  for i in $(seq 1 30); do
    if php artisan db:show --no-interaction >/dev/null 2>&1; then
      echo "Koneksi database PostgreSQL berhasil terhubung."
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "Peringatan: Database belum merespon setelah 60 detik, melanjutkan eksekusi..."
    fi
    sleep 2
  done
fi

php artisan migrate --force --no-interaction

echo "===> [6/7] Menjalankan seeding data otomatis (idempotent untuk setiap redeploy)..."
# DatabaseSeeder menggunakan updateOrCreate & firstOrCreate sehingga aman dijalankan setiap kali redeploy
php artisan db:seed --force --no-interaction

echo "===> [7/7] Melakukan optimasi dan caching aplikasi (config, route, view)..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "===> Selesai! Menjalankan Supervisord (Nginx + PHP-FPM) pada port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
