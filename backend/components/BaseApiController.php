<?php

declare(strict_types=1);

namespace app\components;

use app\models\User;
use Yii;
use yii\filters\auth\HttpBearerAuth;
use yii\web\Controller;
use yii\web\ForbiddenHttpException;

/**
 * Base for authenticated API controllers (docs/09, docs/10).
 * - JWT bearer auth on every action (stateless).
 * - RBAC role helpers (server is source of truth — docs/03 §8.1).
 * - Standard response envelopes (docs/09 §6).
 */
abstract class BaseApiController extends Controller
{
    public $enableCsrfValidation = false;

    /** Actions that do NOT require authentication (e.g. public catalog). */
    protected array $publicActions = [];

    public function behaviors(): array
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => $this->publicActions,
        ];
        return $behaviors;
    }

    protected function user(): User
    {
        /** @var User $u */
        $u = Yii::$app->user->identity;
        return $u;
    }

    /** @return string[] */
    protected function roles(): array
    {
        return Yii::$app->user->isGuest ? [] : $this->user()->getRoleKeys();
    }

    protected function hasAnyRole(array $roles): bool
    {
        return count(array_intersect($roles, $this->roles())) > 0;
    }

    /** @throws ForbiddenHttpException */
    protected function requireAnyRole(array $roles): void
    {
        if (!$this->hasAnyRole($roles)) {
            throw new ForbiddenHttpException('Insufficient permissions');
        }
    }

    // ---- envelopes ----

    protected function ok(mixed $data, array $meta = []): array
    {
        return $meta ? ['data' => $data, 'meta' => $meta] : ['data' => $data];
    }

    protected function created(mixed $data): array
    {
        Yii::$app->response->statusCode = 201;
        return ['data' => $data];
    }

    protected function noContent(): array
    {
        Yii::$app->response->statusCode = 204;
        return [];
    }

    protected function unprocessable(array $details, string $message = 'Validation failed'): array
    {
        Yii::$app->response->statusCode = 422;
        return ['error' => ['code' => 'UNPROCESSABLE', 'message' => $message, 'details' => $details]];
    }

    protected function conflict(string $message): array
    {
        Yii::$app->response->statusCode = 409;
        return ['error' => ['code' => 'CONFLICT', 'message' => $message]];
    }

    protected function body(): array
    {
        return Yii::$app->request->getBodyParams();
    }
}
