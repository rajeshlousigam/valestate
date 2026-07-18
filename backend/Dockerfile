FROM php:8.2-fpm-alpine

# System deps + PHP extensions
RUN apk add --no-cache $PHPIZE_DEPS icu-dev oniguruma-dev git unzip \
    && docker-php-ext-install pdo_mysql intl opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Deps are installed via `make composer` (bind-mounted source in dev).
# For prod builds, uncomment:
# COPY composer.json composer.lock ./
# RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
# COPY . .

EXPOSE 9000
CMD ["php-fpm"]
