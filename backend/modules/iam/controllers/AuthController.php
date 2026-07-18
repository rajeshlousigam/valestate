<?php

declare(strict_types=1);

namespace app\modules\iam\controllers;

use app\models\User;
use app\services\JwtService;
use Yii;
use yii\filters\auth\HttpBearerAuth;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\web\UnauthorizedHttpException;

/**
 * Auth endpoints (docs/09 §8.1, docs/10 §5).
 * Phase 0: register / login / refresh(rotation+reuse-detection) / logout / me.
 */
class AuthController extends Controller
{
    public $enableCsrfValidation = false;

    public function behaviors(): array
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'only' => ['me'], // public: register, login, refresh, logout
        ];
        return $behaviors;
    }

    public function actionRegister(): array
    {
        $body = Yii::$app->request->getBodyParams();
        $as = $body['as'] ?? 'buyer';
        if (!in_array($as, ['buyer', 'owner'], true)) {
            $as = 'buyer';
        }

        $user = new User();
        $user->uuid = self::uuid();
        $user->name = trim((string) ($body['name'] ?? ''));
        $user->email = strtolower(trim((string) ($body['email'] ?? '')));
        $user->phone = isset($body['phone']) ? trim((string) $body['phone']) : null;
        $user->status = User::STATUS_REGISTERED;

        if (empty($body['password']) || strlen((string) $body['password']) < 8) {
            return $this->unprocessable([['field' => 'password', 'issue' => 'min length 8']]);
        }
        $user->setPassword((string) $body['password']);

        if (!$user->validate()) {
            return $this->unprocessable($this->flattenErrors($user->getErrors()));
        }

        $tx = Yii::$app->db->beginTransaction();
        try {
            $user->save(false);
            $user->assignRole($as);
            $this->emitOutbox('User', $user->uuid, 'IAM.UserRegistered', [
                'userId' => $user->uuid, 'role' => $as,
            ]);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }

        Yii::$app->response->statusCode = 201;
        return $this->tokenResponse($user);
    }

    public function actionLogin(): array
    {
        $body = Yii::$app->request->getBodyParams();
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        $user = User::findOne(['email' => $email]);
        if (!$user || !$user->validatePassword($password)) {
            throw new UnauthorizedHttpException('Invalid credentials');
        }
        if (!$user->canLogin()) {
            throw new UnauthorizedHttpException('Account not permitted to log in');
        }

        return $this->tokenResponse($user);
    }

    public function actionRefresh(): array
    {
        $body = Yii::$app->request->getBodyParams();
        $raw = (string) ($body['refreshToken'] ?? '');
        if ($raw === '') {
            throw new BadRequestHttpException('refreshToken required');
        }
        $hash = JwtService::hashRefresh($raw);

        $row = (new \yii\db\Query())->from('refresh_tokens')->where(['token_hash' => $hash])->one();
        if (!$row) {
            throw new UnauthorizedHttpException('Invalid refresh token');
        }

        // Reuse detection (docs/10 §5.1): a revoked token presented again ⇒ revoke whole family.
        if ($row['revoked_at'] !== null) {
            Yii::$app->db->createCommand()->update('refresh_tokens',
                ['revoked_at' => gmdate('Y-m-d H:i:s')],
                ['user_id' => $row['user_id'], 'revoked_at' => null]
            )->execute();
            throw new UnauthorizedHttpException('Refresh token reuse detected; session revoked');
        }
        if (strtotime((string) $row['expires_at']) < time()) {
            throw new UnauthorizedHttpException('Refresh token expired');
        }

        $user = User::findOne(['id' => $row['user_id']]);
        if (!$user || !$user->canLogin()) {
            throw new UnauthorizedHttpException('Account not permitted');
        }

        // Rotate: revoke old, issue new.
        Yii::$app->db->createCommand()->update('refresh_tokens',
            ['revoked_at' => gmdate('Y-m-d H:i:s')], ['id' => $row['id']]
        )->execute();

        return $this->tokenResponse($user, (string) ($row['device_id'] ?? ''));
    }

    public function actionLogout(): array
    {
        $body = Yii::$app->request->getBodyParams();
        $raw = (string) ($body['refreshToken'] ?? '');
        if ($raw !== '') {
            $hash = JwtService::hashRefresh($raw);
            Yii::$app->db->createCommand()->update('refresh_tokens',
                ['revoked_at' => gmdate('Y-m-d H:i:s')],
                ['token_hash' => $hash, 'revoked_at' => null]
            )->execute();
        }
        Yii::$app->response->statusCode = 204;
        return [];
    }

    public function actionMe(): array
    {
        /** @var User $user */
        $user = Yii::$app->user->identity;
        return ['data' => $user->publicProfile()];
    }

    // ---- helpers ----

    private function tokenResponse(User $user, string $deviceId = ''): array
    {
        $access = JwtService::issueAccessToken($user->uuid, $user->getRoleKeys());
        $refresh = JwtService::newRefreshToken();

        Yii::$app->db->createCommand()->insert('refresh_tokens', [
            'user_id' => $user->id,
            'token_hash' => $refresh['hash'],
            'device_id' => $deviceId ?: null,
            'expires_at' => gmdate('Y-m-d H:i:s', time() + (int) Yii::$app->params['jwt']['refreshTtl']),
            'created_at' => gmdate('Y-m-d H:i:s'),
        ])->execute();

        return [
            'data' => [
                'user' => $user->publicProfile(),
                'accessToken' => $access['token'],
                'expiresIn' => $access['expiresIn'],
                'refreshToken' => $refresh['raw'],
            ],
        ];
    }

    private function emitOutbox(string $aggregateType, string $aggregateId, string $eventType, array $payload): void
    {
        Yii::$app->db->createCommand()->insert('outbox_events', [
            'aggregate_type' => $aggregateType,
            'aggregate_id' => $aggregateId,
            'event_type' => $eventType,
            'payload_json' => json_encode($payload, JSON_UNESCAPED_SLASHES),
            'version' => 1,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ])->execute();
    }

    private function unprocessable(array $details): array
    {
        Yii::$app->response->statusCode = 422;
        return ['error' => [
            'code' => 'UNPROCESSABLE',
            'message' => 'Validation failed',
            'details' => $details,
        ]];
    }

    private function flattenErrors(array $errors): array
    {
        $out = [];
        foreach ($errors as $field => $msgs) {
            foreach ((array) $msgs as $m) {
                $out[] = ['field' => $field, 'issue' => $m];
            }
        }
        return $out;
    }

    private static function uuid(): string
    {
        // UUIDv4 (docs/08 OQ-08.2 — ULID/UUIDv7 to be decided; v4 for Phase 0)
        $d = random_bytes(16);
        $d[6] = chr((ord($d[6]) & 0x0f) | 0x40);
        $d[8] = chr((ord($d[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
    }
}
