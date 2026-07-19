<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\models\User;
use app\services\ServiceException;
use app\services\UserService;
use Yii;
use yii\db\Query;
use yii\web\NotFoundHttpException;
use yii\web\Response;

/** User + RBAC management — admin / super-admin only (docs/03, docs/18). */
class UsersController extends BaseAuthedController
{
    private const ADMINS = ['admin', 'super_admin'];

    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }
        $this->requireRoles(self::ADMINS);
        return true;
    }

    public function actionIndex(): string
    {
        $users = (new Query())
            ->select(['u.id', 'u.uuid', 'u.name', 'u.email', 'u.phone', 'u.status',
                'GROUP_CONCAT(r.key ORDER BY r.key SEPARATOR ",") AS roles'])
            ->from('users u')
            ->leftJoin('user_roles ur', 'ur.user_id = u.id')
            ->leftJoin('roles r', 'r.id = ur.role_id')
            ->groupBy('u.id')
            ->orderBy(['u.id' => SORT_DESC])->limit(200)->all();
        return $this->render('index', ['users' => $users, 'roles' => UserService::allRoles()]);
    }

    public function actionCreate(): Response|string
    {
        if (Yii::$app->request->isPost) {
            $roles = (array) Yii::$app->request->post('roles', []);
            try {
                $u = UserService::create([
                    'name' => Yii::$app->request->post('name'),
                    'email' => Yii::$app->request->post('email'),
                    'phone' => Yii::$app->request->post('phone'),
                    'password' => Yii::$app->request->post('password'),
                ], $roles, $this->me());
                Yii::$app->session->setFlash('success', "User {$u->email} created.");
                return $this->redirect(['/users']);
            } catch (ServiceException $e) {
                Yii::$app->session->setFlash('error', $e->getMessage());
            }
        }
        return $this->render('create', ['roles' => UserService::allRoles()]);
    }

    public function actionRoles(int $id): Response
    {
        $u = $this->findUser($id);
        if (Yii::$app->request->isPost) {
            UserService::setRoles($u, (array) Yii::$app->request->post('roles', []), $this->me());
            Yii::$app->session->setFlash('success', "Roles updated for {$u->email}.");
        }
        return $this->redirect(['/users']);
    }

    public function actionStatus(int $id): Response
    {
        $u = $this->findUser($id);
        if (Yii::$app->request->isPost) {
            try {
                UserService::setStatus($u, (string) Yii::$app->request->post('status', ''), $this->me());
                Yii::$app->session->setFlash('success', "Status updated for {$u->email}.");
            } catch (ServiceException $e) {
                Yii::$app->session->setFlash('error', $e->getMessage());
            }
        }
        return $this->redirect(['/users']);
    }

    public function actionRoleCreate(): Response
    {
        if (Yii::$app->request->isPost) {
            try {
                UserService::createRole((string) Yii::$app->request->post('key', ''), (string) Yii::$app->request->post('name', ''), $this->me());
                Yii::$app->session->setFlash('success', 'Role created.');
            } catch (ServiceException $e) {
                Yii::$app->session->setFlash('error', $e->getMessage());
            }
        }
        return $this->redirect(['/users']);
    }

    private function findUser(int $id): User
    {
        $u = User::findOne(['id' => $id]);
        if (!$u) {
            throw new NotFoundHttpException('User not found');
        }
        return $u;
    }
}
