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
}
