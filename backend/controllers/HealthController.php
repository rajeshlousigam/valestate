<?php

declare(strict_types=1);

namespace app\controllers;

use Yii;
use yii\web\Controller;

/**
 * Liveness/readiness probe (docs/09 §8.4, docs/20 observability).
 * GET /v1/health
 */
class HealthController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex(): array
    {
        $checks = [
            'db' => $this->checkDb(),
            'redis' => $this->checkRedis(),
        ];

        // DB is required; Redis is optional (not provisioned on the free tier).
        $ok = $checks['db']['ok'] === true;
        Yii::$app->response->statusCode = $ok ? 200 : 503;

        return [
            'status' => $ok ? ($checks['redis']['ok'] ? 'ok' : 'ok-no-redis') : 'down',
            'service' => 'valestate-api',
            'version' => 'v1',
            'city' => Yii::$app->params['launchCity']['city'] ?? null,
            'time' => gmdate('c'),
            'checks' => $checks,
        ];
    }

    private function checkDb(): array
    {
        try {
            Yii::$app->db->createCommand('SELECT 1')->queryScalar();
            return ['ok' => true];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => YII_DEBUG ? $e->getMessage() : 'unavailable'];
        }
    }

    private function checkRedis(): array
    {
        try {
            Yii::$app->redis->ping();
            return ['ok' => true];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => YII_DEBUG ? $e->getMessage() : 'unavailable'];
        }
    }
}
