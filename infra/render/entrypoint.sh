#!/usr/bin/env bash
set -e

PORT="${PORT:-10000}"
APP_ROOT="${APP_ROOT:-admin}"
DOCROOT="/var/www/app/${APP_ROOT}"

# Apache listens on Render's $PORT and serves the chosen Yii entry point.
sed -i "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/:80>/:${PORT}>/" /etc/apache2/sites-available/000-default.conf
sed -i "s#DocumentRoot /var/www/html#DocumentRoot ${DOCROOT}#" /etc/apache2/sites-available/000-default.conf

cat > /etc/apache2/conf-available/veapp.conf <<EOF
<Directory ${DOCROOT}>
    AllowOverride All
    Require all granted
</Directory>
ServerName localhost
EOF
a2enconf veapp >/dev/null 2>&1 || true

# One-off DB setup, controlled by env (run once, then set back to 0).
if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
    php /var/www/app/yii migrate --interactive=0 || echo "migrate: skipped/failed"
fi
if [ "${RUN_SEED:-0}" = "1" ]; then
    php /var/www/app/yii seed/launch-city --interactive=0 || echo "seed: skipped/failed"
fi

exec apache2-foreground
