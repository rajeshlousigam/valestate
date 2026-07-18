<?php

declare(strict_types=1);

namespace app\modules\iam;

/**
 * Identity & Access bounded context (docs/04 §6, docs/03).
 */
class Module extends \yii\base\Module
{
    public $controllerNamespace = 'app\\modules\\iam\\controllers';
}
