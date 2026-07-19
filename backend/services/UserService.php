<?php

declare(strict_types=1);

namespace app\services;

use app\components\Uuid;
use app\models\Listing;
use app\models\Property;
use app\models\User;
use Yii;
use yii\db\Query;

/** User + RBAC administration (docs/03, docs/18). Admin/super-admin only (enforced in controller). */
final class UserService
{
    /** @param string[] $roleKeys */
    public static function create(array $data, array $roleKeys, User $actor): User
    {
        $u = new User();
        $u->uuid = Uuid::v4();
        $u->name = trim((string) ($data['name'] ?? ''));
        $u->email = strtolower(trim((string) ($data['email'] ?? '')));
        $u->phone = !empty($data['phone']) ? trim((string) $data['phone']) : null;
        $u->status = User::STATUS_ACTIVE;
        if (strlen((string) ($data['password'] ?? '')) < 8) {
            throw new ServiceException(ServiceException::UNPROCESSABLE, 'Password must be at least 8 characters');
        }
        $u->setPassword((string) $data['password']);
        if (!$u->validate()) {
            $first = '';
            foreach ($u->getErrors() as $errs) {
                $first = $errs[0] ?? '';
                break;
            }
            throw new ServiceException(ServiceException::UNPROCESSABLE, $first ?: 'Invalid user');
        }
        $tx = Yii::$app->db->beginTransaction();
        try {
            $u->save(false);
            self::applyRoles($u, $roleKeys);
            AuditService::log($actor->uuid, 'user.create', 'User', $u->uuid, ['roles' => implode(',', $roleKeys)]);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
        return $u;
    }

    /** @param string[] $roleKeys */
    public static function setRoles(User $u, array $roleKeys, User $actor): void
    {
        $tx = Yii::$app->db->beginTransaction();
        try {
            Yii::$app->db->createCommand()->delete('user_roles', ['user_id' => $u->id])->execute();
            self::applyRoles($u, $roleKeys);
            AuditService::log($actor->uuid, 'user.roles', 'User', $u->uuid, ['roles' => implode(',', $roleKeys)]);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    public static function setStatus(User $u, string $status, User $actor): void
    {
        $allowed = [User::STATUS_ACTIVE, User::STATUS_SUSPENDED, User::STATUS_BANNED, User::STATUS_DEACTIVATED];
        if (!in_array($status, $allowed, true)) {
            throw new ServiceException(ServiceException::UNPROCESSABLE, 'Invalid status');
        }
        $tx = Yii::$app->db->beginTransaction();
        try {
            $u->status = $status;
            $u->save(false);
            // Suspending/banning unpublishes the user's live listings (docs/03 BR-03.5).
            if (in_array($status, [User::STATUS_SUSPENDED, User::STATUS_BANNED], true)) {
                $propIds = (new Query())->select('id')->from('properties')
                    ->where(['owner_id' => $u->id, 'status' => Property::PUBLISHED])->column();
                if ($propIds) {
                    Yii::$app->db->createCommand()->update('listings',
                        ['visibility' => Listing::HIDDEN, 'unpublished_at' => gmdate('Y-m-d H:i:s')],
                        ['property_id' => $propIds])->execute();
                    Yii::$app->db->createCommand()->update('properties',
                        ['status' => Property::UNPUBLISHED], ['id' => $propIds])->execute();
                }
            }
            AuditService::log($actor->uuid, 'user.status', 'User', $u->uuid, ['status' => $status]);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    public static function createRole(string $key, string $name, User $actor): void
    {
        $key = strtolower(trim($key));
        if (!preg_match('/^[a-z][a-z0-9_]{1,39}$/', $key)) {
            throw new ServiceException(ServiceException::UNPROCESSABLE, 'Role key must be lowercase letters/digits/underscore');
        }
        if ((new Query())->from('roles')->where(['key' => $key])->exists()) {
            throw new ServiceException(ServiceException::CONFLICT, "Role '{$key}' already exists");
        }
        Yii::$app->db->createCommand()->insert('roles', ['key' => $key, 'name' => trim($name) ?: $key])->execute();
        AuditService::log($actor->uuid, 'rbac.role_create', 'Role', $key);
    }

    /** @return array<int,array{key:string,name:string}> */
    public static function allRoles(): array
    {
        return (new Query())->select(['key', 'name'])->from('roles')->orderBy(['id' => SORT_ASC])->all();
    }

    /** @param string[] $roleKeys */
    private static function applyRoles(User $u, array $roleKeys): void
    {
        foreach (array_unique($roleKeys) as $key) {
            if ((new Query())->from('roles')->where(['key' => $key])->exists()) {
                Yii::$app->db->createCommand()->insert('user_roles', [
                    'user_id' => $u->id,
                    'role_id' => (new Query())->select('id')->from('roles')->where(['key' => $key])->scalar(),
                ])->execute();
            }
        }
    }
}
