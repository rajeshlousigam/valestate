<?php

declare(strict_types=1);

namespace app\models;

use app\services\JwtService;
use Yii;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

/**
 * User identity (docs/03, docs/08 §7.1).
 *
 * @property int $id
 * @property string $uuid
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string $password_hash
 * @property string $status
 * @property string|null $email_verified_at
 * @property string|null $phone_verified_at
 * @property string $created_at
 * @property string $updated_at
 */
class User extends ActiveRecord implements IdentityInterface
{
    public const STATUS_REGISTERED = 'REGISTERED';
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_SUSPENDED = 'SUSPENDED';
    public const STATUS_DEACTIVATED = 'DEACTIVATED';
    public const STATUS_BANNED = 'BANNED';

    public static function tableName(): string
    {
        return 'users';
    }

    public function rules(): array
    {
        return [
            [['name', 'email', 'password_hash'], 'required'],
            [['email'], 'email'],
            [['email'], 'unique'],
            [['phone'], 'unique'],
            [['name', 'email'], 'trim'],
            // Normalise empty phone to NULL so a missing phone never collides on the unique index.
            [['phone'], 'filter', 'filter' => static fn ($v) => ($v === null || trim((string) $v) === '') ? null : trim((string) $v)],
            [['status'], 'in', 'range' => [
                self::STATUS_REGISTERED, self::STATUS_ACTIVE, self::STATUS_SUSPENDED,
                self::STATUS_DEACTIVATED, self::STATUS_BANNED,
            ]],
        ];
    }

    // ---- password ----

    public function setPassword(string $password): void
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    public function validatePassword(string $password): bool
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    public function canLogin(): bool
    {
        return in_array($this->status, [self::STATUS_REGISTERED, self::STATUS_ACTIVE, self::STATUS_SUSPENDED], true);
    }

    // ---- roles (docs/03) ----

    /** @return string[] role keys, e.g. ['owner','buyer'] */
    public function getRoleKeys(): array
    {
        return (new \yii\db\Query())
            ->select('r.key')
            ->from('roles r')
            ->innerJoin('user_roles ur', 'ur.role_id = r.id')
            ->where(['ur.user_id' => $this->id])
            ->column();
    }

    public function assignRole(string $roleKey): void
    {
        $roleId = (new \yii\db\Query())->select('id')->from('roles')->where(['key' => $roleKey])->scalar();
        if ($roleId === false) {
            throw new \InvalidArgumentException("Unknown role: {$roleKey}");
        }
        Yii::$app->db->createCommand()->insert('user_roles', [
            'user_id' => $this->id,
            'role_id' => $roleId,
        ])->execute();
    }

    // ---- IdentityInterface (stateless JWT, docs/10) ----

    public static function findIdentity($id): ?IdentityInterface
    {
        return static::findOne(['uuid' => $id]);
    }

    public static function findIdentityByAccessToken($token, $type = null): ?IdentityInterface
    {
        try {
            $claims = JwtService::verify((string) $token);
        } catch (\Throwable $e) {
            return null;
        }
        $user = static::findOne(['uuid' => $claims->sub ?? null]);
        return ($user && $user->canLogin()) ? $user : null;
    }

    public function getId(): string
    {
        return $this->uuid;
    }

    public function getAuthKey(): ?string
    {
        return null; // not used (stateless)
    }

    public function validateAuthKey($authKey): bool
    {
        return false;
    }

    public function publicProfile(): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'roles' => $this->getRoleKeys(),
            'emailVerified' => $this->email_verified_at !== null,
            'phoneVerified' => $this->phone_verified_at !== null,
        ];
    }
}
