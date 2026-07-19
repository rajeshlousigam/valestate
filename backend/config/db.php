<?php

declare(strict_types=1);

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$name = getenv('DB_NAME') ?: 'housepoint';

$attributes = [
    PDO::ATTR_TIMEOUT => 8,
];

// TLS for managed MySQL (e.g. Aiven requires ssl-mode=REQUIRED). Set DB_SSL=1.
// Aiven uses a private CA, so by default we enable TLS without pinning; provide
// DB_SSL_CA=/path/to/aiven-ca.pem to pin the certificate instead.
if (filter_var(getenv('DB_SSL') ?: '0', FILTER_VALIDATE_BOOLEAN)) {
    $ca = getenv('DB_SSL_CA') ?: '/etc/ssl/certs/ca-certificates.crt';
    if (is_file($ca)) {
        $attributes[PDO::MYSQL_ATTR_SSL_CA] = $ca;
    }
    $attributes[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = filter_var(getenv('DB_SSL_VERIFY') ?: '0', FILTER_VALIDATE_BOOLEAN);
}

return [
    'class' => \yii\db\Connection::class,
    'dsn' => "mysql:host={$host};port={$port};dbname={$name}",
    'username' => getenv('DB_USER') ?: 'housepoint',
    'password' => getenv('DB_PASSWORD') ?: '',
    'charset' => 'utf8mb4',
    'enableSchemaCache' => !YII_DEBUG,
    'schemaCacheDuration' => 3600,
    'attributes' => $attributes,
];
