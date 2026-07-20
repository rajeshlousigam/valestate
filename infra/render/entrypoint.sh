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

# DB setup on boot. Migrate + base seed default ON (idempotent) so the schema
# and staff always exist; set RUN_MIGRATIONS/RUN_SEED=0 to disable. Demo is opt-in.
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    echo "[entrypoint] running migrations…"
    php /var/www/app/yii migrate --interactive=0 || echo "[entrypoint] migrate FAILED"
fi
if [ "${RUN_SEED:-1}" = "1" ]; then
    echo "[entrypoint] seeding roles/localities/staff…"
    php /var/www/app/yii seed/launch-city --interactive=0 || echo "[entrypoint] seed FAILED"
fi
if [ "${RUN_DEMO:-0}" = "1" ]; then
    echo "[entrypoint] seeding demo data…"
    php /var/www/app/yii demo/seed --interactive=0 || echo "[entrypoint] demo FAILED"
fi

exec apache2-foreground
