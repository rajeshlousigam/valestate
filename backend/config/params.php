<?php

declare(strict_types=1);

return [
    'jwt' => [
        'alg' => getenv('JWT_ALG') ?: 'HS256',
        'secret' => getenv('JWT_SECRET') ?: 'insecure-dev-secret-change-me-please-32c',
        'accessTtl' => (int) (getenv('ACCESS_TOKEN_TTL') ?: 900),
        'refreshTtl' => (int) (getenv('REFRESH_TOKEN_TTL') ?: 2592000),
        'issuer' => 'housepoint',
    ],
    'launchCity' => [
        'city' => getenv('DEFAULT_CITY') ?: 'imphal',
        'currency' => getenv('DEFAULT_CURRENCY') ?: 'INR',
        'timezone' => getenv('DEFAULT_TIMEZONE') ?: 'Asia/Kolkata',
    ],
    'sla' => [
        'claimHours' => (int) (getenv('SLA_CLAIM_HOURS') ?: 4),
        'decideHours' => (int) (getenv('SLA_DECIDE_HOURS') ?: 24),
    ],
    'docRetentionDays' => (int) (getenv('DOC_RETENTION_DAYS') ?: 90),
];
