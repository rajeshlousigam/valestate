<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\models\User;
use Yii;
use yii\web\Controller;
use yii\web\ForbiddenHttpException;

/** Base for authenticated admin pages — staff only (docs/03, docs/18). */
abstract class BaseAuthedController extends Controller
{
    public $layout = 'main';

    protected const STAFF_ROLES = ['verifier', 'ops_manager', 'moderator', 'admin', 'super_admin'];

    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }
        if (Yii::$app->user->isGuest) {
            Yii::$app->response->redirect(['/auth/login']);
            return false;
        }
        if (count(array_intersect(self::STAFF_ROLES, $this->me()->getRoleKeys())) === 0) {
            throw new ForbiddenHttpException('Staff access only');
        }
        return true;
    }

    protected function me(): User
    {
        /** @var User $u */
        $u = Yii::$app->user->identity;
        return $u;
    }
}
