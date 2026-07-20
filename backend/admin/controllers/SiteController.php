<?php

declare(strict_types=1);

namespace app\admin\controllers;

use Yii;
use yii\db\Query;
use yii\web\Controller;
use yii\web\Response;

/**
 * Public diagnostics for the deployed admin: is the DB reachable and seeded?
 * GET /health  →  JSON. No auth (no sensitive data beyond counts).
 */
class SiteController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionHealth(): array
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $out = ['app' => 'valestate-admin', 'time' => gmdate('c')];

        // 1) can we connect at all?
        try {
            Yii::$app->db->createCommand('SELECT 1')->queryScalar();
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 503;
            return $out + [
                'db' => 'connection-error',
                'error' => substr($e->getMessage(), 0, 300),
                'hint' => 'Cannot reach the database. Check DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD and DB_SSL=1 (Aiven requires TLS).',
            ];
        }
        $out['db'] = 'connected';

        // 2) is the schema migrated + seeded?
        try {
            $out['counts'] = [
                'users' => (int) (new Query())->from('users')->count(),
                'roles' => (int) (new Query())->from('roles')->count(),
                'localities' => (int) (new Query())->from('localities')->count(),
                'properties' => (int) (new Query())->from('properties')->count(),
            ];
            $out['adminAccountSeeded'] = (new Query())->from('users')->where(['email' => 'admin@valestate.test'])->exists();
            $out['ready'] = $out['counts']['users'] > 0;
            if (!$out['ready']) {
                Yii::$app->response->statusCode = 503;
                $out['hint'] = 'Schema exists but no users — the seed did not run. Set RUN_SEED=1 and redeploy.';
            }
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 503;
            $out['schema'] = 'not-migrated';
            $out['ready'] = false;
            $out['error'] = substr($e->getMessage(), 0, 200);
            $out['hint'] = 'DB is connected but tables are missing — migrations have not run. Set RUN_MIGRATIONS=1 (and RUN_SEED=1) and redeploy.';
        }
        return $out;
    }

    /**
     * One-time DB init from the web process (for hosts with no shell, e.g. Render
     * free). Runs migrate + seed + demo via the CLI. Guarded by ?key=$SETUP_KEY.
     * GET /setup?key=...
     */
    public function actionSetup(): array
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $key = (string) getenv('SETUP_KEY');
        if ($key === '' || Yii::$app->request->get('key') !== $key) {
            Yii::$app->response->statusCode = 403;
            return ['error' => 'Forbidden. Set the SETUP_KEY env var on the service and call /setup?key=THAT_VALUE.'];
        }

        $steps = [];

        // ?fresh=1 → drop all tables via SQL first (migrate/fresh is blocked in
        // prod). Fixes a half-migrated DB. Destructive — throwaway DBs only.
        if (Yii::$app->request->get('fresh')) {
            try {
                $db = Yii::$app->db;
                $db->createCommand('SET FOREIGN_KEY_CHECKS=0')->execute();
                $tables = $db->createCommand('SHOW TABLES')->queryColumn();
                foreach ($tables as $t) {
                    $db->createCommand('DROP TABLE IF EXISTS `' . $t . '`')->execute();
                }
                $db->createCommand('SET FOREIGN_KEY_CHECKS=1')->execute();
                $db->schema->refresh();
                $steps['drop'] = ['droppedTables' => count($tables)];
            } catch (\Throwable $e) {
                Yii::$app->response->statusCode = 500;
                return ['error' => 'drop failed: ' . substr($e->getMessage(), 0, 200)];
            }
        }

        $php = is_file('/usr/local/bin/php') ? '/usr/local/bin/php' : 'php';
        $yii = Yii::getAlias('@app/yii');
        foreach ([
            'migrate' => 'migrate --interactive=0',
            'seed' => 'seed/launch-city --interactive=0',
            'demo' => 'demo/seed --interactive=0',
        ] as $name => $cmd) {
            $o = [];
            $c = 0;
            @exec("{$php} " . escapeshellarg($yii) . " {$cmd} 2>&1", $o, $c);
            $step = ['exit' => $c, 'tail' => array_slice($o, -8)];
            if ($c !== 0) {
                foreach ($o as $ln) {
                    if (stripos($ln, 'SQLSTATE') !== false || stripos($ln, "with message") !== false) {
                        $step['sqlError'] = substr($ln, 0, 500);
                        break;
                    }
                }
            }
            $steps[$name] = $step;
        }
        return ['ran' => true, 'steps' => $steps, 'next' => 'Check /health, then log in. Remove SETUP_KEY afterwards.'];
    }
}
