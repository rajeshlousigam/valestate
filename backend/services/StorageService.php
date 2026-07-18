<?php

declare(strict_types=1);

namespace app\services;

use Yii;
use yii\web\UploadedFile;

/**
 * Storage abstraction (docs/05 §11).
 *
 * Phase 1 dev driver = local filesystem:
 *   - PUBLIC (media) under runtime/storage/public  (served via MediaController in dev)
 *   - PRIVATE (documents) under runtime/storage/private (NEVER web-served; audited access only)
 *
 * TODO(prod): S3 driver — public bucket + CDN for media; private SSE-KMS bucket +
 * short-lived signed URLs for documents (docs/10 §7, ADR-005/006). Same interface.
 */
final class StorageService
{
    public const PUBLIC = 'public';
    public const PRIVATE = 'private';

    public static function store(UploadedFile $file, string $scope, string $prefix): array
    {
        $dir = self::base($scope) . '/' . trim($prefix, '/');
        if (!is_dir($dir) && !mkdir($dir, 0770, true) && !is_dir($dir)) {
            throw new \RuntimeException('Cannot create storage dir');
        }
        $ext = pathinfo($file->name, PATHINFO_EXTENSION);
        $name = bin2hex(random_bytes(16)) . ($ext ? ('.' . strtolower($ext)) : '');
        $abs = $dir . '/' . $name;
        if (!$file->saveAs($abs)) {
            throw new \RuntimeException('Failed to save upload');
        }
        $key = trim($prefix, '/') . '/' . $name;
        return ['key' => $key, 'checksum' => hash_file('sha256', $abs), 'size' => filesize($abs)];
    }

    public static function absPath(string $scope, string $key): string
    {
        return self::base($scope) . '/' . ltrim($key, '/');
    }

    public static function exists(string $scope, string $key): bool
    {
        return is_file(self::absPath($scope, $key));
    }

    private static function base(string $scope): string
    {
        return Yii::getAlias('@app/runtime/storage/' . $scope);
    }
}
