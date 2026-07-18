<?php

declare(strict_types=1);

use yii\db\Migration;

/**
 * Transactional outbox + append-only audit log (docs/05 ADR-004, docs/08 §7.11, docs/10).
 */
class m240718_000003_init_outbox_audit extends Migration
{
    private string $opts = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';

    public function safeUp(): void
    {
        $this->createTable('{{%outbox_events}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'aggregate_type' => $this->string(60)->notNull(),
            'aggregate_id' => $this->string(64)->notNull(),
            'event_type' => $this->string(80)->notNull(),
            'payload_json' => $this->json()->notNull(),
            'version' => $this->integer()->notNull()->defaultValue(1),
            'published_at' => $this->dateTime()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        // relay scans unpublished (docs/05)
        $this->createIndex('idx_outbox_unpublished', '{{%outbox_events}}', ['published_at', 'id']);

        $this->createTable('{{%audit_logs}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'actor_id' => $this->string(36)->null(),
            'action' => $this->string(80)->notNull(),
            'resource_type' => $this->string(60)->null(),
            'resource_id' => $this->string(64)->null(),
            'meta_json' => $this->json()->null(), // redacted — never store PII/secrets (docs/10)
            'ip' => $this->string(45)->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->createIndex('idx_audit_resource', '{{%audit_logs}}', ['resource_type', 'resource_id', 'created_at']);
    }

    public function safeDown(): void
    {
        $this->dropTable('{{%audit_logs}}');
        $this->dropTable('{{%outbox_events}}');
    }
}
