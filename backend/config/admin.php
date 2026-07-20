<?php

declare(strict_types=1);

// Admin console — a SEPARATE Yii web application instance (session-based),
// distinct from the stateless JWT REST API (config/web.php). Reuses the same
// models + VerificationService so verification behaviour can't diverge (docs/18).

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'valestate-admin',
    'name' => 'ValEstate Admin',
    'basePath' => dirname(__DIR__),
    'timeZone' => 'UTC',
    'aliases' => ['@app' => dirname(__DIR__)],
    'controllerNamespace' => 'app\\admin\\controllers',
    'viewPath' => '@app/admin/views',
    'bootstrap' => ['log'],
    'components' => [
        'request' => [
            'cookieValidationKey' => getenv('COOKIE_VALIDATION_KEY') ?: 'dev-cookie-key',
            'enableCsrfValidation' => true,
        ],
        'db' => $db,
        'redis' => [
            'class' => \yii\redis\Connection::class,
            'hostname' => getenv('REDIS_HOST') ?: '127.0.0.1',
            'port' => (int) (getenv('REDIS_PORT') ?: 6379),
        ],
        'session' => [
            'class' => \yii\web\Session::class,
            'name' => 'VE_ADMIN_SESS',
        ],
        'user' => [
            'identityClass' => \app\models\User::class,
            'enableSession' => true,
            'enableAutoLogin' => false,
            'loginUrl' => ['auth/login'],
            'idParam' => '__admin_user',
        ],
        'errorHandler' => [
            'errorAction' => 'auth/error',
        ],
        'log' => [
            'targets' => [
                [
                    'class' => \yii\log\FileTarget::class,
                    'levels' => ['error', 'warning'],
                    'logVars' => [],
                ],
            ],
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => false,
            'rules' => [
                '' => 'dashboard/index',
                'health' => 'site/health',
                'setup' => 'site/setup',
                'login' => 'auth/login',
                'logout' => 'auth/logout',
                'verification' => 'verification/queue',
                'verification/<id:\d+>' => 'verification/view',
                'verification/<id:\d+>/claim' => 'verification/claim',
                'verification/<id:\d+>/checklist' => 'verification/checklist',
                'verification/<id:\d+>/decision' => 'verification/decision',
                'verification/<id:\d+>/request-info' => 'verification/request-info',
                'verification/<id:\d+>/document/<docId:\d+>' => 'verification/document',

                'listings/published' => 'listings/published',
                'listings/rejected' => 'listings/rejected',
                'listings/reopen/<id:\d+>' => 'listings/reopen',
                'listings/reverify/<id:\d+>' => 'listings/reverify',

                'duplicates' => 'duplicates/scan',

                'users' => 'users/index',
                'users/create' => 'users/create',
                'users/<id:\d+>/roles' => 'users/roles',
                'users/<id:\d+>/status' => 'users/status',
                'roles/create' => 'users/role-create',
            ],
        ],
    ],
    'params' => $params,
];

return $config;
