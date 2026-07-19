# Production image for Render (single process: Apache + mod_php).
# Serves one Yii entry point (admin by default) on $PORT.
# Build context = repo root. PHP 8.2 (change to 8.1-apache if required).
FROM php:8.2-apache

RUN apt-get update \
 && apt-get install -y --no-install-recommends libicu-dev libonig-dev unzip git \
 && docker-php-ext-install pdo_mysql intl opcache \
 && pecl install redis && docker-php-ext-enable redis \
 && a2enmod rewrite \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/app
COPY backend/ /var/www/app/

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
 && mkdir -p runtime web/assets admin/assets \
 && chown -R www-data:www-data runtime web/assets admin/assets

COPY infra/render/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Which Yii app to serve: "admin" (console) or "web" (REST API)
ENV APP_ROOT=admin \
    YII_ENV=prod \
    YII_DEBUG=0

CMD ["/entrypoint.sh"]
