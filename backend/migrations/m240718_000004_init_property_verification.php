<?php

declare(strict_types=1);

use yii\db\Migration;

/**
 * Property, media, documents, verification, listings, inquiries.
 * (docs/04 aggregates, docs/07 lifecycle, docs/08 schema).
 */
class m240718_000004_init_property_verification extends Migration
{
    private string $opts = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';

    public function safeUp(): void
    {
        // ---- Property (docs/08 §7.2) ----
        $this->createTable('{{%properties}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'uuid' => $this->string(36)->notNull()->unique(),
            'owner_id' => $this->bigInteger()->unsigned()->notNull(),
            'property_type' => $this->string(20)->notNull(),   // RESIDENTIAL|COMMERCIAL|LAND
            'intent' => $this->string(10)->notNull(),          // SALE|RENT
            'title' => $this->string(160)->notNull(),
            'description' => $this->text()->null(),
            'locality_id' => $this->integer()->null(),
            'address_line' => $this->string(255)->null(),
            'pincode' => $this->string(10)->null(),
            'geo_lat' => $this->decimal(10, 7)->null(),
            'geo_lng' => $this->decimal(10, 7)->null(),
            'price_minor' => $this->bigInteger()->null(),
            'currency' => $this->char(3)->notNull()->defaultValue('INR'),
            'deposit_minor' => $this->bigInteger()->null(),
            'area_value' => $this->decimal(12, 2)->null(),
            'area_unit' => $this->string(12)->null(),
            'attributes_json' => $this->json()->null(),
            'status' => $this->string(20)->notNull()->defaultValue('DRAFT'),
            'availability' => $this->string(20)->notNull()->defaultValue('AVAILABLE'),
            'version' => $this->integer()->notNull()->defaultValue(1),
            'submitted_at' => $this->dateTime()->null(),
            'verified_at' => $this->dateTime()->null(),
            'published_at' => $this->dateTime()->null(),
            'closed_at' => $this->dateTime()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
            'updated_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_prop_owner', '{{%properties}}', 'owner_id', '{{%users}}', 'id', 'CASCADE');
        $this->addForeignKey('fk_prop_loc', '{{%properties}}', 'locality_id', '{{%localities}}', 'id', 'SET NULL');
        $this->createIndex('idx_prop_catalog', '{{%properties}}', ['status', 'locality_id', 'intent', 'property_type']);
        $this->createIndex('idx_prop_owner', '{{%properties}}', 'owner_id');

        // ---- Media (public) ----
        $this->createTable('{{%media_assets}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'property_id' => $this->bigInteger()->unsigned()->notNull(),
            'kind' => $this->string(20)->notNull()->defaultValue('PHOTO'),
            'storage_key' => $this->string(300)->notNull(),
            'variant_json' => $this->json()->null(),
            'sort_order' => $this->integer()->notNull()->defaultValue(0),
            'status' => $this->string(20)->notNull()->defaultValue('READY'),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_media_prop', '{{%media_assets}}', 'property_id', '{{%properties}}', 'id', 'CASCADE');

        // ---- Documents (RESTRICTED — private, audited access only; docs/10) ----
        $this->createTable('{{%documents}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'property_id' => $this->bigInteger()->unsigned()->notNull(),
            'owner_id' => $this->bigInteger()->unsigned()->notNull(),
            'doc_type' => $this->string(20)->notNull(),        // OWNERSHIP|IDENTITY|OTHER
            'storage_key' => $this->string(300)->notNull(),
            'sensitivity' => $this->string(20)->notNull()->defaultValue('RESTRICTED'),
            'checksum' => $this->string(64)->null(),
            'uploaded_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_doc_prop', '{{%documents}}', 'property_id', '{{%properties}}', 'id', 'CASCADE');

        // ---- Verification (docs/07) ----
        $this->createTable('{{%verification_cases}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'property_id' => $this->bigInteger()->unsigned()->notNull(),
            'owner_id' => $this->bigInteger()->unsigned()->notNull(),
            'state' => $this->string(20)->notNull()->defaultValue('UNCLAIMED'),
            'assigned_verifier_id' => $this->bigInteger()->unsigned()->null(),
            'decision' => $this->string(12)->null(),           // APPROVED|REJECTED
            'reason_code' => $this->string(40)->null(),
            'decision_note' => $this->text()->null(),
            'claimed_at' => $this->dateTime()->null(),
            'decided_at' => $this->dateTime()->null(),
            'sla_due_at' => $this->dateTime()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_vc_prop', '{{%verification_cases}}', 'property_id', '{{%properties}}', 'id', 'CASCADE');
        $this->createIndex('idx_vc_queue', '{{%verification_cases}}', ['state', 'sla_due_at']);
        $this->createIndex('idx_vc_assignee', '{{%verification_cases}}', ['assigned_verifier_id', 'state']);
        // one OPEN case per property (docs/08 §9): enforced in app; unique guard on non-decided handled by app logic.

        $this->createTable('{{%verification_checklist_items}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'case_id' => $this->bigInteger()->unsigned()->notNull(),
            'item_key' => $this->string(60)->notNull(),
            'mandatory' => $this->boolean()->notNull()->defaultValue(true),
            'result' => $this->string(10)->notNull()->defaultValue('PENDING'), // PASS|FAIL|NA|PENDING
            'note' => $this->string(255)->null(),
            'updated_by' => $this->bigInteger()->unsigned()->null(),
            'updated_at' => $this->dateTime()->null(),
        ], $this->opts);
        $this->addForeignKey('fk_vci_case', '{{%verification_checklist_items}}', 'case_id', '{{%verification_cases}}', 'id', 'CASCADE');
        $this->createIndex('idx_vci_case', '{{%verification_checklist_items}}', 'case_id');

        $this->createTable('{{%verification_events}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'case_id' => $this->bigInteger()->unsigned()->notNull(),
            'from_state' => $this->string(20)->null(),
            'to_state' => $this->string(20)->notNull(),
            'actor_id' => $this->string(36)->null(),
            'reason_code' => $this->string(40)->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_ve_case', '{{%verification_events}}', 'case_id', '{{%verification_cases}}', 'id', 'CASCADE');

        // ---- Publication (docs/08 §7.5) ----
        $this->createTable('{{%listings}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'uuid' => $this->string(36)->notNull()->unique(),
            'property_id' => $this->bigInteger()->unsigned()->notNull()->unique(),
            'slug' => $this->string(200)->notNull()->unique(),
            'canonical_url' => $this->string(300)->null(),
            'visibility' => $this->string(10)->notNull()->defaultValue('PUBLIC'),
            'verified_at' => $this->dateTime()->null(),
            'verification_tier' => $this->string(20)->notNull()->defaultValue('STANDARD'),
            'checks_performed_json' => $this->json()->null(),
            'published_at' => $this->dateTime()->null(),
            'unpublished_at' => $this->dateTime()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_listing_prop', '{{%listings}}', 'property_id', '{{%properties}}', 'id', 'CASCADE');
        $this->createIndex('idx_listing_visibility', '{{%listings}}', ['visibility', 'published_at']);

        // ---- Engagement (docs/08 §7.6) ----
        $this->createTable('{{%inquiries}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'listing_id' => $this->bigInteger()->unsigned()->notNull(),
            'buyer_id' => $this->bigInteger()->unsigned()->notNull(),
            'owner_id' => $this->bigInteger()->unsigned()->notNull(),
            'message' => $this->text()->null(),
            'status' => $this->string(12)->notNull()->defaultValue('NEW'),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_inq_listing', '{{%inquiries}}', 'listing_id', '{{%listings}}', 'id', 'CASCADE');
        $this->createIndex('idx_inq_owner', '{{%inquiries}}', ['owner_id', 'status']);
    }

    public function safeDown(): void
    {
        $this->dropTable('{{%inquiries}}');
        $this->dropTable('{{%listings}}');
        $this->dropTable('{{%verification_events}}');
        $this->dropTable('{{%verification_checklist_items}}');
        $this->dropTable('{{%verification_cases}}');
        $this->dropTable('{{%documents}}');
        $this->dropTable('{{%media_assets}}');
        $this->dropTable('{{%properties}}');
    }
}
