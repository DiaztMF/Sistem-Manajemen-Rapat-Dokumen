#!/bin/sh
# 00-laravel-deploy.sh — entrypoint Render untuk service Laravel (php-fpm + nginx).
# Tugas: render nginx.conf dengan $PORT dinamis, cache config/route/view,
#        migrate ke PostgreSQL, lalu boot supervisord (php-fpm + nginx).
set -eu

cd /var/www/html

: "${PORT:=80}"
export PORT

# 1. Render nginx.conf dari template (hanya ${PORT} yang disubstitusi,
#    variabel nginx lain seperti $uri / $query_string dibiarkan utuh).
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf
nginx -t -c /tmp/nginx.conf

# 2. Tunggu PostgreSQL siap (maks ~60 detik). php artisan db:show
#    membaca koneksi dari DB_URL maupun DB_HOST/DB_* — tanpa password inline.
if [ "${DB_CONNECTION:-}" = "pgsql" ]; then
  echo "Waiting for PostgreSQL..."
  for i in $(seq 1 30); do
    if php artisan db:show --no-interaction >/dev/null 2>&1; then
      echo "Database is reachable."
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "WARNING: database not reachable after 60s, continuing anyway."
    fi
    sleep 2
  done
fi

# 3. Regenerasi discovery + cache (aman walau APP_KEY/env berubah antar deploy).
php artisan package:discover --ansi
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Migrasi ke PostgreSQL Render.
php artisan migrate --force --no-interaction

# 5. Seed akun demo — HANYA jika SEED_DEMO=true (deploy pertama / staging).
if [ "${SEED_DEMO:-false}" = "true" ]; then
  php artisan db:seed --force --no-interaction || echo "WARNING: seeder failed, continuing."
fi

# 6. Pastikan direktori runtime writable (Render memakai ephemeral disk).
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "Starting php-fpm + nginx on port ${PORT}..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
