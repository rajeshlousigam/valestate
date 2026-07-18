<?php

declare(strict_types=1);

use yii\db\Migration;

/**
 * Locality taxonomy + config settings (docs/08 §7.9/§7.11, docs/24).
 */
class m240718_000002_init_taxonomy_config extends Migration
{
    private string $opts = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB';

    public function safeUp(): void
    {
        $this->createTable('{{%localities}}', [
            'id' => $this->primaryKey(),
            'parent_id' => $this->integer()->null(),
            'level' => $this->string(20)->notNull(), // CITY | AREA | LOCALITY
            'name' => $this->string(120)->notNull(),
            'slug' => $this->string(140)->notNull()->unique(),
            'seo_meta_json' => $this->json()->null(),
            'created_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        ], $this->opts);
        $this->addForeignKey('fk_loc_parent', '{{%localities}}', 'parent_id', '{{%localities}}', 'id', 'SET NULL');
        $this->createIndex('idx_loc_parent', '{{%localities}}', 'parent_id');

        $this->createTable('{{%config_settings}}', [
            'id' => $this->primaryKey(),
            'key' => $this->string(80)->notNull()->unique(),
            'value_json' => $this->json()->notNull(),
            'updated_at' => $this->dateTime()->notNull()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        ], $this->opts);
    }

    public function safeDown(): void
    {
        $this->dropTable('{{%config_settings}}');
        $this->dropTable('{{%localities}}');
    }
}
