# ==============================================================================
# Production Dockerfile untuk Laravel 13 + Inertia React (Render Web Service)
# Strategi: Single-stage PHP 8.4 FPM Alpine dengan pre-built frontend (lokal)
# Laravel 13 / Symfony 8.x menggunakan PHP 8.4 Property Hooks (syntax error di PHP 8.3)
# ==============================================================================
FROM php:8.4-fpm-alpine

# Set non-interactive & memory limits untuk composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1

# Install runtime dependencies esensial + tools deploy
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    gettext \
    postgresql-libs \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    icu-libs \
    oniguruma \
    && apk add --no-cache --virtual .build-deps \
        postgresql-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pgsql \
        bcmath \
        gd \
        zip \
        intl \
        mbstring \
        opcache \
        pcntl \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/*

# Ambil binary Composer resmi dari composer image
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Opcache & PHP settings
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

# Salin seluruh source code proyek (termasuk public/build pre-built)
COPY . .

# Install dependency PHP produksi (tanpa dev, abaikan platform reqs untuk kehandalan container)
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

# Pasang konfigurasi Nginx, Supervisord, dan Script Deploy di root container
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY 00-laravel-deploy.sh /usr/local/bin/00-laravel-deploy.sh
RUN chmod +x /usr/local/bin/00-laravel-deploy.sh

# Setup direktori storage, cache, dan temp nginx agar writable oleh www-data
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
             /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp \
    && chown -R www-data:www-data storage bootstrap/cache /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80

# Health check endpoint Render (/up route bawaan Laravel 11/12/13)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f "http://127.0.0.1:${PORT:-80}/up" || exit 1

ENTRYPOINT ["/usr/local/bin/00-laravel-deploy.sh"]
