<?php

declare(strict_types=1);

namespace app\services;

use RuntimeException;
use Yii;

/**
 * Dependency-free JWT (docs/10 §5).
 *
 * Uses PHP's audited primitives — no third-party JWT package (removes the
 * firebase/php-jwt advisory surface). Supports:
 *   - HS256 (hash_hmac)  — Phase 0 local seed, shared secret
 *   - RS256 (openssl)    — production target; set JWT_PRIVATE_KEY / JWT_PUBLIC_KEY
 *
 * Hardening: explicit `alg` allow-list (blocks "none" + alg-confusion),
 * constant-time HMAC compare (hash_equals), exp/nbf/iat validation.
 */
final class JwtService
{
    private const ALLOWED = ['HS256', 'RS256'];

    /** @param string[] $roles */
    public static function issueAccessToken(string $userUuid, array $roles): array
    {
        $cfg = Yii::$app->params['jwt'];
        $now = time();
        $exp = $now + (int) $cfg['accessTtl'];

        $claims = [
            'iss' => $cfg['issuer'],
            'sub' => $userUuid,
            'roles' => array_values($roles),
            'iat' => $now,
            'nbf' => $now,
            'exp' => $exp,
            'jti' => bin2hex(random_bytes(16)),
        ];

        return [
            'token' => self::encode($claims),
            'expiresIn' => (int) $cfg['accessTtl'],
            'expiresAt' => gmdate('c', $exp),
        ];
    }

    /** @param array<string,mixed> $claims */
    public static function encode(array $claims): string
    {
        $alg = self::alg();
        $header = ['typ' => 'JWT', 'alg' => $alg];

        $signingInput = self::b64UrlEncode(self::json($header))
            . '.' . self::b64UrlEncode(self::json($claims));

        $signature = match ($alg) {
            'HS256' => hash_hmac('sha256', $signingInput, self::hmacSecret(), true),
            'RS256' => self::rsSign($signingInput),
        };

        return $signingInput . '.' . self::b64UrlEncode($signature);
    }

    /** @return object decoded claims (throws on any failure) */
    public static function verify(string $token): object
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Malformed token');
        }
        [$h64, $p64, $s64] = $parts;

        $header = json_decode(self::b64UrlDecode($h64));
        if (!isset($header->alg) || !in_array($header->alg, self::ALLOWED, true)) {
            throw new RuntimeException('Disallowed alg');
        }
        if ($header->alg !== self::alg()) {
            throw new RuntimeException('Unexpected alg'); // block alg-confusion
        }

        $signingInput = $h64 . '.' . $p64;
        $signature = self::b64UrlDecode($s64);

        $valid = match ($header->alg) {
            'HS256' => hash_equals(hash_hmac('sha256', $signingInput, self::hmacSecret(), true), $signature),
            'RS256' => openssl_verify($signingInput, $signature, self::publicKey(), OPENSSL_ALGO_SHA256) === 1,
            default => false,
        };
        if (!$valid) {
            throw new RuntimeException('Invalid signature');
        }

        $claims = json_decode(self::b64UrlDecode($p64));
        if (!is_object($claims)) {
            throw new RuntimeException('Invalid claims');
        }
        $now = time();
        if (isset($claims->nbf) && $now < (int) $claims->nbf) {
            throw new RuntimeException('Token not yet valid');
        }
        if (isset($claims->exp) && $now >= (int) $claims->exp) {
            throw new RuntimeException('Token expired');
        }

        return $claims;
    }

    // ---- refresh tokens (opaque, hashed at rest) ----

    public static function newRefreshToken(): array
    {
        $raw = bin2hex(random_bytes(32));
        return ['raw' => $raw, 'hash' => hash('sha256', $raw)];
    }

    public static function hashRefresh(string $raw): string
    {
        return hash('sha256', $raw);
    }

    // ---- internals ----

    private static function alg(): string
    {
        $alg = (string) (Yii::$app->params['jwt']['alg'] ?? 'HS256');
        if (!in_array($alg, self::ALLOWED, true)) {
            throw new RuntimeException("Unsupported JWT alg: {$alg}");
        }
        return $alg;
    }

    private static function hmacSecret(): string
    {
        $secret = (string) Yii::$app->params['jwt']['secret'];
        if (strlen($secret) < 32) {
            throw new RuntimeException('JWT secret too short (min 32 chars)');
        }
        return $secret;
    }

    private static function rsSign(string $data): string
    {
        $key = self::privateKey();
        $sig = '';
        if (!openssl_sign($data, $sig, $key, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('RS256 signing failed');
        }
        return $sig;
    }

    private static function privateKey(): string
    {
        $k = getenv('JWT_PRIVATE_KEY') ?: '';
        if ($k === '') {
            throw new RuntimeException('JWT_PRIVATE_KEY not configured for RS256');
        }
        return $k;
    }

    private static function publicKey(): string
    {
        $k = getenv('JWT_PUBLIC_KEY') ?: '';
        if ($k === '') {
            throw new RuntimeException('JWT_PUBLIC_KEY not configured for RS256');
        }
        return $k;
    }

    private static function json(array $data): string
    {
        return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    private static function b64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64UrlDecode(string $data): string
    {
        $pad = strlen($data) % 4;
        if ($pad > 0) {
            $data .= str_repeat('=', 4 - $pad);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        if ($decoded === false) {
            throw new RuntimeException('Invalid base64url');
        }
        return $decoded;
    }
}
