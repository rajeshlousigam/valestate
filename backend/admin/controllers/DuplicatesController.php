<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\services\DuplicateService;

/** Cross-catalog duplicate scan (docs/07 §8). */
class DuplicatesController extends BaseAuthedController
{
    public function actionScan(): string
    {
        return $this->render('scan', ['pairs' => DuplicateService::scanAll()]);
    }
}
