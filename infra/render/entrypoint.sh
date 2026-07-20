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

# DB setup on boot is OFF by default to avoid racing a manual /setup run.
# Initialise the DB ONCE via  /setup?key=$SETUP_KEY&fresh=1  (no shell needed).
# You can still opt into boot init by setting RUN_MIGRATIONS/RUN_SEED/RUN_DEMO=1.
if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
    echo "[entrypoint] running migrations…"
    php /var/www/app/yii migrate --interactive=0 || echo "[entrypoint] migrate FAILED"
fi
if [ "${RUN_SEED:-0}" = "1" ]; then
    echo "[entrypoint] seeding roles/localities/staff…"
    php /var/www/app/yii seed/launch-city --interactive=0 || echo "[entrypoint] seed FAILED"
fi
if [ "${RUN_DEMO:-0}" = "1" ]; then
    echo "[entrypoint] seeding demo data…"
    php /var/www/app/yii demo/seed --interactive=0 || echo "[entrypoint] demo FAILED"
fi

exec apache2-foreground
