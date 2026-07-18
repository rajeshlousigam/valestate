<?php

declare(strict_types=1);

namespace app\services;

use Yii;

/**
 * Transactional outbox (docs/05 ADR-004, docs/04 §9).
 * Insert participates in the caller's DB transaction → no lost events.
 * A relay worker (Phase 1+) publishes unpublished rows to the queue.
 */
final class OutboxService
{
    public static function emit(string $aggregateType, string $aggregateId, string $eventType, array $payload, int $version = 1): void
    {
        Yii::$app->db->createCommand()->insert('outbox_events', [
            'aggregate_type' => $aggregateType,
            'aggregate_id' => $aggregateId,
            'event_type' => $eventType,
            'payload_json' => json_encode($payload, JSON_UNESCAPED_SLASHES),
            'version' => $version,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ])->execute();
    }
}
