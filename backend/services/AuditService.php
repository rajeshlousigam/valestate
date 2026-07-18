<?php

declare(strict_types=1);

namespace app\services;

use Yii;

/**
 * Append-only audit log (docs/10, docs/22). Never store PII/secrets in meta.
 * Mandatory for sensitive-doc access and verification decisions (docs/07 BR-07.2).
 */
final class AuditService
{
    public static function log(?string $actorUuid, string $action, ?string $resourceType = null, ?string $resourceId = null, array $meta = []): void
    {
        Yii::$app->db->createCommand()->insert('audit_logs', [
            'actor_id' => $actorUuid,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'meta_json' => $meta ? json_encode($meta, JSON_UNESCAPED_SLASHES) : null,
            'ip' => Yii::$app->request->userIP ?? null,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ])->execute();
    }
}
