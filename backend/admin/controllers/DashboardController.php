<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\models\Property;
use app\models\VerificationCase;
use yii\db\Query;

class DashboardController extends BaseAuthedController
{
    public function actionIndex(): string
    {
        $counts = [
            'open' => (int) (new Query())->from('verification_cases')->where(['state' => VerificationCase::OPEN_STATES])->count(),
            'unclaimed' => (int) (new Query())->from('verification_cases')->where(['state' => VerificationCase::UNCLAIMED])->count(),
            'published' => (int) (new Query())->from('properties')->where(['status' => Property::PUBLISHED])->count(),
            'rejected' => (int) (new Query())->from('properties')->where(['status' => Property::REJECTED])->count(),
        ];
        return $this->render('index', ['counts' => $counts, 'me' => $this->me()]);
    }
}
