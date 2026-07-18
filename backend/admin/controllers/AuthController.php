<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\models\User;
use Yii;
use yii\web\Controller;
use yii\web\ErrorAction;

class AuthController extends Controller
{
    public $layout = 'main';

    private const STAFF_ROLES = ['verifier', 'ops_manager', 'moderator', 'admin', 'super_admin'];

    public function actions(): array
    {
        return [
            'error' => ['class' => ErrorAction::class],
        ];
    }

    public function actionLogin(): mixed
    {
        if (!Yii::$app->user->isGuest) {
            return $this->redirect(['/dashboard/index']);
        }
        $error = null;
        if (Yii::$app->request->isPost) {
            $email = strtolower(trim((string) Yii::$app->request->post('email')));
            $password = (string) Yii::$app->request->post('password');
            $u = User::findOne(['email' => $email]);
            $isStaff = $u && count(array_intersect(self::STAFF_ROLES, $u->getRoleKeys())) > 0;
            if ($u && $isStaff && $u->canLogin() && $u->validatePassword($password)) {
                Yii::$app->user->login($u, 0);
                return $this->redirect(['/dashboard/index']);
            }
            $error = 'Invalid credentials, or this is not a staff account.';
        }
        return $this->render('login', ['error' => $error]);
    }

    public function actionLogout(): mixed
    {
        Yii::$app->user->logout();
        return $this->redirect(['/auth/login']);
    }
}
