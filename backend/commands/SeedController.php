<?php

declare(strict_types=1);

namespace app\commands;

use app\components\Uuid;
use app\models\User;
use Yii;
use yii\console\Controller;
use yii\console\ExitCode;
use yii\db\Query;
use yii\helpers\Inflector;

/**
 * Idempotent launch-city seed (docs/24): roles, config, Imphal locality taxonomy.
 * Usage: php yii seed/launch-city
 */
class SeedController extends Controller
{
    private const ROLES = [
        'buyer' => 'Buyer / Seeker',
        'owner' => 'Property Owner / Lister',
        'verifier' => 'Verifier / Ops Agent',
        'ops_manager' => 'Operations Manager',
        'moderator' => 'Moderator / Support',
        'admin' => 'Admin',
        'super_admin' => 'Super Admin',
        // broker/developer: future (D-3, docs/03) — intentionally not seeded
    ];

    /** Imphal taxonomy (docs/24 §4). */
    private const TAXONOMY = [
        'Imphal West' => [
            'Thangmeiband', 'Uripok', 'Sagolband', 'Keishampat', 'Paona Bazar',
            'Thangal Bazar', 'Nagamapal', 'Lamphelpat', 'Langol', 'Chingmeirong',
            'Kwakeithel', 'Singjamei',
        ],
        'Imphal East' => [
            'Kongba', 'Porompat', 'Khurai', 'Wangkhei', 'Chingangbam Leikai', 'Andro Road',
        ],
        'Peri-urban' => [
            'Lamphel', 'Mantripukhri', 'Koirengei', 'Canchipur', 'Sekmai',
        ],
    ];

    /** Dev staff logins for the admin console (docs/18). Password: secret123 */
    private const STAFF = [
        ['name' => 'Anand Verifier', 'email' => 'verifier@valestate.test', 'phone' => '8000000001', 'roles' => ['verifier']],
        ['name' => 'Meera Ops', 'email' => 'ops@valestate.test', 'phone' => '8000000002', 'roles' => ['verifier', 'ops_manager']],
        ['name' => 'Nisha Admin', 'email' => 'admin@valestate.test', 'phone' => '8000000003', 'roles' => ['admin']],
    ];

    public function actionLaunchCity(): int
    {
        $this->seedRoles();
        $this->seedConfig();
        $this->seedLocalities();
        $this->seedStaff();
        $this->stdout("Launch-city seed complete (Imphal).\n");
        return ExitCode::OK;
    }

    private function seedStaff(): void
    {
        foreach (self::STAFF as $s) {
            if (User::find()->where(['email' => $s['email']])->exists()) {
                continue;
            }
            $u = new User();
            $u->uuid = Uuid::v4();
            $u->name = $s['name'];
            $u->email = $s['email'];
            $u->phone = $s['phone'];
            $u->status = User::STATUS_ACTIVE;
            $u->setPassword('secret123');
            $u->save(false);
            foreach ($s['roles'] as $r) {
                $u->assignRole($r);
            }
        }
        $this->stdout("Staff seeded (verifier@ / ops@ / admin@ valestate.test · pw secret123).\n");
    }

    private function seedRoles(): void
    {
        foreach (self::ROLES as $key => $name) {
            if (!(new Query())->from('roles')->where(['key' => $key])->exists()) {
                Yii::$app->db->createCommand()->insert('roles', ['key' => $key, 'name' => $name])->execute();
            }
        }
        $this->stdout('Roles seeded: ' . implode(', ', array_keys(self::ROLES)) . "\n");
    }

    private function seedConfig(): void
    {
        $settings = [
            'property_types' => ['RESIDENTIAL', 'COMMERCIAL', 'LAND'],
            'intents' => ['SALE', 'RENT'],
            'sla' => ['claimHours' => 4, 'decideHours' => 24],
            'feature_flags' => [
                'broker_role' => false, 'map_search' => false,
                'in_app_chat' => true, 'appeals' => false,
            ],
            'doc_retention_days' => 90,
            'launch_city' => 'imphal',
        ];
        foreach ($settings as $key => $value) {
            $json = json_encode($value, JSON_UNESCAPED_SLASHES);
            if ((new Query())->from('config_settings')->where(['key' => $key])->exists()) {
                Yii::$app->db->createCommand()->update('config_settings', ['value_json' => $json], ['key' => $key])->execute();
            } else {
                Yii::$app->db->createCommand()->insert('config_settings', ['key' => $key, 'value_json' => $json])->execute();
            }
        }
        $this->stdout("Config settings seeded.\n");
    }

    private function seedLocalities(): void
    {
        $cityId = $this->upsertLocality(null, 'CITY', 'Imphal', 'imphal');
        foreach (self::TAXONOMY as $areaName => $localities) {
            $areaSlug = Inflector::slug($areaName);
            $areaId = $this->upsertLocality($cityId, 'AREA', $areaName, $areaSlug);
            foreach ($localities as $loc) {
                $this->upsertLocality($areaId, 'LOCALITY', $loc, Inflector::slug($loc));
            }
        }
        $count = (new Query())->from('localities')->count();
        $this->stdout("Localities seeded (total rows: {$count}).\n");
    }

    private function upsertLocality(?int $parentId, string $level, string $name, string $slug): int
    {
        $existing = (new Query())->select('id')->from('localities')->where(['slug' => $slug])->scalar();
        if ($existing !== false) {
            return (int) $existing;
        }
        Yii::$app->db->createCommand()->insert('localities', [
            'parent_id' => $parentId,
            'level' => $level,
            'name' => $name,
            'slug' => $slug,
        ])->execute();
        return (int) Yii::$app->db->getLastInsertID();
    }
}
