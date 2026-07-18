<?php

declare(strict_types=1);

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'housepoint-api',
    'name' => 'HousePoint API',
    'basePath' => dirname(__DIR__),
    'timeZone' => 'UTC',
    'bootstrap' => ['log'],
    'aliases' => [
        '@app' => dirname(__DIR__),
    ],
    'controllerNamespace' => 'app\\controllers',
    'modules' => [
        'iam' => [
            'class' => \app\modules\iam\Module::class,
        ],
    ],
    'components' => [
        'request' => [
            'cookieValidationKey' => getenv('COOKIE_VALIDATION_KEY') ?: 'dev-cookie-key',
            'enableCsrfValidation' => false, // stateless API; JWT-based (docs/10)
            'parsers' => [
                'application/json' => \yii\web\JsonParser::class,
            ],
        ],
        'response' => [
            'format' => \yii\web\Response::FORMAT_JSON,
            'on beforeSend' => static function ($event): void {
                $response = $event->sender;
                // Standard error envelope (docs/09 §6.2)
                if ($response->data !== null && $response->statusCode >= 400 && isset($response->data['message'])) {
                    $response->data = [
                        'error' => [
                            'code' => $response->data['name'] ?? 'ERROR',
                            'message' => $response->data['message'],
                            'status' => $response->statusCode,
                            'requestId' => Yii::$app->requestId ?? null,
                        ],
                    ];
                }
            },
        ],
        'db' => $db,
        'redis' => [
            'class' => \yii\redis\Connection::class,
            'hostname' => getenv('REDIS_HOST') ?: '127.0.0.1',
            'port' => (int) (getenv('REDIS_PORT') ?: 6379),
            'database' => 0,
        ],
        'user' => [
            'identityClass' => \app\models\User::class,
            'enableAutoLogin' => false,
            'enableSession' => false,
            'loginUrl' => null,
        ],
        'errorHandler' => [
            'errorAction' => null,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => \yii\log\FileTarget::class,
                    'levels' => ['error', 'warning'],
                    'logVars' => [], // never log request vars (may contain PII/secrets) — docs/10
                ],
            ],
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => true,
            'rules' => [
                'GET  v1/health' => 'health/index',
                'POST v1/auth/register' => 'iam/auth/register',
                'POST v1/auth/login' => 'iam/auth/login',
                'POST v1/auth/refresh' => 'iam/auth/refresh',
                'POST v1/auth/logout' => 'iam/auth/logout',
                'GET  v1/me' => 'iam/auth/me',
            ],
        ],
    ],
    'params' => $params,
];

if (YII_ENV === 'dev') {
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => \yii\debug\Module::class,
        'allowedIPs' => ['*'],
    ];
}

return $config;
