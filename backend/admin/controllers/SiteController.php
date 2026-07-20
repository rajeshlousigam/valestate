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
        try {
            Yii::$app->db->createCommand('SELECT 1')->queryScalar();
            $out['db'] = 'connected';
            $out['counts'] = [
                'users' => (int) (new Query())->from('users')->count(),
                'roles' => (int) (new Query())->from('roles')->count(),
                'localities' => (int) (new Query())->from('localities')->count(),
                'properties' => (int) (new Query())->from('properties')->count(),
            ];
            $out['adminAccountSeeded'] = (new Query())->from('users')->where(['email' => 'admin@valestate.test'])->exists();
            $out['ready'] = $out['counts']['users'] > 0;
            if (!$out['ready']) {
                $out['hint'] = 'DB connected but empty — migrate/seed did not run. Check RUN_MIGRATIONS/RUN_SEED and the deploy logs.';
            }
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 503;
            $out['db'] = 'error';
            // shows the DB error (host/user may appear; never the password) to aid debugging
            $out['error'] = substr($e->getMessage(), 0, 300);
            $out['hint'] = 'Cannot reach the database. Check DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD and DB_SSL=1 (Aiven requires TLS).';
        }
        return $out;
    }
}
