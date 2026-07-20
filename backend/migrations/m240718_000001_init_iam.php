<?php

declare(strict_types=1);

use yii\db\Migration;

/**
 * IAM + RBAC core (docs/03, docs/08 §7.1).
 */
class m240718_000001_init_iam extends Migration
{
    private string $opts = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';

    public function safeUp(): void
    {
        $this->createTable('{{%users}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'uuid' => $this->string(36)->notNull()->unique(),
            'name' => $this->string(120)->notNull(),
            'email' => $this->string(190)->notNull()->unique(),
            'phone' => $this->string(20)->null()->unique(),
            'password_hash' => $this->string(255)->notNull(),
            'status' => $this->string(20)->notNull()->defaultValue('REGISTERED'),
            'email_verified_at' => $this->dateTime()->null(),
            'phone_verified_at' => $this->dateTime()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
            'updated_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->createIndex('idx_users_status', '{{%users}}', 'status');

        $this->createTable('{{%roles}}', [
            'id' => $this->primaryKey(),
            'key' => $this->string(40)->notNull()->unique(),
            'name' => $this->string(80)->notNull(),
        ], $this->opts);

        // PK inline (not a separate ALTER) so it satisfies sql_require_primary_key
        // (enforced on managed MySQL like Aiven).
        $this->createTable('{{%user_roles}}', [
            'user_id' => $this->bigInteger()->unsigned()->notNull(),
            'role_id' => $this->integer()->notNull(),
            'PRIMARY KEY(user_id, role_id)',
        ], $this->opts);
        $this->addForeignKey('fk_ur_user', '{{%user_roles}}', 'user_id', '{{%users}}', 'id', 'CASCADE');
        $this->addForeignKey('fk_ur_role', '{{%user_roles}}', 'role_id', '{{%roles}}', 'id', 'CASCADE');

        $this->createTable('{{%refresh_tokens}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'user_id' => $this->bigInteger()->unsigned()->notNull(),
            'token_hash' => $this->char(64)->notNull()->unique(),
            'device_id' => $this->string(100)->null(),
            'expires_at' => $this->dateTime()->notNull(),
            'revoked_at' => $this->dateTime()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_rt_user', '{{%refresh_tokens}}', 'user_id', '{{%users}}', 'id', 'CASCADE');
        $this->createIndex('idx_rt_user', '{{%refresh_tokens}}', ['user_id', 'revoked_at']);

        $this->createTable('{{%auth_otps}}', [
            'id' => $this->bigPrimaryKey()->unsigned(),
            'user_id' => $this->bigInteger()->unsigned()->notNull(),
            'purpose' => $this->string(30)->notNull(),
            'code_hash' => $this->string(255)->notNull(),
            'expires_at' => $this->dateTime()->notNull(),
            'consumed_at' => $this->dateTime()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_otp_user', '{{%auth_otps}}', 'user_id', '{{%users}}', 'id', 'CASCADE');
    }

    public function safeDown(): void
    {
        $this->dropTable('{{%auth_otps}}');
        $this->dropTable('{{%refresh_tokens}}');
        $this->dropTable('{{%user_roles}}');
        $this->dropTable('{{%roles}}');
        $this->dropTable('{{%users}}');
    }
}
